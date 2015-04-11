import { assert } from 'chai'
import Alt from '../dist/alt-with-runtime'
import atomicTransactions from '../utils/atomicTransactions'

const alt = new Alt()

const atom = atomicTransactions(alt)

const actions = alt.generateActions('fire')

const store1 = alt.createStore(atom({
  displayName: 'Store1',

  bindListeners: {
    fire: actions.fire
  },

  state: { x: 0 },

  fire: function () {
    this.state.x = this.state.x + 1
  }
}))

const store2 = alt.createStore(atom({
  displayName: 'Store2',

  bindListeners: {
    fire: actions.fire
  },

  state: { y: 0 },

  fire: function () {
    this.state.y = this.state.y + 1

    if (this.state.y === 2) {
      throw new Error('wtf')
    }
  }
}))

export default {
  'atomicTransactions': {
    'do not update stores if there is an error'() {

      assert(store1.getState().x === 0)
      assert(store2.getState().y === 0)

      actions.fire()

      assert(store1.getState().x === 1)
      assert(store2.getState().y === 1)

      actions.fire()

      assert(store1.getState().x === 1)
      assert(store2.getState().y === 1)

      actions.fire()

      assert(store1.getState().x === 1)
      assert(store2.getState().y === 1)
    }
  }
}
