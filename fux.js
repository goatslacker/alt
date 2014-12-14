'use strict'

var Dispatcher = require('flux').Dispatcher
var EventEmitter = require('events').EventEmitter
var Symbol = require('./polyfills/es6-symbol')
Object.assign = Object.assign || require('object-assign')

var ACTION_DISPATCHER = Symbol('action dispatcher storage')
var ACTION_HANDLER = Symbol('action creator handler')
var ACTION_KEY = Symbol('holds the actions uid symbol for listening')
var ACTION_UID = Symbol('the actions uid name')
var LISTENERS = Symbol('stores action listeners storage')
var MIXIN_REGISTRY = Symbol('mixin registry')
var SET_STATE = Symbol('a set state method you should never call directly')
var STATE_CONTAINER = Symbol('state container')
var STORES_STORE = Symbol('stores storage')

var formatAsConstant = (name) => {
  return name.replace(/[a-z]([A-Z])/g, (i) => {
    return `${i[0]}_${i[1].toLowerCase()}`
  }).toUpperCase()
}


class Store extends EventEmitter {
  constructor(dispatcher, state, listeners) {
    this[LISTENERS] = {}
    this[STATE_CONTAINER] = state

    // A special setState method we use to bootstrap and keep state current
    this[SET_STATE] = (newState) => {
      if (this[STATE_CONTAINER] !== newState) {
        Object.assign(this[STATE_CONTAINER], newState)
      }
      this.emit('change')
    }

    // Register dispatcher
    this.dispatchToken = dispatcher.register((payload) => {
      if (this[LISTENERS][payload.action]) {
        var state = this[LISTENERS][payload.action](payload.data)

        if (state) {
          this[SET_STATE](state)
        }
      }
    })

    // Transfer over the listeners
    Object.keys(listeners).forEach((listener) => {
      this[LISTENERS][listener] = listeners[listener]
    })
  }

  emitChange() {
    this.emit('change')
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

var ActionListeners = {
  listeners: {},

  listenTo(symbol, handler) {
    if (symbol[ACTION_KEY]) {
      this.listeners[symbol[ACTION_KEY]] = handler.bind(this)
    } else {
      this.listeners[symbol] = handler.bind(this)
    }
  },

  listenToActions(actions) {
    Object.keys(actions).forEach((action) => {
      var symbol = actions[action]
      var assumedEventHandler = action.replace(
        /./,
        (x) => `on${x[0].toUpperCase()}`
      )
      if (this[assumedEventHandler]) {
        if (symbol[ACTION_KEY]) {
          this.listeners[symbol[ACTION_KEY]] = this[assumedEventHandler]
        } else {
          this.listeners[symbol] = this[assumedEventHandler]
        }
      }
    })
  }
}

class Fux {
  constructor() {
    this.dispatcher = new Dispatcher()
    this[STORES_STORE] = {}
  }

  createStore(StoreModel) {
    Object.assign(StoreModel.prototype, ActionListeners)
    var key = StoreModel.displayName || StoreModel.name
    var store = new StoreModel()
    var state = store.getInitialState()
    return this[STORES_STORE][key] = new Store(
      this.dispatcher,
      state,
      store.listeners
    )
  }

  createActions(actions) {
    return Object.keys(actions).reduce((obj, action) => {
      var constant = formatAsConstant(action)
      var actionName = Symbol(`action ${constant}`)

      var handler = typeof actions[action] === 'function'
        ? actions[action]
        : function (x) { this.dispatch(x) }

      var newAction = new ActionCreator(
        this.dispatcher,
        actionName,
        handler
      )

      obj[action] = newAction[ACTION_HANDLER]
      obj[action][ACTION_KEY] = actionName
      obj[constant] = actionName

      return obj
    }, {})
  }

  takeSnapshot() {
    return JSON.stringify(Object.keys(this[STORES_STORE]).reduce((obj, key) => {
      obj[key] = this[STORES_STORE][key].getState()
      return obj
    }, {}))
  }

  bootstrap(data) {
    var obj = JSON.parse(data)
    Object.keys(obj).forEach((key) => {
      this[STORES_STORE][key][SET_STATE](obj[key])
    })
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
