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
    var children = this.props.children

    // Custom rendering function
    if (typeof this.props.render === 'function') {
      return this.props.render(this.getProps())
    }

    // Does not wrap child in a div if we don't have to.
    if (Array.isArray(children)) {
      return React.createElement('div', null, children.map(function (child, i) {
        return cloneWithProps(child, assign({ key: i }, this.getProps()))
      }, this))
    } else if (children) {
      return cloneWithProps(children, this.getProps())
    } else {
      return React.createElement('div', this.getProps())
    }
  }
}, mixinContainer(React)))

module.exports = AltNativeContainer
