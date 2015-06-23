import * as utils from '../utils/AltUtils'
import * as fn from '../../utils/functions'
import transmitter from 'transmitter'


class Store {

  constructor(alt) {

    this.displayName = this.config.displayName || this.displayName || this.name || ''

    // XXX well then how do I make sure this gets set? Ideally as a static prop in the derived class
//    this.config = fn.assign({
//      getState(state) {
//        return fn.assign({}, state)
//      },
//      setState: fn.assign
//    }, config)

    this.boundListeners = []
    this.lifecycleEvents = {}
    this.actionListeners = {}
    this.handlesOwnErrors = false
    this.preventDefault = false

    this.alt = alt
    this.dispatcher = alt.dispatcher
    this.transmitter = transmitter()

    this.lifecycle = (event, x) => {
      if (this.lifecycleEvents[event]) this.lifecycleEvents[event].push(x)
    }

    const output = this.output || (x => x)
    this.emitChange = () => this.transmitter.push(output(this.state))

    const handleDispatch = (f, payload) => {
      try {
        return f()
      } catch (e) {
        if (this.handlesOwnErrors) {
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

    // Register dispatcher
    this.dispatchToken = alt.dispatcher.register((payload) => {
      this.preventDefault = false

      this.lifecycle('beforeEach', {
        payload,
        state: this.state
      })

      const actionHandler = this.actionListeners[payload.action] ||
        this.otherwise

      if (actionHandler) {
        const result = handleDispatch(() => {
          return actionHandler.call(this, payload.data, payload.action)
        }, payload)

        if (result !== false && !this.preventDefault) this.emitChange()
      }

      if (this.reduce) {
        handleDispatch(() => {
          this.setState(this.reduce(this.state, payload))
        }, payload)

        if (!this.preventDefault) this.emitChange()
      }

      this.lifecycle('afterEach', {
        payload,
        state: this.state
      })
    })

    if (this.alt.stores[this.displayName] || !this.displayName) {
      if (this.alt.stores[this.displayName]) {
        utils.warn(
          `A store named ${this.displayName} already exists, double check your store ` +
          `names or pass in your own custom identifier for each store`
        )
      } else {
        utils.warn('Store name was not specified')
      }

      this.displayName = utils.uid(this.alt.stores, this.displayName)
    }
  }

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
  }

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
  }

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
  }

  preventDefault() {
    this.preventDefault = true
  }

  on(lifecycleEvent, handler) {
    if (lifecycleEvent === 'error') this.handlesOwnErrors = true
    const bus = this.lifecycleEvents[lifecycleEvent] || transmitter()
    this.lifecycleEvents[lifecycleEvent] = bus
    return bus.subscribe(handler.bind(this))
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
    return this.config.getState.call(this, this.state)
  }

  setState(state) {
    // XXX you can do some clever batching here...
    if (!state) return

    const nextState = fn.isFunction(state)
      ? state(this.state)
      : state

    this.state = this.config.setState.call(
      this,
      this.state,
      nextState
    )

    if (!this.dispatcher.isDispatching()) this.emitChange()
  }
}

export default Store
