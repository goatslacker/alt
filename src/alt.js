'use strict'

import { Dispatcher } from 'flux'
import EventEmitter from 'eventemitter3'
import Symbol from 'es-symbol'
import assign from 'object-assign'

const now = Date.now()
const VariableSymbol = (desc) => Symbol(`${now}${desc}`)

const ACTION_HANDLER = Symbol('action creator handler')
const ACTION_KEY = Symbol('holds the actions uid symbol for listening')
const ACTION_UID = Symbol('the actions uid name')
const EE = Symbol('event emitter instance')
const INIT_SNAPSHOT = Symbol('init snapshot storage')
const LAST_SNAPSHOT = Symbol('last snapshot storage')
const LIFECYCLE = Symbol('store lifecycle listeners')
const LISTENERS = Symbol('stores action listeners storage')
const STATE_CONTAINER = VariableSymbol('the state container')

const formatAsConstant = (name) => {
  return name.replace(/[a-z]([A-Z])/g, (i) => {
    return `${i[0]}_${i[1].toLowerCase()}`
  }).toUpperCase()
}

/* istanbul ignore next */
function NoopClass() { }

const builtIns = Object.getOwnPropertyNames(NoopClass)
const builtInProto = Object.getOwnPropertyNames(NoopClass.prototype)

const getInternalMethods = (obj, excluded) => {
  return Object.getOwnPropertyNames(obj).reduce((value, m) => {
    if (excluded.indexOf(m) !== -1) {
      return value
    }

    value[m] = obj[m]
    return value
  }, {})
}

const getInheritedMethods = (obj, methods = {}) => {
  if (Object.getPrototypeOf(obj) !== Object.getPrototypeOf(NoopClass)) {
    let ancestorObj = Object.getPrototypeOf(obj)
    let ancestorMethods = getInternalMethods(ancestorObj, builtIns)

    for (let m in ancestorMethods) {
      methods[m] = methods[m] || ancestorMethods[m]
    }

    return getInheritedMethods(ancestorObj, methods)
  } else {
    return methods
  }
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
        const result = state[LISTENERS][payload.action](payload.data)
        result !== false && this.emitChange()
      }
    })

    if (this[LIFECYCLE].init) {
      this[LIFECYCLE].init()
    }
  }

  getEventEmitter() {
    return this[EE]
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

const StoreMixin = {
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
        `${(symbol[ACTION_KEY] || symbol).toString()} was defined with 2 ` +
        `parameters. Only a single parameter is passed through the ` +
        `dispatcher, did you mean to pass in an Object instead?`
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
      const symbol = actions[action]
      const matchFirstCharacter = /./
      const assumedEventHandler = action.replace(
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

  bindListeners(obj) {
    Object.keys(obj).forEach((methodName) => {
      const symbol = obj[methodName]
      const listener = this[methodName]

      if (!listener) {
        throw new ReferenceError(
          `${methodName} defined but does not exist in ${this._storeName}`
        )
      }

      if (Array.isArray(symbol)) {
        symbol.forEach((action) => this.bindAction(action, listener))
      } else {
        this.bindAction(symbol, listener)
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

const setAppState = (instance, data, onStore) => {
  const obj = JSON.parse(data)
  Object.keys(obj).forEach((key) => {
    assign(instance.stores[key][STATE_CONTAINER], obj[key])
    onStore(instance.stores[key])
  })
}

const snapshot = (instance) => {
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

const saveInitialSnapshot = (instance, key) => {
  const state = instance.stores[key][STATE_CONTAINER]
  const initial = JSON.parse(instance[INIT_SNAPSHOT])
  initial[key] = state
  instance[INIT_SNAPSHOT] = JSON.stringify(initial)
}

const filterSnapshotOfStores = (snapshot, storeNames) => {
  const stores = JSON.parse(snapshot)
  const storesToReset = storeNames.reduce((obj, name) => {
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

  createStore(StoreModel, iden, saveStore = true) {
    let storeInstance
    const key = iden || StoreModel.displayName || StoreModel.name

    if (saveStore && this.stores[key]) {
      throw new ReferenceError(
`A store named ${key} already exists, double check your store names or pass in
your own custom identifier for each store`
      )
    }

    // Creating a class here so we don't overload the provided store's
    // prototype with the mixin behaviour and I'm extending from StoreModel
    // so we can inherit any extensions from the provided store.
    class Store extends StoreModel {
      constructor(alt) {
        this[LIFECYCLE] = {}
        this[LISTENERS] = {}
        super(alt)
      }
    }

    assign(Store.prototype, StoreMixin, {
      _storeName: key,
      alt: this,
      dispatcher: this.dispatcher,
      getInstance: () => storeInstance
    })

    const store = new Store(this)

    storeInstance = assign(
      new AltStore(this.dispatcher, store),
      getInheritedMethods(StoreModel),
      getInternalMethods(StoreModel, builtIns)
    )

    if (saveStore) {
      this.stores[key] = storeInstance
      saveInitialSnapshot(this, key)
    }

    return storeInstance
  }

  generateActions(...actionNames) {
    return this.createActions(function () {
      this.generateActions(...actionNames)
    })
  }

  createActions(ActionsClass, exportObj = {}) {
    const actions = assign(
      {},
      getInternalMethods(ActionsClass.prototype, builtInProto)
    )
    const key = ActionsClass.displayName || ActionsClass.name

    class ActionsGenerator extends ActionsClass {
      constructor(alt) {
        super(alt)
      }

      generateActions(...actionNames) {
        actionNames.forEach((actionName) => {
          // This is a function so we can later bind this to ActionCreator
          actions[actionName] = function (x, ...a) {
            this.dispatch(a.length ? [x].concat(a) : x)
          }
        })
      }
    }

    new ActionsGenerator(this)

    return Object.keys(actions).reduce((obj, action) => {
      const constant = formatAsConstant(action)
      const actionName = Symbol(`${key}#${action}`)

      // Wrap the action so we can provide a dispatch method
      const newAction = new ActionCreator(
        this,
        actionName,
        actions[action],
        obj
      )

      // Set all the properties on action
      obj[action] = newAction[ACTION_HANDLER]
      obj[action].defer = (...args) => {
        setTimeout(() => newAction[ACTION_HANDLER].apply(null, args))
      }
      obj[action][ACTION_KEY] = actionName
      obj[constant] = actionName

      return obj
    }, exportObj)
  }

  takeSnapshot() {
    const state = snapshot(this)
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
    const snapshot = storeNames.length
      ? filterSnapshotOfStores(this[INIT_SNAPSHOT], storeNames)
      : this[INIT_SNAPSHOT]

    setAppState(this, snapshot, (store) => {
      if (store[LIFECYCLE].init) {
        store[LIFECYCLE].init()
      }
    })
  }

  flush() {
    const state = snapshot(this)
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

  addStore(name, StoreModel, saveStore) {
    this.createStore(StoreModel, name, saveStore)
  }

  getActions(name) {
    return this.actions[name]
  }

  getStore(name) {
    return this.stores[name]
  }
}

export default Alt
