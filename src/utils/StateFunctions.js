import * as fn from '../functions'

export function setAppState(instance, data, onStore) {
  const obj = instance.deserialize(data)
  fn.eachObject((key, value) => {
    const store = instance.stores[key]
    if (store) {
      const { config } = store.StoreModel
      const state = store.state
      if (config.onDeserialize) obj[key] = config.onDeserialize(value) || value
      if (fn.isMutableObject(state)) {
        fn.eachObject(k => delete state[k], [state])
        fn.assign(state, obj[key])
      } else {
        store.state = obj[key]
      }
      onStore(store, store.state)
    }
  }, [obj])
}

export function snapshot(instance, storeNames = []) {
  const stores = storeNames.length ? storeNames : Object.keys(instance.stores)
  return stores.reduce((obj, storeHandle) => {
    const storeName = storeHandle.displayName || storeHandle
    const store = instance.stores[storeName]
    const { config } = store.StoreModel
    store.lifecycle('snapshot')
    const customSnapshot = config.onSerialize &&
      config.onSerialize(store.state)
    obj[storeName] = customSnapshot ? customSnapshot : store.getState()
    return obj
  }, {})
}

export function saveInitialSnapshot(instance, key) {
  const state = instance.deserialize(
    instance.serialize(instance.stores[key].state)
  )
  instance._initSnapshot[key] = state
  instance._lastSnapshot[key] = state
}

export function filterSnapshots(instance, state, stores) {
  return stores.reduce((obj, store) => {
    const storeName = store.displayName || store
    if (!state[storeName]) {
      throw new ReferenceError(`${storeName} is not a valid store`)
    }
    obj[storeName] = state[storeName]
    return obj
  }, {})
}
