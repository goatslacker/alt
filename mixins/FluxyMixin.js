'use strict'
/**
 * This mixin lets you setup your listeners. It is similar to Fluxible's mixin.
 *
 * Usage:
 *
 * mixins: [FluxyMixin],
 *
 * statics: {
 *   storeListeners: {
 *     doFoo: FooStore,
 *     doBar: BarStore
 *   }
 * },
 *
 * doFoo: function (storeState) {
 *   this.setState({ foo: FooStore.getState() })
 * },
 *
 * doBar: function (storeState) { },
 *
 * render: function () {
 *   // state will be in the keys you provided
 *   this.state.foo
 * }
 *
 * ----
 *
 * You can also pass in an Array of stores to storeListeners:
 *
 * statics: {
 *   storeListeners: [FooStore, BarStore]
 * }
 *
 * Changes will then be passed to a function `onChange` which you will have
 * to define:
 *
 * onChange() {
 *   this.setState({
 *     foo: FooStore.getState(),
 *     bar: BarStore.getState()
 *   })
 * }
 */
var Subscribe = require('./Subscribe')

var FluxyMixin = {
  componentDidMount: function () {
    Subscribe.create(this)

    var stores = this.constructor.storeListeners

    if (Array.isArray(stores)) {
      if (!this.onChange) {
        throw new ReferenceError(
          'onChange should exist in your React component but is not defined'
        )
      }

      stores.forEach(function (store) {
        Subscribe.add(this, store, this.onChange)
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
