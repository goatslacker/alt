'use strict'

import { Dispatcher } from 'flux'
import EventEmitter from 'eventemitter3'
import Symbol from 'es-symbol'
import assign from 'object-assign'

const ACTION_HANDLER = Symbol('action creator handler')
const ACTION_KEY = Symbol('holds the actions uid symbol for listening')
const ACTION_UID = Symbol('the actions uid name')
const ALL_LISTENERS = Symbol('name of listeners')
const EE = Symbol('event emitter instance')
const IMMUTABLE = Symbol.for('AltImmutableStore')
const INIT_SNAPSHOT = Symbol('init snapshot storage')
const LAST_SNAPSHOT = Symbol('last snapshot storage')
const LIFECYCLE = Symbol('store lifecycle listeners')
const LISTENERS = Symbol('stores action listeners storage')
const PUBLIC_METHODS = Symbol('store public method storage')
const STATE_CONTAINER = Symbol('the state container')

const GlobalActionsNameRegistry = {}

function formatAsConstant(name) {
  return name.replace(/[a-z]([A-Z])/g, (i) => {
    return `${i[0]}_${i[1].toLowerCase()}`
  }).toUpperCase()
}

function uid(container, name) {
  let count = 0
  let key = name
  while (Object.hasOwnProperty.call(container, key)) {
    key = name + String(++count)
  }
  return key
}

