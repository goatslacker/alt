import { Dispatcher } from 'flux'

import * as StateFunctions from './utils/StateFunctions'
import * as Sym from './symbols/symbols'
import * as store from './store'
import * as utils from './utils/AltUtils'
import makeAction from './actions'

class Alt {
  constructor(config = {}) {
    this.config = config
    this.serialize = config.serialize || JSON.stringify
    this.deserialize = config.deserialize || JSON.parse
    this.dispatcher = config.dispatcher || new Dispatcher()
    this.actions = { global: {} }
    this.stores = {}
    this.storeTransforms = config.storeTransforms || []
    this[Sym.ACTIONS_REGISTRY] = {}
    this[Sym.INIT_SNAPSHOT] = {}
    this[Sym.LAST_SNAPSHOT] = {}
  }

  dispatch(action, data, details) {
    this.dispatcher.dispatch({ action, data, details })
  }

  createUnsavedStore(StoreModel, ...args) {
    const key = StoreModel.displayName || ''
    store.createStoreConfig(this.config, StoreModel)
    const Store = store.transformStore(this.storeTransforms, StoreModel)

    return typeof Store === 'object'
      ? store.createStoreFromObject(this, Store, key)
      : store.createStoreFromClass(this, Store, key, ...args)
  }

  createStore(StoreModel, iden, ...args) {
    let key = iden || StoreModel.displayName || StoreModel.name || ''
    store.createStoreConfig(this.config, StoreModel)
    const Store = store.transformStore(this.storeTransforms, StoreModel)

    if (this.stores[key] || !key) {
      if (this.stores[key]) {
        utils.warn(
          `A store named ${key} already exists, double check your store ` +
          `names or pass in your own custom identifier for each store`
        )
      } else {
        utils.warn('Store name was not specified')
      }

      key = utils.uid(this.stores, key)
    }

    const storeInstance = typeof Store === 'object'
      ? store.createStoreFromObject(this, Store, key)
      : store.createStoreFromClass(this, Store, key, ...args)

    this.stores[key] = storeInstance
    StateFunctions.saveInitialSnapshot(this, key)

    return storeInstance
  }

  generateActions(...actionNames) {
    const actions = { name: 'global' }
    return this.createActions(actionNames.reduce((obj, action) => {
      obj[action] = utils.dispatchIdentity
      return obj
    }, actions))
  }

  createAction(name, implementation, obj) {
    return makeAction(this, 'global', name, implementation, obj)
  }

  createActions(ActionsClass, exportObj = {}, ...argsForConstructor) {
    const actions = {}
    const key = utils.uid(
      this[Sym.ACTIONS_REGISTRY],
      ActionsClass.displayName || ActionsClass.name || 'Unknown'
    )

    if (typeof ActionsClass === 'function') {
      assign(actions, utils.getInternalMethods(ActionsClass, true))
      class ActionsGenerator extends ActionsClass {
        constructor(...args) {
          super(...args)
        }

        generateActions(...actionNames) {
          actionNames.forEach((actionName) => {
            actions[actionName] = utils.dispatchIdentity
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
      const constant = utils.formatAsConstant(action)
      obj[constant] = obj[action][Sym.ACTION_KEY]

      return obj
    }, exportObj)
  }

  takeSnapshot(...storeNames) {
    const state = StateFunctions.snapshot(this, storeNames)
    assign(this[Sym.LAST_SNAPSHOT], state)
    return this.serialize(state)
  }

  rollback() {
    StateFunctions.setAppState(
      this,
      this.serialize(this[Sym.LAST_SNAPSHOT]),
      storeInst => {
        storeInst[Sym.LIFECYCLE].emit('rollback')
        storeInst.emitChange()
      }
    )
  }

  recycle(...storeNames) {
    const initialSnapshot = storeNames.length
      ? StateFunctions.filterSnapshots(
          this,
          this[Sym.INIT_SNAPSHOT],
          storeNames
        )
      : this[Sym.INIT_SNAPSHOT]

    StateFunctions.setAppState(
      this,
      this.serialize(initialSnapshot),
      (storeInst) => {
        storeInst[Sym.LIFECYCLE].emit('init')
        storeInst.emitChange()
      }
    )
  }

  flush() {
    const state = this.serialize(StateFunctions.snapshot(this))
    this.recycle()
    return state
  }

  bootstrap(data) {
    StateFunctions.setAppState(this, data, (storeInst) => {
      storeInst[Sym.LIFECYCLE].emit('bootstrap')
      storeInst.emitChange()
    })
  }

  prepare(storeInst, payload) {
    const data = {}
    if (!storeInst.displayName) {
      throw new ReferenceError('Store provided does not have a name')
    }
    data[storeInst.displayName] = payload
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

export default Alt
