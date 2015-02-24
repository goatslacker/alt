var Subscribe = require('./Subscribe')

var ListenerMixin = {
  componentWillMount: function () {
    Subscribe.create(this)
  },

  componentWillUnmount: function () {
    Subscribe.destroy(this)
  },

  listenTo: function (store, handler) {
    if (Array.isArray(store)) {
      store.forEach(function (s) {
        Subscribe.add(this, s, handler)
      }, this)
    } else {
      Subscribe.add(this, store, handler)
    }
  }
}

module.exports = ListenerMixin
