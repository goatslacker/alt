'use strict'

import EventEmitter from 'eventemitter3'
import assign from 'object-assign'
import {warn, deprecatedBeforeAfterEachWarning} from '../../src/shared/warnings'
import {
  ALL_LISTENERS,
  EE,
  LIFECYCLE,
  LISTENERS,
  PUBLIC_METHODS,
  STATE_CHANGED,
  STATE_CONTAINER
} from '../../src/shared/symbols'

export default class AltStore {
  constructor(dispatcher, model, state, StoreModel) {
    this[EE] = new EventEmitter()
    this[LIFECYCLE] = {}
    this[STATE_CHANGED] = false
    this[STATE_CONTAINER] = state || model

    this.boundListeners = model[ALL_LISTENERS]
    this.StoreModel = StoreModel
    if (typeof this.StoreModel === 'object') {
      this.StoreModel.state = assign({}, StoreModel.state)
    }

    assign(this[LIFECYCLE], model[LIFECYCLE])
    assign(this, model[PUBLIC_METHODS])

    // Register dispatcher
    this.dispatchToken = dispatcher.register((payload) => {
      if (model[LIFECYCLE].beforeEach) {
        model[LIFECYCLE].beforeEach(
          payload.action.toString(),
          payload.data,
          this[STATE_CONTAINER]
        )
      } else if (typeof model.beforeEach === 'function') {
        deprecatedBeforeAfterEachWarning()
        model.beforeEach(
          payload.action.toString(),
          payload.data,
          this[STATE_CONTAINER]
        )
      }

      if (model[LISTENERS][payload.action]) {
        let result = false

        try {
          result = model[LISTENERS][payload.action](payload.data)
        } catch (e) {
          if (this[LIFECYCLE].error) {
            this[LIFECYCLE].error(
              e,
              payload.action.toString(),
              payload.data,
              this[STATE_CONTAINER]
            )
          } else {
            throw e
          }
        }

        if (result !== false || this[STATE_CHANGED]) {
          this.emitChange()
        }

        this[STATE_CHANGED] = false
      }

      if (model[LIFECYCLE].afterEach) {
        model[LIFECYCLE].afterEach(
          payload.action.toString(),
          payload.data,
          this[STATE_CONTAINER]
        )
      } else if (typeof model.afterEach === 'function') {
        deprecatedBeforeAfterEachWarning()
        model.afterEach(
          payload.action.toString(),
          payload.data,
          this[STATE_CONTAINER]
        )
      }
    })

    if (this[LIFECYCLE].init) {
      this[LIFECYCLE].init()
    }
  }

  getEventEmitter() {
    return this[EE]
  }

  emitChange() {
    this[EE].emit('change', this[STATE_CONTAINER])
  }

  listen(cb) {
    this[EE].on('change', cb)
    return () => this.unlisten(cb)
  }

  unlisten(cb) {
    if (this[LIFECYCLE].unlisten) {
      this[LIFECYCLE].unlisten()
    }
    this[EE].removeListener('change', cb)
  }

  getState() {
    // Copy over state so it's RO.
    const state = this[STATE_CONTAINER]
    return Object.keys(state).reduce((obj, key) => {
      obj[key] = state[key]
      return obj
    }, {})
  }
}
