import Immutable from 'immutable'

function makeImmutableObject(Collection, store, iden) {
  store.state = Collection(store.state || {})

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

function makeImmutableClass(Collection, alt, Store, iden) {
  class ImmutableClass extends Store {
    constructor() {
      super()

      this.state = Collection(this.state)

      this.on('serialize', function () {
        return this.getInstance().getState().toJS()
      })

      this.on('deserialize', function (obj) {
        return Immutable.fromJS(obj)
      })
    }
  }

  ImmutableClass.displayName = iden || Store.name || Store.displayName || ''

  return ImmutableClass
}

function enhance(alt, Collection = Immutable.Map) {
  const stateKey = alt._stateKey

  alt.setState = (currentState, nextState) => {
    return nextState
  }

  alt.getState = currentState => currentState

  alt.createImmutableStore = (store, iden, ...args) => {
    const StoreModel = typeof store === 'function'
      ? makeImmutableClass(Collection, alt, store, iden)
      : makeImmutableObject(Collection, store, iden)

    alt._stateKey = 'state'
    const store = alt.createStore(StoreModel, iden, ...args)
    alt._stateKey = stateKey
    return store
  }

  return alt
}

export default { enhance }
