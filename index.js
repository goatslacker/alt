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
var setState = Symbol('setting state')
class Store {
  constructor() {
    this[symState] = this.getInitialState()
    this.cb = null

    var setState = (newState) => {
      Object.assign(this[symState], newState)
      this.cb && this.cb()
    }

    this.dispatcherToken = dispatcher.register((payload) => {
//      console.log('@@@@@@')
      if (this[payload.action]) {
        var state = this[payload.action](payload.data)
        if (state.then) {
          state.then((data) => setState(data))
        } else {
          setState(state)
        }
      }
    })
  }

  listen(cb) {
    // XXX use EE
    this.cb = cb
  }

  getCurrentState() {
    return this[symState]
  }
}

class Actions {
  constructor() {
    var proto = Object.getPrototypeOf(this)
    Object.keys(proto).forEach((action) => {
      this[action] = (...args) => {
        var value = proto[action].apply(this, args)
        // XXX this is a shitty way to know if its a promise
        if (value.then) {
          value.then((data) => this.dispatch(action, data))
        } else {
          this.dispatch(action, value)
        }
      }
    })
  }

  dispatch(action, data) {
    console.log('OIOIOIOIOI')
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
  }

  getInitialState() {
    return { name: 'lol' }
  }

  // XXX I need to explicitly listen to myActions.updateName for collission purposes
  updateName(name) {
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
