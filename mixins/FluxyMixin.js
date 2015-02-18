// This mixin lets you setup your listeners. It is similar to Fluxible's mixin.
//
// Usage:
//
// mixins: [FluxyMixin],
//
// statics: {
//   storeListeners: {
//     doFoo: FooStore,
//     doBar: BarStore
//   }
// },
//
// doFoo: function (storeState) {
//   this.setState({ foo: FooStore.getState() })
// },
//
// doBar: function (storeState) { },
//
// render: function () {
//   // state will be in the keys you provided
//   this.state.foo
// }
var Subscribe = require('./Subscribe')

var FluxyMixin = {
  componentDidMount: function () {
    Subscribe.create(this)

    var stores = this.constructor.storeListeners

    if (Array.isArray(stores)) {
      var handler = this.onChange
      if (!handler) {
        throw new ReferenceError(
          handler + ' should exist in your React component but is not defined'
        )
      }

      stores.forEach(function (store) {
        Subscribe.add(this, store, handler)
      }, this)
    } else {
      Object.keys(stores).forEach(function (handler) {
        if (!this[handler]) {
          throw new ReferenceError(
            handler + ' does not exist in your React component'
          )
        }

        Subscribe.add(this, stores[handler], this[handler])
      }, this)
    }
  },

  componentWillUnmount: function () {
    Subscribe.destroy(this)
  }
}

module.exports = FluxyMixin
