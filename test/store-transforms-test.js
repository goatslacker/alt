import { assert } from 'chai'
import Alt from '../dist/alt-with-runtime'

const alt = new Alt()

alt.storeTransforms.push(function (Store) {
  Store.test = 'hello'
  return Store
})

class Store {
  constructor() {
    this.x = 0
  }
}

class Store2 {
  constructor() {
    this.y = 0
  }
}

export default {
  'store transforms': {
    'when creating stores alt goes through its series of transforms'() {
      const store = alt.createStore(Store)
      assert(alt.storeTransforms.length === 1)
      assert.isDefined(store.test)
      assert(store.test === 'hello', 'store that adds hello to instance transform')
    },

    'unsaved stores get the same treatment'() {
      const store2 = alt.createUnsavedStore(Store)
      assert.isDefined(store2.test)
    },
  },
}
