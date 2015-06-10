import React from 'react'

export function withData(fetch, MaybeComponent) {
  function bind(Component) {
    return React.createClass({
      contextTypes: {
        buffer: React.PropTypes.object.isRequired
      },

      childContextTypes: {
        buffer: React.PropTypes.object.isRequired
      },

      getChildContext() {
        return { buffer: this.context.buffer }
      },

      componentWillMount() {
        if (!this.context.buffer.locked) {
          this.context.buffer.push(
            fetch(this.props)
          )
        }
      },

      render() {
        return this.context.buffer.locked
          ? React.createElement(Component, this.props)
          : null
      }
    })
  }

  // works as a decorator or as a function
  return MaybeComponent ? bind(MaybeComponent) : Component => bind(Component)
}

function usingDispatchBuffer(buffer, Component) {
  return React.createClass({
    childContextTypes: {
      buffer: React.PropTypes.object.isRequired
    },

    getChildContext() {
      return { buffer }
    },

    render() {
      return React.createElement(Component, this.props)
    }
  })
}

class DispatchBuffer {
  constructor(renderStrategy) {
    this.promisesBuffer = []
    this.locked = false
    this.renderStrategy = renderStrategy
  }

  push(v) {
    this.promisesBuffer.push(v)
  }

  fill(Element) {
    return this.renderStrategy(Element)
  }

  clear() {
    this.promisesBuffer = []
  }

  flush(Element) {
    return Promise.all(this.promisesBuffer).then((data) => {
      // fire off all the actions synchronously
      data.forEach((f) => {
        if (Array.isArray(f)) {
          f.forEach(x => x())
        } else {
          f()
        }
      })
      this.locked = true

      return this.renderStrategy(Element)
    }).catch(() => {
      // if there's an error still render the markup with what we've got.
      return this.renderStrategy(Element)
    })
  }
}


function renderWithStrategy(strategy) {
  return (Component, props) => {
    // create a buffer and use context to pass it through to the components
    const buffer = new DispatchBuffer((Node) => {
      return React[strategy](Node)
    })
    const Container = usingDispatchBuffer(buffer, Component)

    // cache the element
    const Element = React.createElement(Container, props)

    // render so we kick things off and get the props
    buffer.fill(Element)

    // flush out the results in the buffer synchronously setting the store
    // state and returning the markup
    return buffer.flush(Element)
  }
}

export function prepare(Component, props) {
  const buffer = new DispatchBuffer(x => x)
  const Container = usingDispatchBuffer(buffer, Component)
  const Element = React.createElement(Container, props)
  React.renderToStaticMarkup(Element)
  return buffer.flush(Element)
}

export function toDOM(Component, props, documentNode) {
  const buffer = new DispatchBuffer()
  buffer.locked = true
  const Node = usingDispatchBuffer(buffer, Component)
  const Element = React.createElement(Node, props)
  buffer.clear()
  return React.render(Element, documentNode)
}

export const toStaticMarkup = renderWithStrategy('renderToStaticMarkup')
export const toString = renderWithStrategy('renderToString')
