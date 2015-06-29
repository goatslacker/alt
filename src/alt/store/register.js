import * as StateFunctions from '../utils/StateFunctions'
import * as fn from '../../utils/functions'
import * as utils from '../utils/AltUtils'
import transmitter from 'transmitter'

export default function registerStore(alt, store, Store) {
  // setup our config
  store.config = fn.assign({
    getState(state) {
      return fn.assign({}, state)
    },
    setState: fn.assign
  }, Store.config)

  store.displayName = store.config.displayName || Store.displayName || Store.name || ''

  store.alt = alt
  store.dispatcher = alt.dispatcher
  store.transmitter = transmitter()
  store.state = store.state || {}

  store.lifecycle = (event, x) => {
    if (store.lifecycleEvents[event]) store.lifecycleEvents[event].push(x)
  }

  const output = store.output || (x => x)
  store.emitChange = () => store.transmitter.push(output(store.state))

  const handleDispatch = (f, payload) => {
    try {
      return f()
    } catch (e) {
      if (store.handlesOwnErrors) {
        store.lifecycle('error', {
          error: e,
          payload,
          state: store.state
        })
        return false
      } else {
        throw e
      }
    }
  }

  // Register dispatcher
  store.dispatchToken = alt.dispatcher.register((payload) => {
    store.preventDefault = false

    store.lifecycle('beforeEach', {
      payload,
      state: store.state
    })

    const actionHandler = store.actionListeners[payload.action] ||
      store.otherwise

    if (actionHandler) {
      const result = handleDispatch(() => {
        return actionHandler.call(store, payload.data, payload.action)
      }, payload)

      if (result !== false && !store.preventDefault) store.emitChange()
    }

    if (store.reduce) {
      handleDispatch(() => {
        store.setState(store.reduce(store.state, payload))
      }, payload)

      if (!store.preventDefault) store.emitChange()
    }

    store.lifecycle('afterEach', {
      payload,
      state: store.state
    })
  })

  // if the store is not meant to be saved, just return
  if (store.config.invisible) return store

  // make sure the store has a unique displayName
  if (alt.stores[store.displayName] || !store.displayName) {
    if (alt.stores[store.displayName]) {
      utils.warn(
        `A store named ${store.displayName} already exists, double check your store ` +
        `names or pass in your own custom identifier for each store`
      )
    } else {
      utils.warn('Store name was not specified')
    }

    store.displayName = utils.uid(alt.stores, store.displayName)
  }

  // save the store
  alt.stores[store.displayName] = store

  // save the initial snapshot
  StateFunctions.saveInitialSnapshot(alt, store.displayName)

  return store
}
