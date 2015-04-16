/**
 * AltContainer.
 *
 * There are many ways to use AltContainer.
 *
 * Using the `stores` prop.
 *
 * <AltContainer stores={{ FooStore: FooStore }}>
 *   children get this.props.FootStore.storeData
 * </AltContainer>
 *
 * You can also pass in functions.
 *
 * <AltContainer stores={{ FooStore: function () { return { storeData: true } } }}>
 *   children get this.props.FootStore.storeData
 * </AltContainer>
 *
 * Using the `store` prop.
 *
 * <AltContainer store={FooStore}>
 *   children get this.props.storeData
 * </AltContainer>
 *
 * Passing in `flux` because you're using alt instances
 *
 * <AltContainer flux={flux}>
 *   children get this.props.flux
 * </AltContainer>
 *
 * Using a custom render function.
 *
 * <AltContainer
 *   render={function (props) {
 *     return <div />;
 *   }}
 * />
 *
 * Full docs available at http://goatslacker.github.io/alt/
 */
var React = require('react/addons')
var mixinContainer = require('./mixinContainer')
var assign = require('object-assign')

var cloneWithProps = React.addons.cloneWithProps

var AltContainer = React.createClass(assign({
  displayName: 'AltContainer',

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

module.exports = AltContainer
