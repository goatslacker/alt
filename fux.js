'use strict'

var Dispatcher = require('flux').Dispatcher
var EventEmitter = require('events').EventEmitter
var Promise = require('es6-promise').Promise
var Symbol = require('./es6-symbol.js')
Object.assign = Object.assign || require('object-assign')
var isPromise = require('is-promise')

var setState = Symbol('set state')
var symActionKey = Symbol('action key name')
var symListeners = Symbol('action listeners storage')
var symState = Symbol('state container')

class Store extends EventEmitter {
  constructor(dispatcher, store) {
    this[symState] = store.getInitialState()
    this[symListeners] = {}

    this[setState] = (newState) => {
      Object.assign(this[symState], newState)
      this.emit('change')
    }

    this.dispatchToken = dispatcher.register((payload) => {
      if (this[symListeners][payload.action]) {
        var state = this[symListeners][payload.action](payload.data)

        if (isPromise(state)) {
          state.then((data) => this[setState](data))
        } else {
          this[setState](state)
        }
      }
    })

    store.listenTo = (symbol, handler) => {
      if (symbol[symActionKey]) {
        this[symListeners][symbol[symActionKey]] = handler
      } else {
        this[symListeners][symbol] = handler
      }
    }

    store.init()
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

  getCurrentState() {
    return this[symState]
//    return Object.assign({}, this[symState])
  }
}

var symDispatch = Symbol('dispatch action')
var symHandler = Symbol('action creator handler')

class ActionCreator {
  constructor(dispatcher, name, action) {
    this.name = name
    this.action = action

    this[symHandler] = (...args) => {
      var value = this.action.apply(this, args)
      if (isPromise(value)) {
        value.then((data) => this[symDispatch](data))
      } else {
        this[symDispatch](value)
      }
    }

    this[symDispatch] = (data) => {
      dispatcher.dispatch({
        action: this.name,
        data: data
      })
    }
  }
}

var formatAsConstant = (name) => {
  return name.replace(/[a-z]([A-Z])/g, (i) => {
    return i[0] + '_' + i[1].toLowerCase()
  }).toUpperCase()
}

var symStores = Symbol('stores storage')

class Fux {
  constructor() {
    this.dispatcher = new Dispatcher()
    this[symStores] = {}
  }

  createStore(key, store) {
    return this[symStores][key] = new Store(this.dispatcher, store)
  }

  createActions(actions) {
    return Object.keys(actions).reduce((obj, action) => {
      var constant = formatAsConstant(action)
      var actionName = Symbol('action ' + constant)

      var newAction = new ActionCreator(
        this.dispatcher,
        actionName,
        actions[action]
      )

      obj[action] = newAction[symHandler]
      obj[action][symActionKey] = actionName
      obj[constant] = actionName

      return obj
    }, {})
  }

  takeSnapshot() {
    return JSON.stringify(Object.keys(this[symStores]).reduce((obj, key) => {
      obj[key] = this[symStores][key].getCurrentState()
      return obj
    }, {}))
  }

  bootstrap(data) {
    var obj = JSON.parse(data)
    Object.keys(obj).forEach((key) => {
      this[symStores][key][setState](obj[key])
    })
  }
}

Fux.Promise = Promise

module.exports = Fux
