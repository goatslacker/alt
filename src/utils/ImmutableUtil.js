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
    setState: (currentState, nextState) => nextState,
    getState: (currentState) => currentState,
    onSerialize: (state) => state.toJS(),
    onDeserialize: (data) => Immutable.fromJS(data)
  }

  return StoreModel
}

export default immutable
