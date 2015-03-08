'use strict'
var Symbol = require('es-symbol')
var MIXIN_REGISTRY = Symbol('alt store listeners')

var Subscribe = {
  create: function (context) {
    context[MIXIN_REGISTRY] = context[MIXIN_REGISTRY] || []
  },

  add: function (context, store, handler) {
    context[MIXIN_REGISTRY].push({ store: store, handler: handler })
    store.listen(handler)
  },

  destroy: function (context) {
    context[MIXIN_REGISTRY].forEach(function (x) {
      x.store.unlisten(x.handler)
    })
    context[MIXIN_REGISTRY] = []
  },

  listeners: function (context) {
    return context[MIXIN_REGISTRY]
  }
}

module.exports = Subscribe
