/**
 * AltNativeContainer.
 *
 * @see AltContainer
 */
var React = require('react-native')
var mixinContainer = require('./mixinContainer')
var assign = require('object-assign')

var AltNativeContainer = React.createClass(assign({
  displayName: 'AltNativeContainer',

  render: function () {
    return this.altRender(React.View)
  }
}, mixinContainer(React)))

module.exports = AltNativeContainer
