import Immutable from 'immutable'
import Symbol from 'es-symbol'

const IS_IMMUTABLE = Symbol()

function makeImmutableObject(store, iden) {
  if (iden) {
    store.displayName = iden
  }

  store.state[IS_IMMUTABLE] = true

  store.lifecycle = store.lifecycle || {}

  store.lifecycle.serialize = function () {
    return this.getInstance().getState().toJS()
  }

  store.lifecycle.deserialize = function (obj) {
    return Immutable.fromJS(obj)
  }

  return store
}

function makeImmutableClass(Store, iden) {
  class ImmutableClass extends Store {
    constructor(...args) {
      super(...args)

      this.state[IS_IMMUTABLE] = true

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
  const altSetState = alt.setState
  const altGetState = alt.getState

  alt.setState = (currentState, nextState) => {
    if (currentState[IS_IMMUTABLE]) {
      nextState[IS_IMMUTABLE] = true
      return nextState
    } else {
      return altSetState(currentState, nextState)
    }
  }

  alt.getState = (currentState) => {
    if (currentState[IS_IMMUTABLE]) {
      return currentState
    } else {
      return altGetState(currentState)
    }
  }

  alt.createImmutableStore = (store, iden, ...args) => {
    const StoreModel = typeof store === 'function'
      ? makeImmutableClass(store, iden)
      : makeImmutableObject(store, iden)

    alt._stateKey = 'state'
    const store = alt.createStore(StoreModel, iden, ...args)
    alt._stateKey = stateKey
    return store
  }

  return alt
}

export default { enhance }
