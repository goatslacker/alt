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
var Subscribe = require('../mixins/Subscribe')
var assign = require('object-assign')

var cloneWithProps = React.addons.cloneWithProps

function getState(store, props) {
  return typeof store === 'function' ? store(props) : store.getState()
}

var AltContainer = React.createClass({
  getInitialState: function () {
    if (this.props.stores && this.props.store) {
      throw new ReferenceError('Cannot define both store and stores')
    }

    return this.getStateFromStores(this.props) || {}
  },

  componentWillReceiveProps: function (nextProps) {
    this.destroySubscriptions()
    this.setState(this.getStateFromStores(nextProps))
    this.registerStores(nextProps)
  },

  componentDidMount: function () {
    this.registerStores(this.props)
  },

  componentWillUnmount: function () {
    this.destroySubscriptions()
  },

  registerStores: function (props) {
    Subscribe.create(this)

    if (props.store) {
      this.addSubscription(props.store)
    } else if (props.stores) {
      var stores = props.stores

      if (Array.isArray(stores)) {
        stores.forEach(function (store) {
          this.addSubscription(store)
        }, this)
      } else {
        Object.keys(stores).forEach(function (formatter) {
          this.addSubscription(stores[formatter])
        }, this)
      }
    }
  },

  destroySubscriptions: function () {
    Subscribe.destroy(this)
  },

  getStateFromStores: function (props) {
    if (props.store) {
      return getState(props.store, props)
    } else if (props.stores) {
      var stores = props.stores

      // If you pass in an array of stores the state is merged together.
      if (Array.isArray(stores)) {
        return stores.reduce(function (obj, store) {
          return assign(obj, getState(store, props))
        }.bind(this), {})

      // if it is an object then the state is added to the key specified
      } else {
        return Object.keys(stores).reduce(function (obj, key) {
          obj[key] = getState(stores[key], props)
          return obj
        }.bind(this), {})
      }
    } else {
      return {}
    }
  },

  addSubscription: function (store) {
    if (typeof store === 'object') {
      Subscribe.add(this, store, this.altSetState)
    }
  },

  altSetState: function () {
    this.setState(this.getStateFromStores(this.props))
  },

  getProps: function () {
    return assign(
      this.context.flux || this.props.flux
        ? { flux: this.context.flux || this.props.flux }
        : {},
      this.state
    )
  },

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
})

module.exports = AltContainer
