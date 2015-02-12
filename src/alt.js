'use strict'

let Dispatcher = require('flux').Dispatcher
let EventEmitter = require('eventemitter3')
let Symbol = require('es-symbol')
let assign = require('object-assign')

let now = Date.now()
let VariableSymbol = (desc) => Symbol(`${now}${desc}`)

let ACTION_HANDLER = Symbol('action creator handler')
let ACTION_KEY = Symbol('holds the actions uid symbol for listening')
let ACTION_UID = Symbol('the actions uid name')
let EE = Symbol('event emitter instance')
let INIT_SNAPSHOT = Symbol('init snapshot storage')
let LAST_SNAPSHOT = Symbol('last snapshot storage')
let LIFECYCLE = Symbol('store lifecycle listeners')
let LISTENERS = Symbol('stores action listeners storage')
let STATE_CONTAINER = VariableSymbol('the state container')

let formatAsConstant = (name) => {
  return name.replace(/[a-z]([A-Z])/g, (i) => {
    return `${i[0]}_${i[1].toLowerCase()}`
  }).toUpperCase()
}

/* istanbul ignore next */
function NoopClass() { }

let builtIns = Object.getOwnPropertyNames(NoopClass)
let builtInProto = Object.getOwnPropertyNames(NoopClass.prototype)

let getInternalMethods = (obj, excluded) => {
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
    this[EE] = new EventEmitter()
    this[LIFECYCLE] = {}
    this[STATE_CONTAINER] = state

    assign(this[LIFECYCLE], state[LIFECYCLE])

    // Register dispatcher
    this.dispatchToken = dispatcher.register((payload) => {
      if (state[LISTENERS][payload.action]) {
        let result = state[LISTENERS][payload.action](payload.data)
        result !== false && this.emitChange()
      }
    })

    if (this[LIFECYCLE].init) {
      this[LIFECYCLE].init()
    }
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
    return assign({}, this[STATE_CONTAINER])
  }
}

class ActionCreator {
  constructor(alt, name, action, actions) {
    this[ACTION_UID] = name
    this[ACTION_HANDLER] = action.bind(this)
    this.actions = actions
    this.alt = alt
  }

  dispatch(data) {
    this.alt.dispatch(this[ACTION_UID], data)
  }
}

