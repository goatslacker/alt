import * as utils from '../utils/AltUtils'
import * as fn from '../../utils/functions'
import AltStore from './AltStore'
import StoreMixin from './StoreMixin'

function doSetState(store, storeInstance, state) {
  if (!state) {
    return
  }

  const { config } = storeInstance.StoreModel

  const nextState = fn.isFunction(state)
    ? state(storeInstance.state)
    : state

  storeInstance.state = config.setState.call(
    store,
    storeInstance.state,
    nextState
  )

  if (!store.alt.dispatcher.isDispatching()) {
    store.emitChange()
  }
}

function createPrototype(proto, alt, key, extras) {
  proto.boundListeners = []
  proto.lifecycleEvents = {}
  proto.actionListeners = {}
  proto.publicMethods = {}
  proto.handlesOwnErrors = false

  // This doesn't need to be serialized - the data will be enough
  proto.pendingFetches = {}

  return fn.assign(proto, StoreMixin, {
    displayName: key,
    alt: alt,
    dispatcher: alt.dispatcher,
    preventDefault() {
      this.getInstance().preventDefault = true
    }
  }, extras)
}

export function createStoreConfig(globalConfig, StoreModel) {
  StoreModel.config = fn.assign({
    getState(state) {
      return fn.assign({}, state)
    },
    setState: fn.assign
  }, globalConfig, StoreModel.config)
}

export function transformStore(transforms, StoreModel) {
  return transforms.reduce((Store, transform) => transform(Store), StoreModel)
}

export function createStoreFromObject(alt, StoreModel, key) {
  let storeInstance

  const StoreProto = createPrototype({}, alt, key, fn.assign({
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
  /* istanbul ignore else */
  if (StoreProto.observe) {
    StoreMixin.bindListeners.call(
      StoreProto,
      StoreProto.observe(alt)
    )
  }

  // bind the lifecycle events
  /* istanbul ignore else */
  if (StoreProto.lifecycle) {
    fn.eachObject((eventName, event) => {
      StoreMixin.on.call(StoreProto, eventName, event)
    }, [StoreProto.lifecycle])
  }

  // create the instance and fn.assign the public methods to the instance
  storeInstance = fn.assign(
    new AltStore(alt, StoreProto, StoreProto.state || {}, StoreModel),
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

  if (config.bindListeners) store.bindListeners(config.bindListeners)
  if (config.datasource) store.registerAsync(config.datasource)

  storeInstance = fn.assign(
    new AltStore(
      alt,
      store,
      typeof store.state === 'object' ? store.state : null,
      StoreModel
    ),
    utils.getInternalMethods(StoreModel),
    config.publicMethods,
    { displayName: key }
  )

  return storeInstance
}
