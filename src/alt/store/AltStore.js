import Symbol from 'es-symbol'

import * as fn from '../../utils/functions'
import transmitter from 'transmitter'

// event emitter instance
const EE = Symbol()

class AltStore {
  constructor(alt, model, state, StoreModel) {
    this[EE] = transmitter()
    this.lifecycle = model.lifecycleEvents
    this.state = state || model

    this._storeName = model._storeName
    this.boundListeners = model.boundListeners
    this.StoreModel = StoreModel

    fn.assign(this, model.publicMethods)

    // Register dispatcher
    this.dispatchToken = alt.dispatcher.register((payload) => {
      this.lifecycle.beforeEach.push({
        payload,
        state: this.state
      })

      if (model.actionListeners[payload.action]) {
        let result = false

        try {
          result = model.actionListeners[payload.action](payload.data)
        } catch (e) {
          if (model.handlesOwnErrors) {
            this.lifecycle.error.push({
              error: e,
              payload,
              state: this.state
            })
          } else {
            throw e
          }
        }

        if (result !== false) {
          this.emitChange()
        }
      }

      this.lifecycle.afterEach.push({
        payload,
        state :this.state
      })
    })

    this.lifecycle.init.push()
  }

  emitChange() {
    this[EE].push(this.state)
  }

  listen(cb) {
    const { dispose } = this[EE].subscribe(cb)
    return () => {
      this.lifecycle.unlisten.push()
      dispose()
    }
  }

  getState() {
    return this.StoreModel.config.getState.call(this, this.state)
  }
}

export default AltStore
