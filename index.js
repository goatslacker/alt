var Dispatcher = require('flux').Dispatcher
var Symbol = require('es6-symbol')
var Promise = require('es6-promise').Promise
//var EventEmitter = require('events').EventEmitter
Object.assign = Object.assign || require('object-assign')

//console.log(Dispatcher)

class Unidirectional {
  constructor() {
    this.dispatcher = new Dispatcher()
  }
}

var dispatcher = new Dispatcher()

// XXX use immutable data stores for stores

var symState = Symbol('state container')
var listeners = Symbol('action listeners')
class Store {
  constructor() {
    this[symState] = this.getInitialState()
    this[listeners] = {}
    this.cb = null

    var setState = (newState) => {
      Object.assign(this[symState], newState)
      this.cb && this.cb()
    }

    this.dispatcherToken = dispatcher.register((payload) => {
      if (this[listeners][payload.action]) {
        var state = this[listeners][payload.action](payload.data)
        if (state.then) {
          state.then((data) => setState(data))
        } else {
          setState(state)
        }
      }
    })
  }

  listenTo(symbol, cb) {
    this[listeners][symbol] = cb
  }

  listen(cb) {
    // XXX use EE
    this.cb = cb
  }

  getCurrentState() {
    return this[symState]
  }
}

var symActions = Symbol('store for action symbols')
class Actions {
  constructor() {
    this[symActions] = {}

    var proto = Object.getPrototypeOf(this)
    Object.keys(proto).forEach((action) => {
      var actionName = Symbol('action ' + action)
      this[symActions][action] = actionName

      this[action] = (...args) => {
        var value = proto[action].apply(this, args)
        // XXX this is a shitty way to know if its a promise
        if (value.then) {
          value.then((data) => this.dispatch(actionName, data))
        } else {
          this.dispatch(actionName, value)
        }
      }
    })
  }

  sym(action) {
    if (!this[symActions][action]) {
      throw new ReferenceError()
    }

    return this[symActions][action]
  }

  dispatch(action, data) {
    console.log('OIOIOIOIOI', action)
    dispatcher.dispatch({
      action: action,
      data: data
    })
  }
}

class MyActions extends Actions {
  constructor() {
    super()
  }

  updateName(name) {
    return name
//    return new Promise((resolve, reject) => {
//      resolve(name)
//    })
  }
}

var myActions = new MyActions()

//var myActions = createActions({
//  onUpdateName(name) {
//    return new Promise((resolve, reject) => {
//      resolve(name)
//    })
//    return name
//  }
//})

class MyStore extends Store {
  constructor() {
    super()
    // XXX or i can have magic myActions.UPDATE_NAME
    // or I can make it not a class and overwrite its toString method
    this.listenTo(myActions.sym('updateName'), this.onUpdateName)
  }

  getInitialState() {
    return { name: 'lol' }
  }

  // XXX I need to explicitly listen to myActions.updateName for collission purposes
  onUpdateName(name) {
//    return new Promise((resolve, reject) => {
//      return resolve({ name: name })
//    })
    return { name: name }
  }
}
var myStore = new MyStore()

myStore.listen(() => console.log('Shit has changed', myStore.getCurrentState()))
console.log('=1', myStore.getCurrentState())
//console.log('@', myStore.setState({ name: 'foobar' }))

//console.log('Initial state', myStore.getCurrentState())
myActions.updateName('hello')
