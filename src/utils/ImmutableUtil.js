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

function makeImmutableClass(Store, iden) {
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
  alt.createImmutableStore = (store, iden, ...args) => {
    const StoreModel = typeof store === 'function'
      ? makeImmutableClass(store, iden)
      : makeImmutableObject(store, iden)

    StoreModel.config = {
      stateKey: 'state',

      setState(currentState, nextState) {
        return nextState
      },

      getState(currentState) {
        return currentState
      }
    }

    const immutableStore = alt.createStore(StoreModel, iden, ...args)
    return immutableStore
  }

  return alt
}

export default { enhance }
