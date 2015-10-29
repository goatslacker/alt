import transmitter from 'transmitter'
import * as fn from '../functions'

const StoreMixin = {
  waitFor(...sources) {
    if (!sources.length) {
      throw new ReferenceError('Dispatch tokens not provided')
    }

    let sourcesArray = sources
    if (sources.length === 1) {
      sourcesArray = Array.isArray(sources[0]) ? sources[0] : sources
    }

    const tokens = sourcesArray.map((source) => {
      return source.dispatchToken || source
    })

    this.dispatcher.waitFor(tokens)
  },

  exportPublicMethods(methods) {
    fn.eachObject((methodName, value) => {
      if (!fn.isFunction(value)) {
        throw new TypeError('exportPublicMethods expects a function')
      }

      this.publicMethods[methodName] = value
    }, [methods])
  },

  emitChange() {
    this.getInstance().emitChange()
  },

  on(lifecycleEvent, handler) {
    if (lifecycleEvent === 'error') this.handlesOwnErrors = true
    const bus = this.lifecycleEvents[lifecycleEvent] || transmitter()
    this.lifecycleEvents[lifecycleEvent] = bus
    return bus.subscribe(handler.bind(this))
  },

  bindAction(symbol, handler) {
    if (!symbol) {
      throw new ReferenceError('Invalid action reference passed in')
    }
    if (!fn.isFunction(handler)) {
      throw new TypeError('bindAction expects a function')
    }

    // You can pass in the constant or the function itself
    const key = symbol.id ? symbol.id : symbol
    this.actionListeners[key] = this.actionListeners[key] || []
    this.actionListeners[key].push(handler.bind(this))
    this.boundListeners.push(key)
  },

  bindActions(actions) {
    fn.eachObject((action, symbol) => {
      const matchFirstCharacter = /./
      const assumedEventHandler = action.replace(matchFirstCharacter, (x) => {
        return `on${x[0].toUpperCase()}`
      })

      if (this[action] && this[assumedEventHandler]) {
        // If you have both action and onAction
        throw new ReferenceError(
          `You have multiple action handlers bound to an action: ` +
          `${action} and ${assumedEventHandler}`
        )
      }

      const handler = this[action] || this[assumedEventHandler]
      if (handler) {
        this.bindAction(symbol, handler)
      }
    }, [actions])
  },

  bindListeners(obj) {
    fn.eachObject((methodName, symbol) => {
      const listener = this[methodName]

      if (!listener) {
        throw new ReferenceError(
          `${methodName} defined but does not exist in ${this.displayName}`
        )
      }

      if (Array.isArray(symbol)) {
        symbol.forEach((action) => {
          this.bindAction(action, listener)
        })
      } else {
        this.bindAction(symbol, listener)
      }
    }, [obj])
  },
}

export default StoreMixin
