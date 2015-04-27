import Immutable from 'immutable'

function makeImmutableObject(store) {
  return store
}

function makeImmutableClass(Store) {
  class ImmutableClass extends Store {
    constructor(...args) {
      super(...args)
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
    },

    onSerialize: (state) => {
      return state.toJS()
    },

    onDeserialize: (data) => {
      return Immutable.fromJS(data)
    }
  }

  return StoreModel
}

export default immutable
