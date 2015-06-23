/*global window*/
import { Dispatcher } from 'flux'

import * as StateFunctions from './utils/StateFunctions'
import * as fn from '../utils/functions'
import * as utils from './utils/AltUtils'
import makeAction from './actions'

import Store from './store'

export { Store }

class Alt {
  constructor(config = {}) {
    this.config = config
    this.serialize = config.serialize || JSON.stringify
    this.deserialize = config.deserialize || JSON.parse
    this.dispatcher = config.dispatcher || new Dispatcher()
    this.batchingFunction = config.batchingFunction || (callback => callback())
    this.actions = { global: {} }
    this.stores = {}
    this.storeTransforms = config.storeTransforms || []
    this.buffer = false
    this._actionsRegistry = {}
    this._initSnapshot = {}
    this._lastSnapshot = {}
  }

  dispatch(action, data, details) {
    this.batchingFunction(() => this.dispatcher.dispatch({ action, data, details }))
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

  registerStore(...args) {
    return (TheStore) => {
      const store = new TheStore(...args)
      // meh
      StateFunctions.saveInitialSnapshot(store.state, store.displayName)

      // double meh
      this.stores[store.displayName] = store
      return store
    }
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
        storeInst.lifecycle('rollback')
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
        storeInst.lifecycle('init')
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
      storeInst.lifecycle('bootstrap')
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

  static debug(name, alt) {
    const key = 'alt.js.org'
    if (typeof window !== 'undefined') {
      window[key] = window[key] || []
      window[key].push({ name, alt })
    }
    return alt
  }
}

export default Alt
