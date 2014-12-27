'use strict'

var Dispatcher = require('flux').Dispatcher
var EventEmitter = require('eventemitter3')
var Symbol = require('./polyfills/es6-symbol')
Object.assign = Object.assign || require('object-assign')

var now = Date.now()
var VariableSymbol = (desc) => Symbol(`${now}${desc}`)

var ACTION_DISPATCHER = Symbol('action dispatcher storage')
var ACTION_HANDLER = Symbol('action creator handler')
var ACTION_KEY = Symbol('holds the actions uid symbol for listening')
var ACTION_UID = Symbol('the actions uid name')
var BOOTSTRAP_FLAG = VariableSymbol('have you bootstrapped yet?')
var EE = Symbol('event emitter instance')
var LISTENERS = Symbol('stores action listeners storage')
var STATE_CONTAINER = VariableSymbol('the state container')
var STORE_BOOTSTRAP = Symbol('event handler onBootstrap')
var STORE_SNAPSHOT = Symbol('event handler onTakeSnapshot')
var STORES_STORE = Symbol('stores storage')

var formatAsConstant = (name) => {
  return name.replace(/[a-z]([A-Z])/g, (i) => {
    return `${i[0]}_${i[1].toLowerCase()}`
  }).toUpperCase()
}

/* istanbul ignore next */
function NoopClass() { }

var builtIns = Object.getOwnPropertyNames(NoopClass)
var builtInProto = Object.getOwnPropertyNames(NoopClass.prototype)

var getInternalMethods = (obj, excluded) => {
  return Object.getOwnPropertyNames(obj).reduce((value, m) => {
    if (excluded.indexOf(m) !== -1) {
      return value
    }

    value[m] = obj[m]
    return value
  }, {})
}

class AltStore {
  constructor(dispatcher, state) {
    this[STATE_CONTAINER] = state
    this[EE] = new EventEmitter()
    if (state.onBootstrap) {
      this[STORE_BOOTSTRAP] = state.onBootstrap.bind(state)
    }
    if (state.onTakeSnapshot) {
      this[STORE_SNAPSHOT] = state.onTakeSnapshot.bind(state)
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
    this[EE].emit('change', this[STATE_CONTAINER])
  }

  listen(cb) {
    this[EE].on('change', cb)
  }

  unlisten(cb) {
    this[EE].removeListener('change', cb)
  }

  getState() {
    // Copy over state so it's RO.
    return Object.assign({}, this[STATE_CONTAINER])
  }
}

class ActionCreator {
  constructor(dispatcher, name, action, actions) {
    this[ACTION_DISPATCHER] = dispatcher
    this[ACTION_UID] = name
    this[ACTION_HANDLER] = action.bind(this)
    this.actions = actions
  }

  dispatch(data) {
    this[ACTION_DISPATCHER].dispatch({
      action: this[ACTION_UID],
      data: data
    })
  }
}

var StoreMixin = {
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
        `${(symbol[ACTION_KEY] || symbol)} was defined with 2 parameters. ` +
        `Only a single parameter is passed through the dispatcher, did you ` +
        `mean to pass in an Object instead?`
      )
    }

    // You can pass in the constant or the function itself
    if (symbol[ACTION_KEY]) {
      this[LISTENERS][symbol[ACTION_KEY]] = handler.bind(this)
    } else {
      this[LISTENERS][symbol] = handler.bind(this)
    }
  },

  bindActions(actions) {
    Object.keys(actions).forEach((action) => {
      var symbol = actions[action]
      var matchFirstCharacter = /./
      var assumedEventHandler = action.replace(
        matchFirstCharacter,
        (x) => `on${x[0].toUpperCase()}`
      )
      var handler = null

      // If you have both action and onAction
      if (this[action] && this[assumedEventHandler]) {
        throw new ReferenceError(
          `You have multiple action handlers bound to an action: ` +
          `${action} and ${assumedEventHandler}`
        )
      // action
      } else if (this[action]) {
        handler = this[action]
      // onAction
      } else if (this[assumedEventHandler]) {
        handler = this[assumedEventHandler]
      }

      if (handler) {
        this.bindAction(symbol, handler)
      }
    })
  },

  waitFor(tokens) {
    if (!tokens) {
      throw new ReferenceError('Dispatch tokens not provided')
    }
    tokens = Array.isArray(tokens) ? tokens : [tokens]
    this.dispatcher.waitFor(tokens)
  }
}

class Alt {
  constructor() {
    this.dispatcher = new Dispatcher()
    this[STORES_STORE] = {}
    this[BOOTSTRAP_FLAG] = false
  }

  createStore(StoreModel) {
    var key = StoreModel.displayName || StoreModel.name
    // Creating a class here so we don't overload the provided store's
    // prototype with the mixin behaviour and I'm extending from StoreModel
    // so we can inherit any extensions from the provided store.
    function Store() { StoreModel.call(this) }
    Store.prototype = StoreModel.prototype
    Store.prototype[LISTENERS] = {}
    Object.assign(Store.prototype, StoreMixin, {
      _storeName: key,
      dispatcher: this.dispatcher,
      getInstance: () => this[STORES_STORE][key]
    })

    var store = new Store()

    return this[STORES_STORE][key] = Object.assign(
      new AltStore(this.dispatcher, store),
      getInternalMethods(StoreModel, builtIns)
    )
  }

  createActions(ActionsClass) {
    var actions = Object.assign(
      {},
      getInternalMethods(ActionsClass.prototype, builtInProto)
    )

    ActionsClass.call({
      generateActions(...actionNames) {
        actionNames.forEach((actionName) => {
          // This is a function so we can later bind this to ActionCreator
          actions[actionName] = function (x, ...a) {
            this.dispatch(a.length ? [x].concat(a) : x)
          }
        })
      }
    })

    return Object.keys(actions).reduce((obj, action) => {
      var key = ActionsClass.displayName || ActionsClass.name
      var constant = formatAsConstant(action)
      var actionName = Symbol(`action ${key}.prototype.${action}`)

      // Wrap the action so we can provide a dispatch method
      var newAction = new ActionCreator(
        this.dispatcher,
        actionName,
        actions[action],
        obj
      )

      // Set all the properties on action
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
      Object.assign(this[STORES_STORE][key][STATE_CONTAINER], obj[key])
      if (this[STORES_STORE][key][STORE_BOOTSTRAP]) {
        this[STORES_STORE][key][STORE_BOOTSTRAP]()
      }
    })
    this[BOOTSTRAP_FLAG] = true
  }
}

module.exports = Alt
