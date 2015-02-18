let Symbol = require('es-symbol')
let MIXIN_REGISTRY = Symbol('alt store listener')

class Subscribe {
  constructor() {
    this[MIXIN_REGISTRY] = []
  }

  add(store, handler) {
    this[MIXIN_REGISTRY].push({ store, handler })
    store.listen(handler)
  }

  destroy() {
    this[MIXIN_REGISTRY].forEach(({ store, handler }) {
      store.unlisten(handler)
    })
    this[MIXIN_REGISTRY] = []
  }
}

export default Subscribe
