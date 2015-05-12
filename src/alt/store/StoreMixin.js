import * as fn from '../../utils/functions'

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

  exportAsync(asyncMethods) {
    let isLoading = false
    let hasError = false

    const toExport = Object.keys(asyncMethods).reduce((publicMethods, methodName) => {
      const asyncSpec = asyncMethods[methodName](this)

      const validHandlers = ['success', 'error', 'loading']
      validHandlers.forEach((handler) => {
        if (asyncSpec[handler] && !asyncSpec[handler].id) {
          throw new Error(`${handler} handler must be an action function`)
        }
      })

      publicMethods[methodName] = (...args) => {
        const state = this.getInstance().getState()
        const value = asyncSpec.local && asyncSpec.local(state, ...args)

        // if we don't have it in cache then fetch it
        if (!value) {
          isLoading = true
          hasError = false
          /* istanbul ignore else */
          if (asyncSpec.loading) asyncSpec.loading()
          asyncSpec.remote(state, ...args)
            .then((v) => {
              isLoading = false
              asyncSpec.success(v)
            })
            .catch((v) => {
              isLoading = false
              hasError = true
              asyncSpec.error(v)
            })
        } else {
          // otherwise emit the change now
          this.emitChange()
        }
      }

      return publicMethods
    }, {})

    this.exportPublicMethods(toExport)
    this.exportPublicMethods({
      isLoading: () => isLoading,
      hasError: () => hasError
    })
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
    return this.lifecycleEvents[lifecycleEvent].subscribe(handler.bind(this))
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
        `Action handler in store ${this._storeName} for ` +
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
