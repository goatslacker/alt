import Immutable from 'immutable'

function makeImmutableObject(store, iden) {
  if (iden) {
    store.displayName = iden
  }

  store.lifecycle = store.lifecycle || {}

  store.lifecycle.serialize = function () {
    return this.getInstance().getState().toJS()
  }

  store.lifecycle.deserialize = function (obj) {
    return Immutable.fromJS(obj)
  }

  return store
}

function makeImmutableClass(alt, Store, iden) {
  class ImmutableClass extends Store {
    constructor(...args) {
      super(...args)

      this.on('serialize', function () {
        return this.getInstance().getState().toJS()
      })

      this.on('deserialize', function (obj) {
        return Immutable.fromJS(obj)
      })
    }
  }

  ImmutableClass.displayName = iden || Store.displayName || ''

  return ImmutableClass
}

function enhance(alt) {
  const stateKey = alt._stateKey

  alt.setState = (currentState, nextState) => {
    return nextState
  }

  alt.getState = currentState => currentState

  alt.createImmutableStore = (store, iden, ...args) => {
    const StoreModel = typeof store === 'function'
      ? makeImmutableClass(alt, store, iden)
      : makeImmutableObject(store, iden)

    alt._stateKey = 'state'
    const store = alt.createStore(StoreModel, iden, ...args)
    alt._stateKey = stateKey
    return store
  }

  return alt
}

export default { enhance }
