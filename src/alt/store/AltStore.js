import Symbol from 'es-symbol'

import * as Sym from '../symbols/symbols'
import * as fn from '../../utils/functions'
import transmitter from 'transmitter'

// event emitter instance
const EE = Symbol()

class AltStore {
  constructor(alt, model, state, StoreModel) {
    this[EE] = transmitter()
    this.lifecycle = model.lifecycleEvents
    this[Sym.STATE_CONTAINER] = state || model

    this.preventDefault = false
    this._storeName = model._storeName
    this.boundListeners = model.boundListeners
    this.StoreModel = StoreModel

    const output = model.output || (x => x)

    this.emitChange = () => {
      this[EE].push(output(alt, this[Sym.STATE_CONTAINER]))
    }

    const handleDispatch = (f, payload) => {
      try {
        return f()
      } catch (e) {
        if (model[Sym.HANDLING_ERRORS]) {
          this.lifecycle.error.push({
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

    fn.assign(this, model.publicMethods)

    // Register dispatcher
    this.dispatchToken = alt.dispatcher.register((payload) => {
      this.preventDefault = false

      this.lifecycle.beforeEach.push({
        payload,
        state: this[Sym.STATE_CONTAINER]
      })

      const actionHandler = model.actionListeners[payload.action] ||
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

      this.lifecycle.afterEach.push({
        payload,
        state: this[Sym.STATE_CONTAINER]
      })
    })

    this.lifecycle.init.push()
  }

  listen(cb) {
    const dispose = this[EE].subscribe(cb).dispose
    return () => {
      this.lifecycle.unlisten.push()
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
