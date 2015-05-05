import EventEmitter from 'eventemitter3'
import Symbol from 'es-symbol'

import * as Sym from '../symbols/symbols'
import * as fn from '../../utils/functions'

// event emitter instance
const EE = Symbol()

class AltStore {
  constructor(alt, model, state, StoreModel) {
    this[EE] = new EventEmitter()
    this[Sym.LIFECYCLE] = model[Sym.LIFECYCLE]
    this[Sym.STATE_CONTAINER] = state || model

    this._storeName = model._storeName
    this.boundListeners = model[Sym.ALL_LISTENERS]
    this.StoreModel = StoreModel

    fn.assign(this, model[Sym.PUBLIC_METHODS])

    // Register dispatcher
    this.dispatchToken = alt.dispatcher.register((payload) => {
      this[Sym.LIFECYCLE].emit(
        'beforeEach',
        payload,
        this[Sym.STATE_CONTAINER]
      )

      if (model[Sym.LISTENERS][payload.action]) {
        let result = false

        try {
          result = model[Sym.LISTENERS][payload.action](payload.data)
        } catch (e) {
          if (model[Sym.HANDLING_ERRORS]) {
            this[Sym.LIFECYCLE].emit(
              'error',
              e,
              payload,
              this[Sym.STATE_CONTAINER]
            )
          } else {
            throw e
          }
        }

        if (result !== false) {
          this.emitChange()
        }
      }

      this[Sym.LIFECYCLE].emit(
        'afterEach',
        payload,
        this[Sym.STATE_CONTAINER]
      )
    })

    this[Sym.LIFECYCLE].emit('init')
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
    this[Sym.LIFECYCLE].emit('unlisten')
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
