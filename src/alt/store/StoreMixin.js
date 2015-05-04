import Symbol from 'es-symbol'
import * as Sym from '../symbols/symbols'

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
    eachObject((methodName, value) => {
      if (typeof value !== 'function') {
        throw new TypeError('exportPublicMethods expects a function')
      }

      this[Sym.PUBLIC_METHODS][methodName] = value
    }, [methods])
  },

  emitChange() {
    this.getInstance().emitChange()
  },

  on(lifecycleEvent, handler) {
    if (lifecycleEvent === 'error') {
      this[Sym.HANDLING_ERRORS] = true
    }
    this[Sym.LIFECYCLE].on(lifecycleEvent, handler.bind(this))
  },

  bindAction(symbol, handler) {
    if (!symbol) {
      throw new ReferenceError('Invalid action reference passed in')
    }
    if (typeof handler !== 'function') {
      throw new TypeError('bindAction expects a function')
    }

    if (handler.length > 1) {
      throw new TypeError(
        `Action handler in store ${this._storeName} for ` +
        `${(symbol[Sym.ACTION_KEY] || symbol).toString()} was defined with ` +
        `two parameters. Only a single parameter is passed through the ` +
        `dispatcher, did you mean to pass in an Object instead?`
      )
    }

    // You can pass in the constant or the function itself
    const key = symbol[Sym.ACTION_KEY] ? symbol[Sym.ACTION_KEY] : symbol
    this[Sym.LISTENERS][key] = handler.bind(this)
    this[Sym.ALL_LISTENERS].push(Symbol.keyFor(key))
  },

  bindActions(actions) {
    eachObject((action, symbol) => {
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
    eachObject((methodName, symbol) => {
      const listener = this[methodName]

      if (!listener) {
        throw new ReferenceError(
          `${methodName} defined but does not exist in ${this._storeName}`
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
