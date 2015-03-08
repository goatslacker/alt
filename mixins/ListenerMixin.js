'use strict'
var Subscribe = require('./Subscribe')

var ListenerMixin = {
  componentWillMount: function () {
    Subscribe.create(this)
  },

  componentWillUnmount: function () {
    Subscribe.destroy(this)
  },

  listenTo: function (store, handler) {
    Subscribe.add(this, store, handler)
  },

  listenToMany: function (stores, handler) {
    stores.forEach(function (store) {
      this.listenTo(store, handler)
    }, this)
  },

  getListeners: function () {
    return Subscribe.listeners(this)
  }
}

module.exports = ListenerMixin
