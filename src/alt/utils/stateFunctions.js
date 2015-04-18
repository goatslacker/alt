import assign from 'object-assign'
import {
  INIT_SNAPSHOT,
  LAST_SNAPSHOT,
  LIFECYCLE,
  STATE_CONTAINER
} from '../symbols/symbols'

export function setAppState(instance, data, onStore) {
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

export function snapshot(instance, ...storeNames) {
  const stores = storeNames.length ? storeNames : Object.keys(instance.stores)
  return stores.reduce((obj, key) => {
    const store = instance.stores[key]
    if (store[LIFECYCLE].snapshot) {
      store[LIFECYCLE].snapshot()
    }
    const customSnapshot = store[LIFECYCLE].serialize &&
      store[LIFECYCLE].serialize()
    obj[key] = customSnapshot ? customSnapshot : store.getState()
    return obj
  }, {})
}

export function saveInitialSnapshot(instance, key) {
  const state = instance.stores[key][STATE_CONTAINER]
  const initial = instance.deserialize(instance[INIT_SNAPSHOT])
  initial[key] = state
  instance[INIT_SNAPSHOT] = instance.serialize(initial)
  instance[LAST_SNAPSHOT] = instance[INIT_SNAPSHOT]
}

export function filterSnapshots(instance, serializedSnapshot, storeNames) {
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
