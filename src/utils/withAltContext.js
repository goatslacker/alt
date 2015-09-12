import React from 'react'

export default function withAltContext(flux) {
  return (Component) => {
    return React.createClass({
      childContextTypes: {
        flux: React.PropTypes.object,
      },

      getChildContext() {
        return { flux }
      },

      render() {
        return React.createElement(Component, this.props)
      },
    })
  }
}
