import * as fn from '../../utils/functions'
import transmitter from 'transmitter'

class AltStore {
  constructor(alt, model, state, StoreModel) {
    const lifecycleEvents = model.lifecycleEvents
    this.transmitter = transmitter()
    this.lifecycle = (event, x) => {
      if (lifecycleEvents[event]) lifecycleEvents[event].push(x)
    }
    this.state = state || model

    this.preventDefault = false
    this.displayName = model.displayName
    this.boundListeners = model.boundListeners
    this.StoreModel = StoreModel

    const output = model.output || (x => x)

    this.emitChange = () => this.transmitter.push(output(this.state))

    const handleDispatch = (f, payload) => {
      try {
        return f()
      } catch (e) {
        if (model.handlesOwnErrors) {
          this.lifecycle('error', {
            error: e,
            payload,
            state: this.state
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

      this.lifecycle('beforeEach', {
        payload,
        state: this.state
      })

      const actionHandler = model.actionListeners[payload.action] ||
        model.otherwise
      const shouldEmitChange = this.StoreModel.config.shouldEmitChange

      if (actionHandler) {
        const result = handleDispatch(() => {
          return actionHandler.call(model, payload.data, payload.action)
        }, payload)

        if (result !== false && !this.preventDefault && shouldEmitChange) this.emitChange()
      }

      if (model.reduce) {
        handleDispatch(() => {
          model.setState(model.reduce(this.state, payload))
        }, payload)

        if (!this.preventDefault && shouldEmitChange) this.emitChange()
      }

      this.lifecycle('afterEach', {
        payload,
        state: this.state
      })
    })

    this.lifecycle('init')
  }

  listen(cb) {
    this.transmitter.subscribe(cb)
    return () => this.unlisten(cb)
  }

  unlisten(cb) {
    if (!cb) throw new TypeError('Unlisten must receive a function')
    this.lifecycle('unlisten')
    this.transmitter.unsubscribe(cb)
  }

  getState() {
    return this.StoreModel.config.getState.call(this, this.state)
  }
}

export default AltStore
