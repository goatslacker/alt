import { assign, eachObject } from './AltUtils'
import * as Sym from '../symbols/symbols'

import * as Sym from '../symbols/symbols'

export function setAppState(instance, data, onStore) {
  const obj = instance.deserialize(data)
  eachObject((key, value) => {
    const store = instance.stores[key]
    if (store) {
      const { config } = store.StoreModel
      if (config.onDeserialize) {
        obj[key] = config.onDeserialize(value) || value
      }
      assign(store[Sym.STATE_CONTAINER], obj[key])
      onStore(store)
    }
  }, [obj])
}

export function snapshot(instance, storeNames = []) {
  const stores = storeNames.length ? storeNames : Object.keys(instance.stores)
  return stores.reduce((obj, storeHandle) => {
    const storeName = storeHandle.displayName || storeHandle
    const store = instance.stores[storeName]
    const { config } = store.StoreModel
    store[Sym.LIFECYCLE].emit('snapshot')
    const customSnapshot = config.onSerialize &&
      config.onSerialize(store[Sym.STATE_CONTAINER])
    obj[storeName] = customSnapshot ? customSnapshot : store.getState()
    return obj
  }, {})
}

export function saveInitialSnapshot(instance, key) {
  const state = instance.deserialize(
    instance.serialize(instance.stores[key][Sym.STATE_CONTAINER])
  )
  instance[Sym.INIT_SNAPSHOT][key] = state
  instance[Sym.LAST_SNAPSHOT][key] = state
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
