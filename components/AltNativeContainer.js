/**
 * AltNativeContainer.
 *
 * @see AltContainer
 */
var React = require('react-native')
var mixinContainer = require('./mixinContainer')
var assign = require('object-assign')

var View = React.View
var cloneWithProps = React.cloneWithProps

var AltNativeContainer = React.createClass(assign({
  displayName: 'AltNativeContainer',

  render: function () {
    return this.altRender(cloneWithProps, View)
  }
}, mixinContainer(React)))

module.exports = AltNativeContainer
