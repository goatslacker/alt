var Dispatcher = require('flux').Dispatcher
var Symbol = require('es6-symbol')
var Promise = require('es6-promise').Promise
var EventEmitter = require('events').EventEmitter
//var EventEmitter = require('events').EventEmitter
Object.assign = Object.assign || require('object-assign')

//console.log(Dispatcher)

//class Unidirectional {
//  constructor() {
//    this.dispatcher = new Dispatcher()
//  }
//}

var dispatcher = new Dispatcher()

// XXX use immutable data stores for stores

var symState = Symbol('state container')
var symActionKey = Symbol('action key')
var listeners = Symbol('action listeners')
class Store extends EventEmitter {
  constructor() {
    this[symState] = this.getInitialState()
    this[listeners] = {}
    this.cb = null

    var setState = (newState) => {
      Object.assign(this[symState], newState)
      this.emit('change')
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

  actionListener(symbol, cb) {
    // XXX check if symbol properly
    if (symbol[symActionKey]) {
      this[listeners][symbol[symActionKey]] = cb
    } else {
      this[listeners][symbol] = cb
    }
    return this
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
  }
}

var symDispatch = Symbol('dispatch action')
var symHandler = Symbol('action creator handler')
class ActionCreator {
  constructor(name, action) {
    this.name = name
    this.action = action

    this[symHandler] = (...args) => {
      var value = this.action.apply(this, args)
      // XXX this is a shitty way to know if its a promise
      if (value.then) {
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

class Actions {
  constructor() {
    var proto = Object.getPrototypeOf(this)
    Object.keys(proto).forEach((action) => {
      var constant = action.replace(/[a-z]([A-Z])/g, (i) => {
        return i[0] + '_' + i[1].toLowerCase()
      }).toUpperCase()

      var actionName = Symbol('action ' + constant)

      var newAction = new ActionCreator(actionName, proto[action])
      this[action] = newAction[symHandler]
      this[action][symActionKey] = actionName
      this[constant] = actionName
    })
  }
}




class MyActions extends Actions {
  constructor() {
    super()
  }

  updateName(name) {
    return new Promise((resolve, reject) => {
      return resolve(name)
    })
  }
}
var myActions = new MyActions()



class MyStore extends Store {
  constructor() {
    super()
    this.actionListener(myActions.updateName, this.onUpdateName)
  }

  getInitialState() {
    return { name: 'lol' }
  }

  onUpdateName(name) {
    return new Promise((resolve, reject) => {
      return resolve({ name: name })
    })
  }
}
var myStore = new MyStore()




myStore.listen(() => console.log('Shit has changed', myStore.getCurrentState()))
console.log('=1', myStore.getCurrentState())
myActions.updateName('hello')
