var Dispatcher = require('flux').Dispatcher
var Symbol = require('es6-symbol');
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

    this.setState = (newState) => {
      Object.assign(this[symState], newState)
      this.trigger()
    }

//    console.log('im here')

    this.dispatcherToken = dispatcher.register((payload) => {
//      console.log('@@@@@@')
      if (this[payload.action]) {
        this[payload.action](payload.data)
      }
    })
  }

  trigger(args) {
    console.log('Triggering change')
    // XXX use EE
    this.cb && this.cb(args)
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
    // XXX one approach i can take is iterate through the damn prototype to find the actions
    // or i can pass them in...
//    console.log(this)
    var proto = Object.getPrototypeOf(this)
    Object.keys(proto).forEach((action) => {
      this[action] = (...args) => {
        proto[action].apply(this, args)
      }
    })
//    console.log('yes', Object.getPrototypeOf(this))
  }

  dispatch(data) {
    console.log('OIOIOIOIOI')
    dispatcher.dispatch({
      action: 'onUpdateName',
      data: data
    })
  }
}

class MyActions extends Actions {
  constructor() {
    super()
  }

  updateName(name) {
    // XXX I need to tell the dispatcher where im coming from :(
    this.dispatch(name)
  }
}

var myActions = new MyActions()

class MyStore extends Store {
  constructor() {
    super()
  }

  getInitialState() {
//    this.name = 'lol'
//    console.log('XXXXXX')
//    var log = {}
//    Object.keys({ a: 0, b: 0 }).forEach((food) => log[food] = 0)

    return {
//      id: null,
      name: 'lol',
//      date: Date.now(),
//      log
    }
  }

  onUpdateName(name) {
    console.log('Updating name to', name)
    // XXX this setState as first arg is a hack...
    this.setState({
      name: name
    })
  }
}
var myStore = new MyStore()

console.log('=1', myStore.getCurrentState())
console.log('@', myStore.setState({ name: 'foobar' }))

console.log('=2', myStore.getCurrentState())

//console.log('Initial state', myStore.getCurrentState())
//myStore.listen(() => console.log('Shit has changed', myStore.getCurrentState()))
myActions.updateName('hello')
