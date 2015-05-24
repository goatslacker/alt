import { Dispatcher } from 'flux'

import * as StateFunctions from './utils/StateFunctions'
import * as fn from '../utils/functions'
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
    this._actionsRegistry = {}
    this._initSnapshot = {}
    this._lastSnapshot = {}
  }

  dispatch(action, data, details) {
    this.dispatcher.dispatch({ action, data, details })
  }

  createUnsavedStore(StoreModel, ...args) {
    const key = StoreModel.displayName || ''
    store.createStoreConfig(this.config, StoreModel)
    const Store = store.transformStore(this.storeTransforms, StoreModel)

    return fn.isFunction(Store)
      ? store.createStoreFromClass(this, Store, key, ...args)
      : store.createStoreFromObject(this, Store, key)
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

    const storeInstance = fn.isFunction(Store)
      ? store.createStoreFromClass(this, Store, key, ...args)
      : store.createStoreFromObject(this, Store, key)

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
      this._actionsRegistry,
      ActionsClass.displayName || ActionsClass.name || 'Unknown'
    )

    if (fn.isFunction(ActionsClass)) {
      fn.assign(actions, utils.getInternalMethods(ActionsClass, true))
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

      fn.assign(actions, new ActionsGenerator(...argsForConstructor))
    } else {
      fn.assign(actions, ActionsClass)
    }

    this.actions[key] = this.actions[key] || {}

    fn.eachObject((actionName, action) => {
      if (!fn.isFunction(action)) {
        return
      }

      // create the action
      exportObj[actionName] = makeAction(
        this,
        key,
        actionName,
        action,
        exportObj
      )

      // generate a constant
      const constant = utils.formatAsConstant(actionName)
      exportObj[constant] = exportObj[actionName].id
    }, [actions])
    return exportObj
  }

  takeSnapshot(...storeNames) {
    const state = StateFunctions.snapshot(this, storeNames)
    fn.assign(this._lastSnapshot, state)
    return this.serialize(state)
  }

  rollback() {
    StateFunctions.setAppState(
      this,
      this.serialize(this._lastSnapshot),
      storeInst => {
        storeInst.lifecycle.rollback.push()
        storeInst.emitChange()
      }
    )
  }

  recycle(...storeNames) {
    const initialSnapshot = storeNames.length
      ? StateFunctions.filterSnapshots(
          this,
          this._initSnapshot,
          storeNames
        )
      : this._initSnapshot

    StateFunctions.setAppState(
      this,
      this.serialize(initialSnapshot),
      (storeInst) => {
        storeInst.lifecycle.init.push()
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
      storeInst.lifecycle.bootstrap.push()
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
