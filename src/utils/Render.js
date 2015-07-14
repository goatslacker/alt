import React from 'react'

const STAT = {
  READY: 0,
  DONE: 1,
  LOADING: 2,
  FAILED: 3
}

function usingDispatchBuffer(buffer, Component) {
  return React.createClass({
    childContextTypes: {
      universalId: React.PropTypes.string.isRequired,
      buffer: React.PropTypes.object.isRequired
    },

    getChildContext() {
      return {
        universalId: 'root',
        buffer
      }
    },

    render() {
      return React.createElement(Component, this.props)
    }
  })
}

class DispatchBuffer {
  constructor(renderStrategy) {
    this.promisesBuffer = []
    this.status = {}
    this.dispatches = []
    this.renderStrategy = renderStrategy
  }

  push(id, promise) {
    this.promisesBuffer.push(promise)
    promise.then(
      () => this.status[id] = STAT.DONE,
      () => this.status[id] = STAT.FAILED
    )
  }

  getStatus(id) {
    return this.status[id] || STAT.READY
  }

  clear() {
    this.promisesBuffer = []
  }

  resolve(error, html, alt, Element, i) {
    return Promise.resolve({
      error,
      html,
      state: alt.flush(),
      buffer: {
        status: this.status
      },
      element: Element,
      diagnostics: {
        iterations: i,
        dispatches: this.dispatches.length
      }
    })
  }

  render(alt, Element, info) {
    alt.recycle()

    const startTime = Date.now()
    const i = info.i || 0

    // fire off all the actions synchronously
    this.dispatches.forEach((f) => {
      if (Array.isArray(f)) {
        f.forEach(x => x())
      } else {
        f()
      }
    })

    // render the html
    const html = this.renderStrategy(Element)

    if (i >= info.maxIterations) {
      return this.resolve(
        new Error('Max number of iterations reached'),
        html,
        alt,
        Element,
        i
      )
    }

    if (info.time > info.timeout) {
      return this.resolve(
        new Error('Render timed out'),
        html,
        alt,
        Element,
        i
      )
    }

    // do we have new async queries we need to take care of?
    if (this.promisesBuffer.length) {
      // resolve them
      return Promise.all(this.promisesBuffer).then((data) => {
        // add the dispatches to our queue
        this.dispatches = this.dispatches.concat(data)

        // clear the buffer and call render again
        this.promisesBuffer = []

        info.i = i + 1
        info.time = info.time + (Date.now() - startTime)

        // this takes the rendering out of a Promise context
        // TODO test this concurrently
        return this.render(alt, Element, info)
      }).catch((error) => {
        const errorHtml = this.renderStrategy(Element)
        return this.resolve(error, errorHtml, alt, Element, i)
      })
    } else {
      return this.resolve(null, html, alt, Element, i)
    }
  }
}

function renderWithStrategy(strategy) {
  return (alt, Component, props, info) => {
    alt.buffer = true

    // create a buffer and use context to pass it through to the components
    const buffer = new DispatchBuffer((Node) => {
      return React[strategy](Node)
    })
    const Container = usingDispatchBuffer(buffer, Component)

    // cache the element
    const Element = React.createElement(Container, props)

    const start = Date.now()

    return buffer.render(alt, Element, info).then((obj) => {
      const time = Date.now() - start

      return {
        error: obj.error,
        html: obj.html,
        state: obj.state,
        buffer: obj.buffer,
        element: obj.element,
        diagnostics: {
          iterations: obj.diagnostics.iterations,
          dispatches: obj.diagnostics.dispatches,
          time
        }
      }
    })
  }
}

