import * as fn from '../functions'
import transmitter from 'transmitter'

class AltStore {
  constructor(alt, model, state, StoreModel) {
    const lifecycleEvents = model.lifecycleEvents
    this.transmitter = transmitter()
    this.lifecycle = (event, x) => {
      if (lifecycleEvents[event]) lifecycleEvents[event].publish(x)
    }
    this.state = state

    this.alt = alt
    this.preventDefault = false
    this.displayName = model.displayName
    this.boundListeners = model.boundListeners
    this.StoreModel = StoreModel
    this.reduce = model.reduce || (x => x)
    this.subscriptions = []

    const output = model.output || (x => x)

    this.emitChange = () => this.transmitter.publish(output(this.state))

    const handleDispatch = (f, payload) => {
      try {
        return f()
      } catch (e) {
        if (model.handlesOwnErrors) {
          this.lifecycle('error', {
            error: e,
            payload,
            state: this.state,
          })
          return false
        }

        throw e
      }
    }

    fn.assign(this, model.publicMethods)

    // Register dispatcher
    this.dispatchToken = alt.dispatcher.register((payload) => {
      this.preventDefault = false

      this.lifecycle('beforeEach', {
        payload,
        state: this.state,
      })

      const actionHandlers = model.actionListeners[payload.action]

      if (actionHandlers || model.otherwise) {
        let result

        if (actionHandlers) {
          result = handleDispatch(() => {
            return actionHandlers.filter(Boolean).every((handler) => {
              return handler.call(model, payload.data, payload.action) !== false
            })
          }, payload)
        } else {
          result = handleDispatch(() => {
            return model.otherwise(payload.data, payload.action)
          }, payload)
        }

        if (result !== false && !this.preventDefault) this.emitChange()
      }

      if (model.reduce) {
        handleDispatch(() => {
          const value = model.reduce(this.state, payload)
          if (value !== undefined) this.state = value
        }, payload)
        if (!this.preventDefault) this.emitChange()
      }

      this.lifecycle('afterEach', {
        payload,
        state: this.state,
      })
    })

    this.lifecycle('init')
  }

  listen(cb) {
    if (!fn.isFunction(cb)) throw new TypeError('listen expects a function')
    const { dispose } = this.transmitter.subscribe(cb)
    this.subscriptions.push({ cb, dispose })
    return () => {
      this.lifecycle('unlisten')
      dispose()
    }
  }

  unlisten(cb) {
    this.lifecycle('unlisten')
    this.subscriptions
      .filter(subscription => subscription.cb === cb)
      .forEach(subscription => subscription.dispose())
  }

  getState() {
    return this.StoreModel.config.getState.call(this, this.state)
  }
}

export default AltStore
