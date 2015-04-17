import { assert } from 'chai'
import Alt from '../dist/alt-with-runtime'

const alt = new Alt({
  stateKey: 'state'
})

class Store {
  static displayName: 'CustomStateKeyStore'

  constructor() {
    this.foo = 1
    this.state = { yes: 2 }
  }
}

const store = alt.createStore(Store)

export default {
  'Custom State Key': {
    'setting a custom key for declaring state'() {
      assert.isUndefined(store.getState().foo, 'foo is private')
      assert.isDefined(store.getState().yes, 'yes is part of state')
    },
  }
}
