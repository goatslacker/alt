var Dispatcher = require('flux').Dispatcher
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

class Store {
  constructor() {
    this.state = this.getInitialState()
    this.cb = null

    console.log('im here')

    this.dispatcherToken = dispatcher.register((payload) => {
      console.log('@@@@@@')
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
    // XXX make this priavate using Symbols
    return this.state
  }

  setState(obj) {
    Object.assign(this.state, obj)
    this.trigger()
  }
}

//function createActions(actions) {
//  return actions.reduce((obj, actionName) => {
//    obj[actionName] = (data) => {
//      console.log('Dispatching...', actionName, data)
//      dispatcher.dispatch({
//        action: actionName,
//        data: data
//      })
//    }
//    return obj
//  }, {})
//}
//
//var actions = createActions([
//  'updateName'
//])

class Actions {
  dispatch(data) {
    dispatcher.dispatch({
      action: 'onUpdateName',
      data: data
    })
  }
}

class MyActions extends Actions {
  updateName(name) {
    this.dispatch(name)
  }
}

var myActions = new MyActions()

//var myStore = new Store({
//  init() {
//    var log = {}
//    Object.keys({ a: 0, b: 0 }).forEach((food) => log[food] = 0)
//
//    return {
//      id: null,
//      name: 'lol',
//      date: Date.now(),
//      log
//    }
//  },
//
//  listeners: {
//    updateName: (name) => {
//      console.log('xxxxxxxxxxxx')
//      this.name = name
//    }
//    [actions.updateName]: (name) => {
//      this.name = name
//    }
//  }
//})

class MyStore extends Store {
  constructor() {
    super()
  }

  getInitialState() {
    console.log('XXXXXX')
    var log = {}
    Object.keys({ a: 0, b: 0 }).forEach((food) => log[food] = 0)

    return {
      id: null,
      name: 'lol',
      date: Date.now(),
      log
    }
  }

  // XXX onUpdateName
  onUpdateName(name) {
    console.log('Updating name to', name)
    this.setState({
      name: name
    })
  }
}
var myStore = new MyStore()

console.log('Initial state', myStore.getCurrentState())
myStore.listen(() => console.log('Shit has changed', myStore.getCurrentState()))
myActions.updateName('hello')
