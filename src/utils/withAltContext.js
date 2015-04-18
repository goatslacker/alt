var React = require('react')

function withAltContext(flux, Component) {
  return React.createClass({
    childContextTypes: {
      flux: React.PropTypes.object
    },

    getChildContext() {
      return { flux: flux }
    },

    render() {
      return React.createElement(Component, this.props)
    }
  })
}

module.exports = withAltContext
