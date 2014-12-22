var MIXIN_REGISTRY = '_alt store listener registry_'

var ListenerMixin = {
  componentWillUnmount: function () {
    this[MIXIN_REGISTRY] && this[MIXIN_REGISTRY].forEach(function (x) {
      x.store.unlisten(x.handler)
    })
  },

  listenTo: function (store, handler) {
    this[MIXIN_REGISTRY] = this[MIXIN_REGISTRY] || []
    this[MIXIN_REGISTRY].push({ store: store, handler: handler })
    store.listen(handler)
  }
}

module.exports = ListenerMixin
