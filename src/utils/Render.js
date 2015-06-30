import React from 'react'

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
    this.unlocked = false
    this.fetched = {}
    this.fulfilled = {}
    this.dispatches = []
    this.renderStrategy = renderStrategy
  }

  push(id, promise) {
    this.promisesBuffer.push(promise)
    promise.then(() => this.fulfilled[id] = true)
    this.fetched[id] = true
  }

  shouldFetch(id) {
    return !this.fetched[id]
  }

  shouldRender(id) {
    return this.fulfilled[id]
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
        fetched: this.fetched,
        fulfilled: this.fulfilled
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

        return this.render(alt, Element, info)
      }).catch((error) => {
        return this.resolve(error, html, alt, Element, i)
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

    buffer.unlocked = true
    if (opts.fetched) buffer.fetched = opts.fetched
    if (opts.fulfilled) buffer.fulfilled = opts.fulfilled
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

  static resolve(fetch, MaybeComponent) {
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
          return { fulfilled: false }
        },

        componentWillMount() {
          if (this.context.buffer.shouldFetch(this.context.universalId)) {
            const promise = fetch(this.props)
            this.context.buffer.push(this.context.universalId, promise)

            if (this.context.buffer.unlocked) {
              promise.then(() => {
                this.setState({ fulfilled: true })
              })
            }
          }
        },

        render() {
          // Current issues:
          //
          // If there is an error fetching and shouldFetch is set to true but
          // shouldRender is set to false then this component will never render nor fetch.
          // Having a container which has loading/failed states makes sense here.
          //
          // shouldRender shouldn't be passed down from Render. We should just check that
          // all props were resolved and that determines if we should render. Having this connect
          // to a store(s) through a container where we check the existence of props might work fine.
          return this.state.fulfilled || this.context.buffer.shouldRender(this.context.universalId)
            ? React.createElement(Component, this.props)
            : null
        }
      })
    }

    // works as a decorator or as a function
    return MaybeComponent ? bind(MaybeComponent) : Component => bind(Component)
  }
}
