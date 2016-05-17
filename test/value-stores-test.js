import { assert } from 'chai'
import Alt from '../'
import sinon from 'sinon'
import storeFromObject from '../lib/compat/storeFromObject'

const alt = new Alt()

const actions = alt.generateActions('', ['fire'])

const store = alt.createStore('ValueStore', storeFromObject({
  state: 21,

  reduce(state, payload) {
    return state + 1
  },
}))

const store2 = alt.createStore('ValueStore2', storeFromObject({
  state: [1, 2, 3],

  reduce(state, payload) {
    return state.concat(state[state.length - 1] + 1)
  },
}))

const store3 = alt.createStore('ValueStore3', storeFromObject({
  state: 21,

  reduce(state, payload) {
    return state + 1
  },
}))

export default {
  'value stores': {
    beforeEach() {
      alt.flush()
    },

    'stores can contain state as any value'(done) {
      assert(store.getState() === 21, 'getState returns value too')

      const sub = store.subscribe((state) => {
        assert(state === 22, 'incremented store state')
        sub.dispose()
        done()
      })

      assert(JSON.parse(alt.save()).ValueStore === 21, 'snapshot ok')

      actions.fire()
    },

    'stores can contain state as any value (non reduce)'(done) {
      assert(store3.getState() === 21, 'getState returns value too')

      const sub = store3.subscribe((state) => {
        assert(state === 22, 'incremented store state')
        sub.dispose()
        done()
      })

      assert(JSON.parse(alt.save()).ValueStore3 === 21, 'snapshot ok')

      actions.fire()
    },

    'store with array works too'() {
      assert.deepEqual(store2.getState(), [1, 2, 3])
      actions.fire()
      assert.deepEqual(store2.getState(), [1, 2, 3, 4])
    }
  }
}
