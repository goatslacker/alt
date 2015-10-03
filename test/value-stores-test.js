import { assert } from 'chai'
import Alt from '../'
import sinon from 'sinon'

const alt = new Alt()

const actions = alt.generateActions('fire')

const store = alt.createStore({
  state: 21,

  displayName: 'ValueStore',

  reduce(state, payload) {
    return state + 1
  }
})

const store2 = alt.createStore({
  state: [1, 2, 3],

  displayName: 'Value2Store',

  reduce(state, payload) {
    return state.concat(state[state.length - 1] + 1)
  }
})

const store3 = alt.createStore({
  state: 21,

  displayName: 'ValueStore3',

  bindListeners: {
    fire: actions.fire
  },

  fire() {
    this.setState(this.state + 1)
  }
})

export default {
  'value stores': {
    beforeEach() {
      alt.recycle()
    },

    'stores can contain state as any value'(done) {
      assert(store.state === 21, 'store state is value')
      assert(store.getState() === 21, 'getState returns value too')

      const unlisten = store.listen((state) => {
        assert(state === 22, 'incremented store state')
        unlisten()
        done()
      })

      assert(JSON.parse(alt.takeSnapshot()).ValueStore === 21, 'snapshot ok')

      actions.fire()
    },

    'stores can contain state as any value (non reduce)'(done) {
      assert(store3.state === 21, 'store state is value')
      assert(store3.getState() === 21, 'getState returns value too')

      const unlisten = store3.listen((state) => {
        assert(state === 22, 'incremented store state')
        unlisten()
        done()
      })

      assert(JSON.parse(alt.takeSnapshot()).ValueStore3 === 21, 'snapshot ok')

      actions.fire()
    },

    'store with array works too'() {
      assert.deepEqual(store2.state, [1, 2, 3])
      actions.fire()
      assert.deepEqual(store2.state, [1, 2, 3, 4])
    }
  }
}
