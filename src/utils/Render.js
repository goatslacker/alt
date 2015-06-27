import React, { PropTypes } from 'react'

const STAT = {
  READY: 0,
  DONE: 1,
  LOADING: 2,
  FAILED: 3
}

function shallowEqual(a, b) {
  if (a === b) return true
  if (!a || !b) return false
  for (let k in a) {
    if (a.hasOwnProperty(k) && (!b.hasOwnProperty(k) || a[k] !== b[k])) {
      return false
    }
  }
  for (let k in b) {
    if (b.hasOwnProperty(k) && !a.hasOwnProperty(k)) {
      return false
    }
  }
  return true
}

function usingDispatchBuffer(altDispatchBuffer, Component) {
  function resolve(f, ...args) {
    const token = altDispatchBuffer.getPromise(f, args)
    if (token) return token
    const promise = f(...args)
    altDispatchBuffer.savePromise(f, args, promise)
    return promise
  }

  return React.createClass({
    childContextTypes: {
      universalId: PropTypes.string.isRequired,
      altDispatchBuffer: PropTypes.object.isRequired,
      resolve: PropTypes.func.isRequired,
    },

    getChildContext() {
      return {
        universalId: 'root',
        altDispatchBuffer,
        resolve,
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
    this.promises = []
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

  getPromise(f, args) {
    const res = this.promises.filter((o) => {
      // same function
      // same length
      // every arg shallowEquals itself
      return o.f === f &&
        o.args.length === args.length &&
        o.args.every((arg, i) => shallowEqual(arg, args[i]))
    })

    return res.length ? res[0].promise : null
  }

  savePromise(f, args, promise) {
    this.promises.push({ f, args, promise })
  }

  clear() {
    this.promisesBuffer = []
    this.promises = []
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

  drain() {
    // fire off all the actions synchronously
    this.dispatches.forEach((f) => {
      if (Array.isArray(f)) {
        f.forEach(x => x())
      } else {
        f()
      }
    })
  }

  render(alt, Element, info) {
    alt.recycle()

    const startTime = Date.now()
    const i = info.i || 0

    this.drain()

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
      return Promise.all(this.promisesBuffer).then((actions) => {
        // add the dispatches to our queue
        this.dispatches = this.dispatches.concat(actions)

        // clear the buffer and call render again
        this.promisesBuffer = []

        info.i = i + 1
        info.time = info.time + (Date.now() - startTime)

        return this.render(alt, Element, info)
      }).catch((actions) => {
        this.dispatches = this.dispatches.concat(actions)
        this.drain()
        const errorHtml = this.renderStrategy(Element)
        return this.resolve(true, errorHtml, alt, Element, i)
      })
    } else {
      return this.resolve(false, html, alt, Element, i)
    }
  }
}

function renderWithStrategy(strategy) {
  return (alt, Component, props, info) => {
    alt.trapAsync = true

    // create a buffer and use context to pass it through to the components
    const altDispatchBuffer = new DispatchBuffer((Node) => {
      return React[strategy](Node)
    })
    const Container = usingDispatchBuffer(altDispatchBuffer, Component)

    // cache the element
    const Element = React.createElement(Container, props)

    const start = Date.now()

    return altDispatchBuffer.render(alt, Element, info).then((obj) => {
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
      propTypes: Spec.propTypes || {},

      contextTypes: {
        universalId: PropTypes.string.isRequired,
        altDispatchBuffer: PropTypes.object.isRequired,
        resolve: PropTypes.func.isRequired,
      },

      childContextTypes: {
        universalId: PropTypes.string.isRequired,
        altDispatchBuffer: PropTypes.object.isRequired,
        resolve: PropTypes.func.isRequired,
      },

      getChildContext() {
        const children = this.props.children || []
        const universalId = `${this.context.universalId}.${children.length}`
        return {
          universalId,
          altDispatchBuffer: this.context.altDispatchBuffer,
          resolve: this.context.resolve,
        }
      },

      getInitialState() {
        const stores = Spec.listenTo
          ? Spec.listenTo(this.props, this.context)
          : []
        return {
          stores,
          status: this.context.altDispatchBuffer.getStatus(this.context.universalId),
          props: this.reduceProps(stores)
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
        this.storeListeners = this.state.stores.map((store) => {
          return store.listen(this.onChange)
        })

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
        // clear pending cache so things can be refreshed if they need to
        this.context.altDispatchBuffer.clear()

        // set the new state
        this.setState({ props: this.reduceProps(this.state.stores) })
      },

      reduceProps(stores) {
        if (Spec.reduceProps) {
          return Spec.reduceProps(this.props, this.context) || {}
        } else if (Component.propTypes) {
          // XXX throw error if not listening to any stores?
          const keys = Object.keys(Component.propTypes)
          return stores.reduce((props, store) => {
            keys.forEach(key => props[key] = store.state[key])
            return props
          }, {})
        } else {
          throw new Error(
            'reduceProps was not defined and propTypes are ' +
            'not defined in your component, define one or the other.'
          )
        }
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
          this.context.altDispatchBuffer.push(this.context.universalId, promise)
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
            return null
        }
      }
    })
  }

  // works as a decorator or as a function
  // you can also define the items as static methods/props on your component
  if (MaybeComponent) {
    return bind(MaybeComponent)
  } else {
    return typeof Spec === 'object' && Spec.render === undefined
      ? Component => bind(Component)
      : bind(Spec)
  }
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
    const altDispatchBuffer = new DispatchBuffer()

    if (opts.status) altDispatchBuffer.status = opts.status
    const Node = usingDispatchBuffer(altDispatchBuffer, Component)
    const Element = React.createElement(Node, props)
    altDispatchBuffer.clear()
    return Promise.resolve(Element)
  }

  toDOM(Component, props, documentNode, opts = {}) {
    return this.getReady(Component, props, opts).then((Element) => {
      return React.render(Element, documentNode)
    })
  }

  static connect = connect
}
