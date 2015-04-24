import Immutable from 'immutable'

function makeImmutableObject(store) {
  store.lifecycle = store.lifecycle || {}

  store.lifecycle.serialize = function () {
    return this.getInstance().getState().toJS()
  }

  store.lifecycle.deserialize = function (obj) {
    return Immutable.fromJS(obj)
  }

  return store
}

function makeImmutableClass(Store) {
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

  ImmutableClass.displayName = Store.displayName || Store.name || ''

  return ImmutableClass
}

function immutable(store) {
  const StoreModel = typeof store === 'function'
    ? makeImmutableClass(store)
    : makeImmutableObject(store)

  StoreModel.config = {
    stateKey: 'state',

    setState(currentState, nextState) {
      return nextState
    },

    getState(currentState) {
      return currentState
    }
  }

  return StoreModel
}

export default immutable