let StoreMixin = {
  on(lifecycleEvent, handler) {
    this[LIFECYCLE][lifecycleEvent] = handler.bind(this)
  },

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
      let symbol = actions[action]
      let matchFirstCharacter = /./
      let assumedEventHandler = action.replace(
        matchFirstCharacter,
        (x) => `on${x[0].toUpperCase()}`
      )
      let handler = null

      if (this[action] && this[assumedEventHandler]) {
        // If you have both action and onAction
        throw new ReferenceError(
          `You have multiple action handlers bound to an action: ` +
          `${action} and ${assumedEventHandler}`
        )
      } else if (this[action]) {
        // action
        handler = this[action]
      } else if (this[assumedEventHandler]) {
        // onAction
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

let setAppState = (instance, data, onStore) => {
  let obj = JSON.parse(data)
  Object.keys(obj).forEach((key) => {
    assign(instance.stores[key][STATE_CONTAINER], obj[key])
    onStore(instance.stores[key])
  })
}

let snapshot = (instance) => {
  return JSON.stringify(
    Object.keys(instance.stores).reduce((obj, key) => {
      if (instance.stores[key][LIFECYCLE].snapshot) {
        instance.stores[key][LIFECYCLE].snapshot()
      }
      obj[key] = instance.stores[key].getState()
      return obj
    }, {})
  )
}

let saveInitialSnapshot = (instance, key) => {
  let state = instance.stores[key][STATE_CONTAINER]
  let initial = JSON.parse(instance[INIT_SNAPSHOT])
  initial[key] = state
  instance[INIT_SNAPSHOT] = JSON.stringify(initial)
}

let filterSnapshotOfStores = (snapshot, storeNames) => {
  let stores = JSON.parse(snapshot)
  let storesToReset = storeNames.reduce((obj, name) => {
    if (!stores[name]) {
      throw new ReferenceError(`${name} is not a valid store`)
    }
    obj[name] = stores[name]
    return obj
  }, {})
  return JSON.stringify(storesToReset)
}

class Alt {
  constructor() {
    this.dispatcher = new Dispatcher()
    this.actions = {}
    this.stores = {}
    this[LAST_SNAPSHOT] = null
    this[INIT_SNAPSHOT] = '{}'
  }

  dispatch(action, data) {
    this.dispatcher.dispatch({ action, data })
  }

  createStore(StoreModel, iden) {
    let key = iden || StoreModel.displayName || StoreModel.name
    // Creating a class here so we don't overload the provided store's
    // prototype with the mixin behaviour and I'm extending from StoreModel
    // so we can inherit any extensions from the provided store.
    function Store() {
      this[LIFECYCLE] = {}
      this[LISTENERS] = {}
      StoreModel.call(this)
    }
    Store.prototype = StoreModel.prototype
    assign(Store.prototype, StoreMixin, {
      _storeName: key,
      alt: this,
      dispatcher: this.dispatcher,
      getInstance: () => this.stores[key]
    })

    let store = new Store()

    if (this.stores[key]) {
      throw new ReferenceError(
`A store named ${key} already exists, double check your store names or pass in
your own custom identifier for each store`
      )
    }

    this.stores[key] = assign(
      new AltStore(this.dispatcher, store),
      getInternalMethods(StoreModel, builtIns)
    )

    saveInitialSnapshot(this, key)

    return this.stores[key]
  }

  createActions(ActionsClass, exportObj = {}) {
    let actions = assign(
      {},
      getInternalMethods(ActionsClass.prototype, builtInProto)
    )
    let key = ActionsClass.displayName || ActionsClass.name

    function ActionsGenerator() { ActionsClass.call(this) }
    ActionsGenerator.prototype = ActionsClass.prototype
    ActionsGenerator.prototype.generateActions = (...actionNames) => {
      actionNames.forEach((actionName) => {
        // This is a function so we can later bind this to ActionCreator
        actions[actionName] = function (x, ...a) {
          this.dispatch(a.length ? [x].concat(a) : x)
        }
      })
    }

    new ActionsGenerator()

    return Object.keys(actions).reduce((obj, action) => {
      let constant = formatAsConstant(action)
      let actionName = Symbol(`action ${key}#${action}`)

      // Wrap the action so we can provide a dispatch method
      let newAction = new ActionCreator(
        this,
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
    }, exportObj)
  }

  takeSnapshot() {
    let state = snapshot(this)
    this[LAST_SNAPSHOT] = state
    return state
  }

  rollback() {
    setAppState(this, this[LAST_SNAPSHOT], (store) => {
      if (store[LIFECYCLE].rollback) {
        store[LIFECYCLE].rollback()
      }
    })
  }

  recycle(...storeNames) {
    let snapshot = storeNames.length
      ? filterSnapshotOfStores(this[INIT_SNAPSHOT], storeNames)
      : this[INIT_SNAPSHOT]

    setAppState(this, snapshot, (store) => {
      if (store[LIFECYCLE].init) {
        store[LIFECYCLE].init()
      }
    })
  }

  flush() {
    let state = snapshot(this)
    this.recycle()
    return state
  }

  bootstrap(data) {
    setAppState(this, data, (store) => {
      if (store[LIFECYCLE].bootstrap) {
        store[LIFECYCLE].bootstrap()
      }
    })
  }

  // Instance type methods for injecting alt into your application as context

  addActions(name, ActionsClass) {
    this.actions[name] = this.createActions(ActionsClass)
  }

  addStore(name, StoreModel) {
    this.createStore(StoreModel, name)
  }

  getActions(name) {
    return this.actions[name]
  }

  getStore(name) {
    return this.stores[name]
  }
}

module.exports = Alt
