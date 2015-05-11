import Symbol from 'es-symbol'

import * as Sym from '../symbols/symbols'
import * as fn from '../../utils/functions'
import transmitter from 'transmitter'

// event emitter instance
const EE = Symbol()

class AltStore {
  constructor(alt, model, state, StoreModel) {
    this[EE] = transmitter()
    this[Sym.LIFECYCLE] = model[Sym.LIFECYCLE]
    this[Sym.STATE_CONTAINER] = state || model

    this._storeName = model._storeName
    this.boundListeners = model[Sym.ALL_LISTENERS]
    this.StoreModel = StoreModel

    fn.assign(this, model[Sym.PUBLIC_METHODS])

    // Register dispatcher
    this.dispatchToken = alt.dispatcher.register((payload) => {
      this[Sym.LIFECYCLE].beforeEach({
        payload,
        state: this[Sym.STATE_CONTAINER]
      })

      if (model[Sym.LISTENERS][payload.action]) {
        let result = false

        try {
          result = model[Sym.LISTENERS][payload.action](payload.data)
        } catch (e) {
          if (model[Sym.HANDLING_ERRORS]) {
            this[Sym.LIFECYCLE].error.push({
              error: e,
              payload,
              state: this[Sym.STATE_CONTAINER]
            })
          } else {
            throw e
          }
        }

        if (result !== false) {
          this.emitChange()
        }
      }

      this[Sym.LIFECYCLE].afterEach.push({
        payload,
        state :this[Sym.STATE_CONTAINER]
      })
    })

    this[Sym.LIFECYCLE].init.push()
  }

  emitChange() {
    this[EE].push(this[Sym.STATE_CONTAINER])
  }

  listen(cb) {
    const { dispose } = this[EE].subscribe(cb)
    return () => {
      this[Sym.LIFECYCLE].unlisten.push()
      dispose()
    }
  }

  getState() {
    return this.StoreModel.config.getState.call(
      this,
      this[Sym.STATE_CONTAINER]
    )
  }
}

export default AltStore
