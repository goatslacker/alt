import assign from 'object-assign'
import { Dispatcher } from 'flux'

import makeAction from './utils/makeAction'
import {
  filterSnapshots,
  saveInitialSnapshot,
  setAppState,
  snapshot
} from './utils/StateFunctions'
import {
  createStoreConfig,
  createStoreFromObject,
  createStoreFromClass,
  transformStore
} from './utils/StoreUtils'
import {
  ACTION_KEY,
  ACTIONS_REGISTRY,
  INIT_SNAPSHOT,
  LAST_SNAPSHOT,
  LIFECYCLE
} from './symbols/symbols'
import {
  dispatchIdentity,
  formatAsConstant,
  getInternalMethods,
  uid,
  warn
} from './utils/AltUtils'

class Alt {
  constructor(config = {}) {
    this.config = config
    this.serialize = config.serialize || JSON.stringify
    this.deserialize = config.deserialize || JSON.parse
    this.dispatcher = config.dispatcher || new Dispatcher()
    this.actions = { global: {} }
    this.stores = {}
    this.storeTransforms = config.storeTransforms || []
    this[ACTIONS_REGISTRY] = {}
    this[INIT_SNAPSHOT] = {}
    this[LAST_SNAPSHOT] = {}
  }

  dispatch(action, data) {
    this.dispatcher.dispatch({ action, data })
  }

  createUnsavedStore(StoreModel, ...args) {
    const key = StoreModel.displayName || ''
    createStoreConfig(this.config, StoreModel)
    const Store = transformStore(this.storeTransforms, StoreModel)

    return typeof Store === 'object'
      ? createStoreFromObject(this, Store, key)
      : createStoreFromClass(this, Store, key, ...args)
  }

  createStore(StoreModel, iden, ...args) {
    let key = iden || StoreModel.displayName || StoreModel.name || ''
    createStoreConfig(this.config, StoreModel)
    const Store = transformStore(this.storeTransforms, StoreModel)

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

    const storeInstance = typeof Store === 'object'
      ? createStoreFromObject(this, Store, key)
      : createStoreFromClass(this, Store, key, ...args)

    this.stores[key] = storeInstance
    saveInitialSnapshot(this, key)

    return storeInstance
  }

  generateActions(...actionNames) {
    const actions = { name: 'global' }
    return this.createActions(actionNames.reduce((obj, action) => {
      obj[action] = dispatchIdentity
      return obj
    }, actions))
  }

  createAction(name, implementation, obj) {
    return makeAction(this, 'global', name, implementation, obj)
  }

  createActions(ActionsClass, exportObj = {}, ...argsForConstructor) {
    const actions = {}
    const key = uid(
      this[ACTIONS_REGISTRY],
      ActionsClass.displayName || ActionsClass.name || 'Unknown'
    )

    if (typeof ActionsClass === 'function') {
      assign(actions, getInternalMethods(ActionsClass.prototype, true))
      class ActionsGenerator extends ActionsClass {
        constructor(...args) {
          super(...args)
        }

        generateActions(...actionNames) {
          actionNames.forEach((actionName) => {
            actions[actionName] = dispatchIdentity
          })
        }
      }

      assign(actions, new ActionsGenerator(...argsForConstructor))
    } else {
      assign(actions, ActionsClass)
    }

    this.actions[key] = this.actions[key] || {}

    return Object.keys(actions).reduce((obj, action) => {
      if (typeof actions[action] !== 'function') {
        return obj
      }

      // create the action
      obj[action] = makeAction(
        this,
        key,
        action,
        actions[action],
        obj
      )

      // generate a constant
      const constant = formatAsConstant(action)
      obj[constant] = obj[action][ACTION_KEY]

      return obj
    }, exportObj)
  }

  takeSnapshot(...storeNames) {
    const state = snapshot(this, storeNames)
    assign(this[LAST_SNAPSHOT], state)
    return this.serialize(state)
  }

  rollback() {
    setAppState(this, this.serialize(this[LAST_SNAPSHOT]), (store) => {
      if (store[LIFECYCLE].rollback) {
        store[LIFECYCLE].rollback()
      }
      store.emitChange()
    })
  }

  recycle(...storeNames) {
    const initialSnapshot = storeNames.length
      ? filterSnapshots(this, this[INIT_SNAPSHOT], storeNames)
      : this[INIT_SNAPSHOT]

    setAppState(this, this.serialize(initialSnapshot), (store) => {
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

  prepare(store, payload) {
    const data = {}
    if (!store._storeName) {
      throw new ReferenceError('Store provided does not have a name')
    }
    data[store._storeName] = payload
    return this.serialize(data)
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

export { Dispatcher }
export default Alt
