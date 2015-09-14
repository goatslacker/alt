import { assign } from './functions'

function noop() { }

const AltTestingUtils = {
  createStoreSpy: (alt) => {
    return {
      displayName: 'ALT_TEST_STORE',
      alt: alt,
      bindAction: noop,
      bindActions: noop,
      bindListeners: noop,
      dispatcher: alt.dispatcher,
      emitChange: noop,
      exportAsync: noop,
      exportPublicMethods: noop,
      getInstance: noop,
      on: noop,
      registerAsync: noop,
      setState: noop,
      waitFor: noop,
    }
  },

  makeStoreTestable(alt, UnwrappedStore) {
    const StorePrototype = AltTestingUtils.createStoreSpy(alt)
    class DerivedStore extends UnwrappedStore {
      constructor() {
        super()
      }
    }
    assign(DerivedStore.prototype, StorePrototype)
    return new DerivedStore()
  },

  mockGetState(state = {}) {
    return {
      getState: () => {
        return state
      },
    }
  },
}

module.exports = AltTestingUtils
