'use strict'

var Subscribe = {
  create: function (context) {
    context._AltMixinRegistry = context._AltMixinRegistry || []
  },

  add: function (context, store, handler) {
    context._AltMixinRegistry.push(store.listen(handler))
  },

  destroy: function (context) {
    context._AltMixinRegistry.forEach(function (f) { f() })
    context._AltMixinRegistry = []
  },

  listeners: function (context) {
    return context._AltMixinRegistry
  }
}

module.exports = Subscribe
