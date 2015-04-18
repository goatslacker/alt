import { Dispatcher } from 'flux'
import Symbol from 'es-symbol'
import assign from 'object-assign'
import {
  ACTION_HANDLER,
  ACTION_KEY,
  ACTION_UID,
  ALL_LISTENERS,
  EE,
  INIT_SNAPSHOT,
  LAST_SNAPSHOT,
  LIFECYCLE,
  LISTENERS,
  PUBLIC_METHODS,
  STATE_CHANGED,
  STATE_CONTAINER
} from './symbols/symbols'
import ActionCreator from './ActionCreator'
import {createStoreFromObject, createStoreFromClass} from './utils/createStore'
import {warn} from './utils/warnings'
import {getInternalMethods, builtInProto} from './utils/helpers'
import formatAsConstant from './utils/formatAsConstant'
import uid from './utils/uid'

const GlobalActionsNameRegistry = {}


function setAppState(instance, data, onStore) {
  const obj = instance.deserialize(data)
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

function snapshot(instance, ...storeNames) {
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

function saveInitialSnapshot(instance, key) {
  const state = instance.stores[key][STATE_CONTAINER]
  const initial = instance.deserialize(instance[INIT_SNAPSHOT])
  initial[key] = state
  instance[INIT_SNAPSHOT] = instance.serialize(initial)
  instance[LAST_SNAPSHOT] = instance[INIT_SNAPSHOT]
}

function filterSnapshotOfStores(instance, serializedSnapshot, storeNames) {
  const stores = instance.deserialize(serializedSnapshot)
  const storesToReset = storeNames.reduce((obj, name) => {
    if (!stores[name]) {
      throw new ReferenceError(`${name} is not a valid store`)
    }
    obj[name] = stores[name]
    return obj
  }, {})
  return instance.serialize(storesToReset)
}

class Alt {
  constructor(config = {}) {
    this.serialize = config.serialize || JSON.stringify
    this.deserialize = config.deserialize || JSON.parse
    this.dispatcher = config.dispatcher || new Dispatcher()
    this.actions = {}
    this.stores = {}
    this[LAST_SNAPSHOT] = this[INIT_SNAPSHOT] = '{}'
  }

  dispatch(action, data) {
    this.dispatcher.dispatch({ action, data })
  }

  createUnsavedStore(StoreModel, ...args) {
    const key = StoreModel.displayName || ''
    return typeof StoreModel === 'object'
      ? createStoreFromObject(this, StoreModel, key)
      : createStoreFromClass(this, StoreModel, key, ...args)
  }

  createStore(StoreModel, iden, ...args) {
    let key = iden || StoreModel.name || StoreModel.displayName || ''

    if (this.stores[key] || !key) {
      if (this.stores[key]) {
        warn(
          `A store named ${key} already exists, double check your store ` +
          `names or pass in your own custom identifier for each store`
        )
      } else {
        warn('Store name was not specified')
      }

      key = uid(this.stores, key)
    }

    const storeInstance = typeof StoreModel === 'object'
      ? createStoreFromObject(this, StoreModel, key)
      : createStoreFromClass(this, StoreModel, key, ...args)

    this.stores[key] = storeInstance
    saveInitialSnapshot(this, key)

    return storeInstance
  }

  generateActions(...actionNames) {
    return this.createActions(function () {
      this.generateActions(...actionNames)
    })
  }

  createAction(name, implementation, obj) {
    const actionId = uid(GlobalActionsNameRegistry, name)
    GlobalActionsNameRegistry[actionId] = 1
    const actionName = Symbol.for(actionId)

    // Wrap the action so we can provide a dispatch method
    const newAction = new ActionCreator(this, actionName, implementation, obj)

    const action = newAction[ACTION_HANDLER]
    action.defer = (...args) => {
      setTimeout(() => {
        newAction[ACTION_HANDLER].apply(null, args)
      })
    }
    action[ACTION_KEY] = actionName
    return action
  }

  createActions(ActionsClass, exportObj = {}, ...argsForConstructor) {
    const actions = {}
    const key = ActionsClass.name || ActionsClass.displayName || ''

    if (typeof ActionsClass === 'function') {
      assign(actions, getInternalMethods(ActionsClass.prototype, builtInProto))
      class ActionsGenerator extends ActionsClass {
        constructor(...args) {
          super(...args)
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

      assign(actions, new ActionsGenerator(...argsForConstructor))
    } else {
      assign(actions, ActionsClass)
    }

    return Object.keys(actions).reduce((obj, action) => {
      obj[action] = this.createAction(`${key}#${action}`, actions[action], obj)
      const constant = formatAsConstant(action)
      obj[constant] = obj[action][ACTION_KEY]
      return obj
    }, exportObj)
  }

  takeSnapshot(...storeNames) {
    const state = snapshot(this, ...storeNames)
    this[LAST_SNAPSHOT] = this.serialize(
      assign(this.deserialize(this[LAST_SNAPSHOT]), state)
    )
    return this.serialize(state)
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
      ? filterSnapshotOfStores(this, this[INIT_SNAPSHOT], storeNames)
      : this[INIT_SNAPSHOT]

    setAppState(this, initialSnapshot, (store) => {
      if (store[LIFECYCLE].init) {
        store[LIFECYCLE].init()
      }
      store.emitChange()
    })
  }

  flush() {
    const state = this.serialize(snapshot(this))
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

  addActions(name, ActionsClass, ...args) {
    this.actions[name] = Array.isArray(ActionsClass)
      ? this.generateActions.apply(this, ActionsClass)
      : this.createActions(ActionsClass, ...args)
  }

  addStore(name, StoreModel, ...args) {
    this.createStore(StoreModel, name, ...args)
  }

  getActions(name) {
    return this.actions[name]
  }

  getStore(name) {
    return this.stores[name]
  }
}

export default Alt
