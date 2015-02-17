var MIXIN_REGISTRY = '_alt store listener registry_'

var ListenerMixin = {
  componentWillUnmount: function () {
    this[MIXIN_REGISTRY].forEach(function (x) {
      x.store.unlisten(x.handler)
    })
    this[MIXIN_REGISTRY] = []
  },

  listenTo: function (store, handler) {
    if (Array.isArray(store)) {
      store.forEach(function (s) {
        this[MIXIN_REGISTRY].push({ store: s, handler: handler })
        s.listen(handler)
      }, this)
    } else {
      this[MIXIN_REGISTRY].push({ store: store, handler: handler })
      store.listen(handler)
    }
  }
}

ListenerMixin[MIXIN_REGISTRY] = []

module.exports = ListenerMixin
