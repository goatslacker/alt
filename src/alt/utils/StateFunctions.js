import assign from 'object-assign'
import * as Sym from '../symbols/symbols'

const {
  INIT_SNAPSHOT,
  LAST_SNAPSHOT,
  LIFECYCLE,
  STATE_CONTAINER
} = Sym

export function setAppState(instance, data, onStore) {
  const obj = instance.deserialize(data)
  Object.keys(obj).forEach((key) => {
    const store = instance.stores[key]
    if (store) {
      const { config } = store.StoreModel
      if (config.onDeserialize) {
        obj[key] = config.onDeserialize(obj[key]) || obj[key]
      }
      assign(store[STATE_CONTAINER], obj[key])
      onStore(store)
    }
  })
}

export function snapshot(instance, storeNames = []) {
  const stores = storeNames.length ? storeNames : Object.keys(instance.stores)
  return stores.reduce((obj, storeHandle) => {
    const storeName = storeHandle.displayName || storeHandle
    const store = instance.stores[storeName]
    const { config } = store.StoreModel
    if (store[LIFECYCLE].snapshot) {
      store[LIFECYCLE].snapshot()
    }
    const customSnapshot = config.onSerialize &&
      config.onSerialize(store[STATE_CONTAINER])
    obj[storeName] = customSnapshot ? customSnapshot : store.getState()
    return obj
  }, {})
}

export function saveInitialSnapshot(instance, key) {
  const state = instance.deserialize(
    instance.serialize(instance.stores[key][STATE_CONTAINER])
  )
  instance[INIT_SNAPSHOT][key] = state
  instance[LAST_SNAPSHOT][key] = state
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
