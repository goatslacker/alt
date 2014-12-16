var MIXIN_REGISTRY = '_fux store listener registry_'

var ListenerMixin = {
  componentWillUnmount() {
    this[MIXIN_REGISTRY] && this[MIXIN_REGISTRY].forEach((x) => {
      var { store, handler } = x
      store.unlisten(handler)
    })
  },

  listenTo(store, handler) {
    this[MIXIN_REGISTRY] = this[MIXIN_REGISTRY] || []
    this[MIXIN_REGISTRY].push({ store, handler })
    store.listen(handler)
  }
}

module.exports = ListenerMixin