function setImmutableState(state) {
  const instance = this.getInstance()
  instance[STATE_CONTAINER] = state
  this.emitChange()
  return false
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

class AltStore {
  constructor(dispatcher, model, state, StoreModel) {
    this[EE] = new EventEmitter()
    this[LIFECYCLE] = {}
    this[STATE_CONTAINER] = state || model

    this.boundListeners = model[ALL_LISTENERS]
    this.StoreModel = StoreModel
    if (typeof this.StoreModel === 'object') {
      this.StoreModel.state = assign({}, StoreModel.state)
    }

    assign(this[LIFECYCLE], model[LIFECYCLE])
    assign(this, model[PUBLIC_METHODS])

    // Register dispatcher
    this.dispatchToken = dispatcher.register((payload) => {
      if (model[LISTENERS][payload.action]) {
        const result = model[LISTENERS][payload.action](payload.data)
        if (result !== false) {
          this.emitChange()
        }
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
    const state = this[STATE_CONTAINER]

    if (this.StoreModel[IMMUTABLE] === true) {
      return state
    }

    return Object.keys(state).reduce((obj, key) => {
      obj[key] = state[key]
      return obj
    }, {})
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

const StoreMixinListeners = {
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
    const key = symbol[ACTION_KEY] ? symbol[ACTION_KEY] : symbol
    this[LISTENERS][key] = handler.bind(this)
    this[ALL_LISTENERS].push(Symbol.keyFor(key))
  },

  bindActions(actions) {
    Object.keys(actions).forEach((action) => {
      const symbol = actions[action]
      const matchFirstCharacter = /./
      const assumedEventHandler = action.replace(matchFirstCharacter, (x) => {
        return `on${x[0].toUpperCase()}`
      })
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
        symbol.forEach((action) => {
          this.bindAction(action, listener)
        })
      } else {
        this.bindAction(symbol, listener)
      }
    })
  }

}

const StoreMixinEssentials = {
  waitFor(sources) {
    if (!sources) {
      throw new ReferenceError('Dispatch tokens not provided')
    }

    if (arguments.length === 1) {
      sources = Array.isArray(sources) ? sources : [sources]
    } else {
      sources = Array.prototype.slice.call(arguments)
    }

    let tokens = sources.map((source) => {
      return source.dispatchToken || source
    })

    this.dispatcher.waitFor(tokens)
  },

  exportPublicMethods(methods) {
    Object.keys(methods).forEach((methodName) => {
      if (typeof methods[methodName] !== 'function') {
        throw new TypeError('exportPublicMethods expects a function')
      }

      this[PUBLIC_METHODS][methodName] = methods[methodName]
    })
  },

  emitChange() {
    this.getInstance().emitChange()
  }
}

const setAppState = (instance, data, onStore) => {
  const obj = JSON.parse(data)
  Object.keys(obj).forEach((key) => {
    const store = instance.stores[key]
    if (store) {
      if (store[LIFECYCLE].deserialize) {
        obj[key] = store[LIFECYCLE].deserialize(obj[key]) || obj[key]
      }
      assign(store[STATE_CONTAINER], obj[key])
      onStore(store)
    }
  })
}

const snapshot = (instance, ...storeNames) => {
  const stores = storeNames.length ? storeNames : Object.keys(instance.stores)
  return stores.reduce((obj, key) => {
    const store = instance.stores[key]
    if (store[LIFECYCLE].snapshot) {
      store[LIFECYCLE].snapshot()
    }
    const customSnapshot = store[LIFECYCLE].serialize && store[LIFECYCLE].serialize()
    obj[key] = customSnapshot ? customSnapshot : store.getState()
    return obj
  }, {})
}

const saveInitialSnapshot = (instance, key) => {
  const state = instance.stores[key][STATE_CONTAINER]
  const initial = JSON.parse(instance[INIT_SNAPSHOT])
  initial[key] = state
  instance[INIT_SNAPSHOT] = JSON.stringify(initial)
  instance[LAST_SNAPSHOT] = instance[INIT_SNAPSHOT]
}

const filterSnapshotOfStores = (serializedSnapshot, storeNames) => {
  const stores = JSON.parse(serializedSnapshot)
  const storesToReset = storeNames.reduce((obj, name) => {
    if (!stores[name]) {
      throw new ReferenceError(`${name} is not a valid store`)
    }
    obj[name] = stores[name]
    return obj
  }, {})
  return JSON.stringify(storesToReset)
}

const createStoreFromObject = (alt, StoreModel, key, saveStore) => {
  let storeInstance

  const StoreProto = {}
  StoreProto[ALL_LISTENERS] = []
  StoreProto[LIFECYCLE] = {}
  StoreProto[LISTENERS] = {}

  assign(StoreProto, {
    _storeName: key,
    alt,
    dispatcher: alt.dispatcher,
    getInstance() {
      return storeInstance
    },
    setState(values = {}) {
      assign(this.state, values)
      this.emitChange()
      return false
    }
  }, StoreMixinListeners, StoreMixinEssentials, StoreModel)

  if (StoreModel[IMMUTABLE] === true) {
    StoreProto.setState = setImmutableState
  }

  // bind the store listeners
  /* istanbul ignore else */
  if (StoreProto.bindListeners) {
    StoreMixinListeners.bindListeners.call(StoreProto, StoreProto.bindListeners)
  }

  // bind the lifecycle events
  /* istanbul ignore else */
  if (StoreProto.lifecycle) {
    Object.keys(StoreProto.lifecycle).forEach((event) => {
      StoreMixinListeners.on.call(StoreProto, event, StoreProto.lifecycle[event])
    })
  }

  // create the instance and assign the public methods to the instance
  storeInstance = assign(
    new AltStore(alt.dispatcher, StoreProto, StoreProto.state, StoreModel),
    StoreProto.publicMethods
  )

  /* istanbul ignore else */
  if (saveStore) {
    alt.stores[key] = storeInstance
    saveInitialSnapshot(alt, key)
  }

  return storeInstance
}

class Alt {
  constructor() {
    this.dispatcher = new Dispatcher()
    this.actions = {}
    this.stores = {}
    this[LAST_SNAPSHOT] = this[INIT_SNAPSHOT] = '{}'
  }

  dispatch(action, data) {
    this.dispatcher.dispatch({ action, data })
  }

  createStore(StoreModel, iden, saveStore = true) {
    let storeInstance
    let key = iden || StoreModel.name || StoreModel.displayName || ''

    if (saveStore && (this.stores[key] || !key)) {
      /* istanbul ignore else */
      if (typeof console !== 'undefined') {
        if (this.stores[key]) {
          console.warn(new ReferenceError(
            `A store named ${key} already exists, double check your store ` +
            `names or pass in your own custom identifier for each store`
          ))
        } else {
          console.warn(new ReferenceError('Store name was not specified'))
        }
      }

      key = uid(this.stores, key)
    }

    if (typeof StoreModel === 'object') {
      return createStoreFromObject(this, StoreModel, key, saveStore)
    }

    // Creating a class here so we don't overload the provided store's
    // prototype with the mixin behaviour and I'm extending from StoreModel
    // so we can inherit any extensions from the provided store.
    class Store extends StoreModel {
      constructor(alt) {
        super(alt)
      }
    }

    assign(Store.prototype, StoreMixinListeners, StoreMixinEssentials, {
      _storeName: key,
      alt: this,
      dispatcher: this.dispatcher,
      getInstance() {
        return storeInstance
      },
      setState(values = {}) {
        assign(this, values)
        this.emitChange()
        return false
      }
    })

    if (StoreModel[IMMUTABLE] === true) {
      Store.prototype.setState = setImmutableState
    }

    Store.prototype[ALL_LISTENERS] = []
    Store.prototype[LIFECYCLE] = {}
    Store.prototype[LISTENERS] = {}
    Store.prototype[PUBLIC_METHODS] = {}

    const store = new Store(this)

    const state = StoreModel[IMMUTABLE] === true ? store.state : null

    storeInstance = assign(
      new AltStore(this.dispatcher, store, state, StoreModel),
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
    const key = ActionsClass.name || ActionsClass.displayName || ''

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
      const actionId = uid(GlobalActionsNameRegistry, `${key}#${action}`)
      GlobalActionsNameRegistry[actionId] = 1
      const actionName = Symbol.for(actionId)

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
        setTimeout(() => {
          newAction[ACTION_HANDLER].apply(null, args)
        })
      }
      obj[action][ACTION_KEY] = actionName
      obj[constant] = actionName

      return obj
    }, exportObj)
  }

  takeSnapshot(...storeNames) {
    const state = snapshot(this, ...storeNames)
    this[LAST_SNAPSHOT] = JSON.stringify(
      assign(JSON.parse(this[LAST_SNAPSHOT]), state)
    )
    return JSON.stringify(state)
  }

  rollback() {
    setAppState(this, this[LAST_SNAPSHOT], (store) => {
      if (store[LIFECYCLE].rollback) {
        store[LIFECYCLE].rollback()
      }
      store.emitChange()
    })
  }

  recycle(...storeNames) {
    const initialSnapshot = storeNames.length
      ? filterSnapshotOfStores(this[INIT_SNAPSHOT], storeNames)
      : this[INIT_SNAPSHOT]

    setAppState(this, initialSnapshot, (store) => {
      if (store[LIFECYCLE].init) {
        store[LIFECYCLE].init()
      }
    })
  }

  flush() {
    const state = JSON.stringify(snapshot(this))
    this.recycle()
    return state
  }

  bootstrap(data) {
    setAppState(this, data, (store) => {
      if (store[LIFECYCLE].bootstrap) {
        store[LIFECYCLE].bootstrap()
      }
      store.emitChange()
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
