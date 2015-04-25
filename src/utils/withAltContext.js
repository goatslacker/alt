import React from 'react'

export default function withAltContext(flux) {
  return function (Component) {
    return React.createClass({
      childContextTypes: {
        flux: React.PropTypes.object
      },

      getChildContext() {
        return { flux }
      },

      render() {
        return React.createElement(Component, this.props)
      }
    })
  }
}
