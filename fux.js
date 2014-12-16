'use strict'

var Dispatcher = require('flux').Dispatcher
var EventEmitter = require('events').EventEmitter // XXX use EE3
var Symbol = require('./polyfills/es6-symbol')
Object.assign = Object.assign || require('object-assign')

var now = Date.now()
var PrivateSymbol = (desc) => Symbol(`${now}${desc}`)

var ACTION_DISPATCHER = Symbol('action dispatcher storage')
var ACTION_HANDLER = Symbol('action creator handler')
var ACTION_KEY = Symbol('holds the actions uid symbol for listening')
var ACTION_UID = Symbol('the actions uid name')
var BOOTSTRAP_FLAG = PrivateSymbol('have you bootstrapped yet?')
var LISTENERS = Symbol('stores action listeners storage')
var MIXIN_REGISTRY = Symbol('mixin registry')
var SET_STATE = Symbol(`${now} set state method you shouldnt call`)
var STATE_CONTAINER = Symbol(`${now} the state container`)
var STORE_BOOTSTRAP = Symbol('event handler onBootstrap')
var STORE_SNAPSHOT = Symbol('event handler onTakeSnapshot')
var STORES_STORE = Symbol('stores storage')

var formatAsConstant = (name) => {
  return name.replace(/[a-z]([A-Z])/g, (i) => {
    return `${i[0]}_${i[1].toLowerCase()}`
  }).toUpperCase()
}

class FuxStore extends EventEmitter {
  constructor(dispatcher, state) {
    this[STATE_CONTAINER] = state
    if (state.onBootstrap) {
      this[STORE_BOOTSTRAP] = state.onBootstrap.bind(state)
    }
    if (state.onTakeSnapshot) {
      this[STORE_SNAPSHOT] = state.onTakeSnapshot.bind(state)
    }

    // A special setState method we use to bootstrap and keep state current
    this[SET_STATE] = (newState) => {
      // XXX should we emit change when we bootstrap?
      if (this[STATE_CONTAINER] !== newState) {
        Object.assign(this[STATE_CONTAINER], newState)
      }
    }

    // Register dispatcher
    this.dispatchToken = dispatcher.register((payload) => {
      if (state[LISTENERS][payload.action]) {
        var result = state[LISTENERS][payload.action](payload.data)
        result !== false && this.emitChange()
      }
    })
  }

  emitChange() {
    this.emit('change', this[STATE_CONTAINER])
  }

  listen(cb) {
    this.on('change', cb)
  }

  unlisten(cb) {
    this.removeListener('change', cb)
  }

  getState() {
    // Copy over state so it's RO.
    return Object.assign({}, this[STATE_CONTAINER])
  }
}

class ActionCreator {
  constructor(dispatcher, name, action) {
    this[ACTION_DISPATCHER] = dispatcher
    this[ACTION_UID] = name
    this[ACTION_HANDLER] = action.bind(this)
  }

  dispatch(data) {
    this[ACTION_DISPATCHER].dispatch({
      action: this[ACTION_UID],
      data: data
    })
  }
}

class StoreMixin {
  constructor(dispatcher) {
    this[LISTENERS] = {}
    this.dispatcher = dispatcher
  }

  bindAction(symbol, handler) {
    if (!symbol) {
      throw new ReferenceError('Invalid action reference passed in')
    }
    if (typeof handler !== 'function') {
      throw new TypeError('bindAction expects a function')
    }

    if (symbol[ACTION_KEY]) {
      this[LISTENERS][symbol[ACTION_KEY]] = handler.bind(this)
    } else {
      this[LISTENERS][symbol] = handler.bind(this)
    }
  }

  bindActions(actions) {
    Object.keys(actions).forEach((action) => {
      var symbol = actions[action]
      var assumedEventHandler = action.replace(
        /./,
        (x) => `on${x[0].toUpperCase()}`
      )
      if (this[assumedEventHandler]) {
        if (symbol[ACTION_KEY]) {
          this[LISTENERS][symbol[ACTION_KEY]] = this[assumedEventHandler].bind(this)
        } else {
          this[LISTENERS][symbol] = this[assumedEventHandler].bind(this)
        }
      }
    })
  }

  waitFor(tokens) {
    if (!tokens) {
      throw new ReferenceError('Dispatch tokens not provided')
    }
    if (!Array.isArray(tokens)) {
      tokens = [tokens]
    }
    this.dispatcher.waitFor(tokens)
  }
}

class Fux {
  constructor() {
    this.dispatcher = new Dispatcher()
    this[STORES_STORE] = {}
    this[BOOTSTRAP_FLAG] = false
  }

  createStore(StoreModel) {
    class Store {
      constructor() {
        StoreModel.call(this)
      }
    }
    Object.assign(
      Store.prototype,
      StoreModel.prototype,
      new StoreMixin(this.dispatcher),
      StoreMixin.prototype
    )
    var key = StoreModel.displayName || StoreModel.name
    var store = new Store()
    return this[STORES_STORE][key] = new FuxStore(this.dispatcher, store)
  }

  createActions(ActionsClass) {
    var actions = Object.assign(new ActionsClass(), ActionsClass.prototype)
    return Object.keys(actions).reduce((obj, action) => {
      var key = ActionsClass.displayName || ActionsClass.name
      var constant = formatAsConstant(action)
      var actionName = Symbol(`action ${key}.prototype.${action}`)

      var handler = typeof actions[action] === 'function'
        ? actions[action]
        : function (x) { this.dispatch(x) }

      var newAction = new ActionCreator(
        this.dispatcher,
        actionName,
        handler
      )

      obj[action] = newAction[ACTION_HANDLER]
      obj[action].defer = (x) => setTimeout(() => newAction[ACTION_HANDLER](x))
      obj[action][ACTION_KEY] = actionName
      obj[constant] = actionName

      return obj
    }, {})
  }

  takeSnapshot() {
    var state = JSON.stringify(
      Object.keys(this[STORES_STORE]).reduce((obj, key) => {
        if (this[STORES_STORE][key][STORE_SNAPSHOT]) {
          this[STORES_STORE][key][STORE_SNAPSHOT]()
        }
        obj[key] = this[STORES_STORE][key].getState()
        return obj
      }, {})
    )
    this._lastSnapshot = state
    return state
  }

  rollback() {
    this[BOOTSTRAP_FLAG] = false
    this.bootstrap(this._lastSnapshot)
  }

  bootstrap(data) {
    if (this[BOOTSTRAP_FLAG]) {
      throw new ReferenceError('Stores have already been bootstrapped')
    }
    var obj = JSON.parse(data)
    Object.keys(obj).forEach((key) => {
      this[STORES_STORE][key][SET_STATE](obj[key])
      if (this[STORES_STORE][key][STORE_BOOTSTRAP]) {
        this[STORES_STORE][key][STORE_BOOTSTRAP]()
      }
    })
    this[BOOTSTRAP_FLAG] = true
  }
}

Fux.ListenerMixin = {
  componentWillUnmount() {
    this[MIXIN_REGISTRY] && this[MIXIN_REGISTRY].forEach((x) => {
      var { store, handler } = x
      store.unlisten(handler)
    })
  },

  listenTo(store, handler) {
    this[MIXIN_REGISTRY] = this[MIXIN_REGISTRY] || []
    this[MIXIN_REGISTRY].push({ store, handler })
    store.listen(handler)
  }
}

module.exports = Fux
