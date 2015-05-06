import EventEmitter from 'eventemitter3'
import assign from 'object-assign'
import Symbol from 'es-symbol'

import * as Sym from '../symbols/symbols'

// event emitter instance
const EE = Symbol()

class AltStore {
  constructor(alt, model, state, StoreModel) {
    this[EE] = new EventEmitter()
    this[Sym.LIFECYCLE] = {}
    this[Sym.STATE_CONTAINER] = state || model

    this._storeName = model._storeName
    this.boundListeners = model[Sym.ALL_LISTENERS]
    this.StoreModel = StoreModel
    if (typeof this.StoreModel === 'object') {
      this.StoreModel.state = assign({}, StoreModel.state)
    }

    assign(this[Sym.LIFECYCLE], model[Sym.LIFECYCLE])
    assign(this, model[Sym.PUBLIC_METHODS])

    // Register dispatcher
    this.dispatchToken = alt.dispatcher.register((payload) => {
      if (model[Sym.LIFECYCLE].beforeEach) {
        model[Sym.LIFECYCLE].beforeEach(payload, this[Sym.STATE_CONTAINER])
      }

      if (model[Sym.LISTENERS][payload.action]) {
        let result = false

        try {
          result = model[Sym.LISTENERS][payload.action](payload.data)
        } catch (e) {
          if (this[Sym.LIFECYCLE].error) {
            this[Sym.LIFECYCLE].error(e, payload, this[Sym.STATE_CONTAINER])
          } else {
            throw e
          }
        }

        if (result !== false) {
          this.emitChange()
        }
      }

      if (model[Sym.LIFECYCLE].afterEach) {
        model[Sym.LIFECYCLE].afterEach(payload, this[Sym.STATE_CONTAINER])
      }
    })

    if (this[Sym.LIFECYCLE].init) {
      this[Sym.LIFECYCLE].init()
    }
  }

  getEventEmitter() {
    return this[EE]
  }

  emitChange() {
    this[EE].emit('change', this[Sym.STATE_CONTAINER])
  }

  listen(cb) {
    this[EE].on('change', cb)
    return () => this.unlisten(cb)
  }

  unlisten(cb) {
    if (this[Sym.LIFECYCLE].unlisten) {
      this[Sym.LIFECYCLE].unlisten()
    }
    this[EE].removeListener('change', cb)
  }

  getState() {
    return this.StoreModel.config.getState.call(
      this,
      this[Sym.STATE_CONTAINER]
    )
  }
}

export default AltStore
