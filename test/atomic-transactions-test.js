import { assert } from 'chai'
import Alt from '../dist/alt-with-runtime'
import atomic from '../utils/atomic'

const alt = new Alt()

const atom = atomic(alt)

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

@atomic(alt)
class Store3 {
  constructor() {
    this.bindListeners({ fire: actions.fire })
    this.x = 0
  }

  fire() {
    this.x = this.x + 1
  }
}

const store3 = alt.createStore(Store3, 'Store3')

class Store4 {
  constructor() {
    this.bindListeners({ fire: actions.fire })
    this.y = 0
  }

  fire() {
    this.y = this.y + 1

    if (this.y === 2) {
      throw new Error('wtf')
    }
  }
}

const store4 = alt.createStore(atom(Store4))

export default {
  'atomicTransactions': {
    beforeEach() {
      alt.recycle()
    },

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
  },

  'classes get the same treatment'() {
    assert(store3.getState().x === 0)
    assert(store4.getState().y === 0)

    actions.fire()

    assert(store3.getState().x === 1)
    assert(store4.getState().y === 1)

    actions.fire()

    assert(store3.getState().x === 1)
    assert(store4.getState().y === 1)

    actions.fire()

    assert(store3.getState().x === 1)
    assert(store4.getState().y === 1)
  },

  'store names'() {
    assert(atom(class { }).displayName, 'AtomicClass')
    assert(atom(class Foo { }).displayName, 'Foo')
  },
}
