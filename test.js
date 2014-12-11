var Dispatcher = require('flux').Dispatcher
var assign = require('object-assign')

var dispatcher = new Dispatcher()

// XXX use immutable data stores for stores

function createActions(actions) {
  return actions.reduce((obj, actionName) => {
    obj[actionName] = (data) => {
      console.log('Dispatching...', actionName, data)
      dispatcher.dispatch({
        action: actionName,
        data: data
      })
    }
    return obj
  }, {})
}

//class Actions {
//  dispatch(data) {
//    dispatcher.dispatch({
//      action: 'onUpdateName',
//      data: data
//    })
//  }
//}
//
//class MyActions extends Actions {
//  updateName(name) {
//    this.dispatch(name)
//  }
//}
//
//var myActions = new MyActions()

// XXX make newActions
var myActions = createActions([
  'updateName'
])

//var myActions = new Actions({
//  updateName(name) {
//    this.dispatch(name)
//  }
//})
//
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

class Store {
  constructor(store) {
    this.state = store.getInitialState()

    this.dispatcherToken = dispatcher.register((payload) => {
      console.log('XX', store.actions)
      console.log('weeeeeeeee', payload)
      if (store.actions[payload.action]) {
        var newState = store.actions[payload.action](payload.data)
        this.state = assign(this.state, newState)
        this.trigger()
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
}

var foo = {
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
  },
  actions: {
    updateName(name) {
      return { name: name }
    }
  }
}

var myStore = new Store(foo)

//  actions: {
//    [myActions.updateName]: (name) => {
      // XXX so we either set it and then trigger
      // or return an object and do object-assign...
//      this.name = name
      // XXX setState may be fine, i may want to set it directly though and then have a trigger
      // returning is not ideal because async...
//      return { name: name }
//    }
//  }
//})

console.log('Initial state', myStore.getCurrentState())
myStore.listen(() => console.log('Shit has changed', myStore.getCurrentState()))
myActions.updateName('hello')
