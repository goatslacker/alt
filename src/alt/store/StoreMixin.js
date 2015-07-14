import transmitter from 'transmitter'
import * as fn from '../../utils/functions'
import {PENDING} from '../../utils/sentinels'

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

  fetch(spec) {
    const validHandlers = ['success', 'error', 'loading']
    validHandlers.forEach((handler) => {
      if (spec[handler] && !spec[handler].id) {
        throw new Error(`${handler} handler must be an action function`)
      }
    })

    const id = spec.id
    if (this.pendingFetches[id]) return PENDING

    const value = spec.local.call(this)
    const shouldFetch = spec.shouldFetch
      ? spec.shouldFetch.call(this)
      : value == null

    if (!shouldFetch) return value

    this.pendingFetches[id] = true
    const intercept = spec.interceptResponse || (x => x)
    const handleAction = (action, x) => action(intercept(x, action))

    // if we don't have it in cache then fetch it
    /* istanbul ignore else */
    if (spec.loading) spec.loading(intercept(null, spec.loading))
    this.alt.fetch(
      spec.remote(),
      x => {
        delete this.pendingFetches[id]
        handleAction(spec.success, x)
      },
      e => {
        delete this.pendingFetches[id]
        handleAction(spec.error, e)
      }
    )

    return PENDING
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

    if (handler.length > 1) {
      throw new TypeError(
        `Action handler in store ${this.displayName} for ` +
        `${(symbol.id || symbol).toString()} was defined with ` +
        `two parameters. Only a single parameter is passed through the ` +
        `dispatcher, did you mean to pass in an Object instead?`
      )
    }

    // You can pass in the constant or the function itself
    const key = symbol.id ? symbol.id : symbol
    this.actionListeners[key] = handler.bind(this)
    this.boundListeners.push(key)
  },

  bindActions(actions) {
    fn.eachObject((action, symbol) => {
      const matchFirstCharacter = /./
      const assumedEventHandler = action.replace(matchFirstCharacter, (x) => {
        return `on${x[0].toUpperCase()}`
      })
      let handler = null

      if (this[action] && this[assumedEventHandler]) {
        // If you have both action and onAction
        throw new ReferenceError(
          `You have multiple action handlers bound to an action: ` +
          `${action} and ${assumedEventHandler}`
        )
      } else if (this[action]) {
        // action
        handler = this[action]
      } else if (this[assumedEventHandler]) {
        // onAction
        handler = this[assumedEventHandler]
      }

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
  }
}

export default StoreMixin