export function connect(Spec, MaybeComponent) {
  function bind(Component) {
    return React.createClass({
      contextTypes: {
        universalId: React.PropTypes.string.isRequired,
        buffer: React.PropTypes.object.isRequired
      },

      childContextTypes: {
        universalId: React.PropTypes.string.isRequired,
        buffer: React.PropTypes.object.isRequired
      },

      getChildContext() {
        const children = this.props.children || []
        const universalId = `${this.context.universalId}.${children.length}`
        return {
          universalId,
          buffer: this.context.buffer
        }
      },

      getInitialState() {
        return {
          status: this.context.buffer.getStatus(this.context.universalId),
          props: Spec.reduceProps(this.props, this.context) || {}
        }
      },

      componentWillReceiveProps(nextProps) {
        // resolve whenever props change
        if (Spec.resolveAsync) this.resolveAsyncClient(nextProps)

        if (Spec.willReceiveProps) {
          Spec.willReceiveProps(nextProps, this.props, this.context)
        }
      },

      componentWillMount() {
        // resolve when ready on server
        if (
          Spec.resolveAsync &&
          typeof window === 'undefined' &&
          this.state.status === STAT.READY
        ) {
          this.resolveAsyncServer()
        }

        if (Spec.willMount) Spec.willMount(this.props, this.context)
      },

      componentDidMount() {
        if (Spec.listenTo) {
          const stores = Spec.listenTo(this.props, this.context)
          this.storeListeners = stores.map((store) => {
            return store.listen(this.onChange)
          })
        }

        // resolve on client if failed from server
        if (Spec.resolveAsync && this.state.status === STAT.FAILED) {
          this.resolveAsyncClient(this.props)
        }

        if (Spec.didMount) Spec.didMount(this.props, this.context)
      },

      componentWillUnmount() {
        this.storeListeners.forEach(unlisten => unlisten())
      },

      onChange() {
        this.setState({
          props: Spec.reduceProps(this.props, this.context) || {}
        })
      },

      resolveAsyncClient(props) {
        // client side we setup a listener for loading and done
        const promise = Spec.resolveAsync(props, this.context)

        if (promise) {
          this.setState({ status: STAT.LOADING })
          promise.then(
            () => this.setState({ status: STAT.DONE }),
            () => this.setState({ status: STAT.FAILED })
          )
        }
      },

      resolveAsyncServer() {
        // server side we push it into our buffer
        const promise = Spec.resolveAsync(this.props, this.context)
        if (promise) {
          this.context.buffer.push(this.context.universalId, promise)
        }
      },

      renderIfValid(val) {
        return React.isValidElement(val)
          ? val
          : <Component {...val} />
      },

      render() {
        const { status } = this.state

        switch (status) {
          case STAT.READY:
            return null
          case STAT.DONE:
            return <Component {...this.state.props} />
          case STAT.LOADING:
            return Spec.loading
              ? this.renderIfValid(Spec.loading(this.props, this.context))
              : null
          case STAT.FAILED:
            return Spec.failed
              ? this.renderIfValid(Spec.failed(this.props, this.context))
              : null
          default:
            throw new Error('unrecognized status')
        }
      }
    })
  }

  // works as a decorator or as a function
  return MaybeComponent
    ? bind(MaybeComponent)
    : Component => bind(Component)
}

export default class Render {
  constructor(alt, options = {}) {
    this.alt = alt
    this.options = options

    // defaults
    // 500ms or 5 iteration max
    this.options.timeout = options.timeout || 500
    this.options.maxIterations = options.maxIterations || 5
  }

  toString(Component, props) {
    this.options.i = 0
    this.options.time = 0
    return renderWithStrategy('renderToString')(
      this.alt,
      Component,
      props,
      this.options
    )
  }

  toStaticMarkup(Component, props) {
    this.options.i = 0
    this.options.time = 0
    return renderWithStrategy('renderToStaticMarkup')(
      this.alt,
      Component,
      props,
      this.options
    )
  }

  getReady(Component, props, opts = {}) {
    const buffer = new DispatchBuffer()

    if (opts.status) buffer.status = opts.status
    const Node = usingDispatchBuffer(buffer, Component)
    const Element = React.createElement(Node, props)
    buffer.clear()
    return Promise.resolve(Element)
  }

  toDOM(Component, props, documentNode, opts = {}) {
    return this.getReady(Component, props, opts).then((Element) => {
      return React.render(Element, documentNode)
    })
  }

  static connect = connect
}
