import Store from '../store'

export default function storeFromObject(pojo) {
  const store = new Store()

  Object.keys(pojo).forEach((key) => {
    if (key !== 'bindListeners' && key !== 'lifecycle') {
      store[key] = pojo[key]
    }
  })

  if (pojo.bindListeners) {
    store.bindListeners(pojo.bindListeners)
  }
  if (pojo.lifecycle) {
    Object.keys(pojo.lifecycle).forEach((event) => {
      store.on(event, pojo.lifecycle[event])
    })
  }

  return store
}
