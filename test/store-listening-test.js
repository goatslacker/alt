import { assert } from 'chai'
import Alt from '../'
import sinon from 'sinon'

const alt = new Alt()

const actions = alt.generateActions('1', ['fire'])
const actions2 = alt.generateActions('2', ['fire'])

class Store extends Alt.Store {
  constructor() {
    super()
    this.state = { a: 0, b: 0 }
    this.bindListeners({
      a: actions.fire,
      b: actions2.fire,
    })
  }

  a() {
    this.setState({ a: 1 })
  }

  b() {
    this.setState({ b: 1 })
  }
}

const store = alt.createStore('store', new Store())

export default {
  'actions with the same name'() {

    assert(store.getState().a === 0)
    assert(store.getState().b === 0)

    actions.fire()

    assert(store.getState().a === 1)
    assert(store.getState().b === 0)

    actions2.fire()

    assert(store.getState().a === 1)
    assert(store.getState().b === 1)
  },

  'what about bindActions'() {
    class X extends Alt.Store {
      constructor() {
        super()
        this.state = { x: 0 }
        this.bindActions(actions)
        this.bindActions(actions2)
      }

      fire() {
        this.setState({ x: this.state.x + 1 })
      }
    }

    const store = alt.createStore('store', new X())

    actions.fire()
    actions2.fire()

    assert(store.getState().x === 2)
  },
}
