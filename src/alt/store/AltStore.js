//import Symbol from 'es-symbol'

import * as Sym from '../symbols/symbols'
import * as fn from '../../utils/functions'
import { events } from '../utils/AltUtils'

// event emitter instance
const EE = Symbol()

class AltStore {
  constructor(alt, model, state, StoreModel) {
    this[EE] = events()
    this[Sym.LIFECYCLE] = model[Sym.LIFECYCLE]
    this[Sym.STATE_CONTAINER] = state || model

    this.preventDefault = false
    this._storeName = model._storeName
    this.boundListeners = model[Sym.ALL_LISTENERS]
    this.StoreModel = StoreModel

    const output = model.output || (x => x)

    this.emitChange = () => {
      this[EE].emit(
        'change',
        output.call(model, this[Sym.STATE_CONTAINER])
      )
    }

    const handleDispatch = (f, payload) => {
      try {
        return f()
      } catch (e) {
        if (model[Sym.HANDLING_ERRORS]) {
          this[Sym.LIFECYCLE].error.emit({
            error: e,
            payload,
            state: this[Sym.STATE_CONTAINER]
          })
          return false
        } else {
          throw e
        }
      }
    }

    fn.assign(this, model[Sym.PUBLIC_METHODS])

    // Register dispatcher
    this.dispatchToken = alt.dispatcher.register((payload) => {
      this.preventDefault = false

      this[Sym.LIFECYCLE].beforeEach.emit({
        payload,
        state: this[Sym.STATE_CONTAINER]
      })

      const actionHandler = model[Sym.LISTENERS][payload.action] ||
        model.otherwise

      if (actionHandler) {
        const result = handleDispatch(() => {
          return actionHandler.call(model, payload.data, payload.action)
        }, payload)

        if (result !== false && !this.preventDefault) this.emitChange()
      }

      if (model.reduce) {
        handleDispatch(() => {
          model.setState(model.reduce(
            this[Sym.STATE_CONTAINER],
            payload
          ))
        }, payload)

        if (!this.preventDefault) this.emitChange()
      }

      this[Sym.LIFECYCLE].afterEach.emit({
        payload,
        state :this[Sym.STATE_CONTAINER]
      })
    })

    this[Sym.LIFECYCLE].init.emit()
  }

  listen(cb) {
    const dispose = this[EE].subscribe(cb).dispose
    return () => {
      this[Sym.LIFECYCLE].unlisten.emit()
      dispose()
    }
  }

  unlisten(cb) {
    this[Sym.LIFECYCLE].unlisten.emit()
    this[EE].rm(cb)
  }

  getState() {
    return this.StoreModel.config.getState.call(
      this,
      this[Sym.STATE_CONTAINER]
    )
  }
}

export default AltStore
