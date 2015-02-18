// This mixin automatically sets the state for you based on the key you provide
//
// Usage:
//
// mixins: [ReactStateMagicMixin],
//
// statics: {
//   storeListeners: {
//     foo: FooStore,
//     bar: BarStore
//   }
// },
//
// render: function () {
//   // state will be in the keys you provided
//   this.state.foo
//   this.state.bar
// }
var Subscribe = require('./Subscribe')

var ReactStateMagicMixin = {
  getInitialState: function () {
    return this.getStateFromStores()
  },

  componentDidMount: function () {
    Subscribe.create(this)

    var stores = this.constructor.registerStores

    if (this.constructor.registerStore && this.constructor.registerStores) {
      throw new ReferenceError(
        'You are attempting to use `registerStore` and `registerStores` ' +
          'pick one'
      )
    }

    if (this.constructor.registerStore) {
      Subscribe.add(this, this.constructor.registerStore, this.altSetState)
    } else {
      Object.keys(stores).forEach(function (formatter) {
        Subscribe.add(this, stores[formatter], this.altSetState)
      }, this)
    }
  },

  componentWillUnmount: function () {
    Subscribe.destroy(this)
  },

  getStateFromStores: function () {
    if (this.constructor.registerStore) {
      return this.constructor.registerStore.getState()
    }

    var stores = this.constructor.registerStores

    return Object.keys(stores).reduce(function (obj, key) {
      return obj[key] = stores[key].getState(), obj
    }, {})
  },

  altSetState: function () {
    this.setState(this.getStateFromStores())
  }
}

module.exports = ReactStateMagicMixin
