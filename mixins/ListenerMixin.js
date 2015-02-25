var MIXIN_REGISTRY = '_alt store listener registry_'

var ListenerMixin = {
  componentWillUnmount: function () {
    this[MIXIN_REGISTRY] && this[MIXIN_REGISTRY].forEach(function (x) {
      x.store.unlisten(x.handler)
    })
    this[MIXIN_REGISTRY] = []
  },

  listenTo: function (store, handler) {
    this[MIXIN_REGISTRY] = this[MIXIN_REGISTRY] || []
    this[MIXIN_REGISTRY].push({ store: store, handler: handler })
    store.listen(handler)
  },

  listenToMany: function (stores, handler) {
    stores.forEach(function (store) {
      this.listenTo(store, handler);
    }, this);
  }
}

module.exports = ListenerMixin
