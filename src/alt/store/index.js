import EventEmitter from 'eventemitter3'

import * as Sym from '../symbols/symbols'
import * as utils from '../utils/AltUtils'
import AltStore from './AltStore'
import StoreMixin from './StoreMixin'

function doSetState(store, storeInstance, state) {
  if (!state) {
    return
  }

  const { config } = storeInstance.StoreModel

  const nextState = typeof state === 'function'
    ? state(storeInstance[Sym.STATE_CONTAINER])
    : state

  storeInstance[Sym.STATE_CONTAINER] = config.setState.call(
    store,
    storeInstance[Sym.STATE_CONTAINER],
    nextState
  )

  if (!store.alt.dispatcher.isDispatching()) {
    store.emitChange()
  }
}

function createPrototype(proto, alt, key, extras) {
  proto[Sym.ALL_LISTENERS] = []
  proto[Sym.LIFECYCLE] = new EventEmitter()
  proto[Sym.LISTENERS] = {}
  proto[Sym.PUBLIC_METHODS] = {}

  return assign(proto, StoreMixin, {
    _storeName: key,
    alt: alt,
    dispatcher: alt.dispatcher
  }, extras)
}

export function createStoreConfig(globalConfig, StoreModel) {
  StoreModel.config = assign({
    getState(state) {
      return assign({}, state)
    },
    setState: assign
  }, globalConfig, StoreModel.config)
}

export function transformStore(transforms, StoreModel) {
  return transforms.reduce((Store, transform) => transform(Store), StoreModel)
}

export function createStoreFromObject(alt, StoreModel, key) {
  let storeInstance

  const StoreProto = createPrototype({}, alt, key, assign({
    getInstance() {
      return storeInstance
    },
    setState(nextState) {
      doSetState(this, storeInstance, nextState)
    }
  }, StoreModel))

  // bind the store listeners
  /* istanbul ignore else */
  if (StoreProto.bindListeners) {
    StoreMixin.bindListeners.call(
      StoreProto,
      StoreProto.bindListeners
    )
  }

  // bind the lifecycle events
  /* istanbul ignore else */
  if (StoreProto.lifecycle) {
    eachObject((eventName, event) => {
      StoreMixinListeners.on.call(StoreProto, eventName, event)
    }, [StoreProto.lifecycle])
  }

  // create the instance and assign the public methods to the instance
  storeInstance = assign(
    new AltStore(alt, StoreProto, StoreProto.state, StoreModel),
    StoreProto.publicMethods,
    { displayName: key }
  )

  return storeInstance
}

export function createStoreFromClass(alt, StoreModel, key, ...argsForClass) {
  let storeInstance
  const { config } = StoreModel

  // Creating a class here so we don't overload the provided store's
  // prototype with the mixin behaviour and I'm extending from StoreModel
  // so we can inherit any extensions from the provided store.
  class Store extends StoreModel {
    constructor(...args) {
      super(...args)
    }
  }

  createPrototype(Store.prototype, alt, key, {
    getInstance() {
      return storeInstance
    },
    setState(nextState) {
      doSetState(this, storeInstance, nextState)
    }
  })

  const store = new Store(...argsForClass)

  if (config.bindListeners) {
    store.bindListeners(config.bindListeners)
  }

  storeInstance = assign(
    new AltStore(
      alt,
      store,
      store[alt.config.stateKey] || store[config.stateKey] || null,
      StoreModel
    ),
    utils.getInternalMethods(StoreModel),
    config.publicMethods,
    { displayName: key }
  )

  return storeInstance
}
