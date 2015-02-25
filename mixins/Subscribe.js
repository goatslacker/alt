var MIXIN_REGISTRY = '_alt store listener registry_'

var Subscribe = {
  create: function (context) {
    context[MIXIN_REGISTRY] = context[MIXIN_REGISTRY] || []
  },

  add: function (context, store, fn) {
    var handler = fn.bind(context)
    context[MIXIN_REGISTRY].push({ store: store, handler: handler })
    store.listen(handler)
  },

  destroy: function (context) {
    context[MIXIN_REGISTRY].forEach(function (x) {
      x.store.unlisten(x.handler)
    })
    context[MIXIN_REGISTRY] = []
  }
}

module.exports = Subscribe
