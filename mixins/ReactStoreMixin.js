// This mixin automatically sets the state for you but you provide a function
// which formats the data according to your taste.
//
// Usage:
//
// mixins: [ReactStoreMixin],
//
// statics: {
//   storeListeners: {
//     doFoo: FooStore,
//     doBar: BarStore
//   }
// },
//
// doFoo: function (storeState) {
//   // you can manipulate storeState however you want here
//   // and then make sure to return an object
//   return { key: storeState }
// },
//
// doBar: function (storeState) { },
//
// render: function () {
//   // state will be in the keys you provided
//   this.state.key
// }
var Subscribe = require('./Subscribe')

var ReactStoreMixin = {
  componentDidMount: function () {
    Subscribe.create(this)

    var stores = this.constructor.storeListeners

    Object.keys(stores).forEach(function (formatter) {
      var store = stores[formatter]

      Subscribe.add(this, store, function () {
        var state = this[formatter](store.getState())
        if (state) {
          this.setState(state)
        }
      })
    }, this)
  },

  componentWillUnmount: function () {
    Subscribe.destroy(this)
  }
}

module.exports = ReactStoreMixin
