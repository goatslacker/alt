var Subscribe = require('../mixins/Subscribe')
var assign = require('object-assign')

function getStateFromStore(store, props) {
  return typeof store === 'function' ? store(props).value : store.getState()
}

function getStateFromActionsProp(actions, props) {
  return typeof actions === 'function' ? actions(props) : actions
}

function mixinContainer(React) {
  return {
    contextTypes: {
      flux: React.PropTypes.object
    },

    getInitialState: function () {
      if (this.props.stores && this.props.store) {
        throw new ReferenceError('Cannot define both store and stores')
      }

      return this.reduceState(this.props)
    },

    componentWillReceiveProps: function (nextProps) {
      this.destroySubscriptions()
      this.setState(this.reduceState(nextProps))
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
        return getStateFromStore(props.store, props)
      } else if (props.stores) {
        var stores = props.stores

        // If you pass in an array of stores the state is merged together.
        if (Array.isArray(stores)) {
          return stores.reduce(function (obj, store) {
            return assign(obj, getStateFromStore(store, props))
          }.bind(this), {})

        // if it is an object then the state is added to the key specified
        } else {
          return Object.keys(stores).reduce(function (obj, key) {
            obj[key] = getStateFromStore(stores[key], props)
            return obj
          }.bind(this), {})
        }
      } else {
        return {}
      }
    },

    getStateFromActions: function (props) {
      if (props.actions) {
        return getStateFromActionsProp(props.actions, props)
      } else {
        return {}
      }
    },

    reduceState: function (props) {
      return assign(
        {},
        this.getStateFromStores(props),
        this.getStateFromActions(props)
      )
    },

    addSubscription: function (store) {
      if (typeof store === 'function') {
        Subscribe.add(this, store(this.props).store, this.altSetState)
      } else {
        Subscribe.add(this, store, this.altSetState)
      }
    },

    altSetState: function () {
      this.setState(this.reduceState(this.props))
    },

    getProps: function () {
      var flux = this.props.flux || this.context.flux
      return assign(
        flux ? { flux: flux } : {},
        this.state
      )
    },

    shouldComponentUpdate: function () {
      return this.props.shouldComponentUpdate
        ? this.props.shouldComponentUpdate(this.getProps())
        : true
    }
  }
}

module.exports = mixinContainer
