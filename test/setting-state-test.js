import { assert } from 'chai'
import Alt from '../'
import sinon from 'sinon'

const alt = new Alt()

const actions = alt.generateActions('', ['fire', 'nothing'])

class MyStore extends Alt.Store {
  constructor() {
    super()

    this.state = { foo: 1 }
    this.bindListeners({ increment: actions.fire, nothing: actions.nothing })
  }

  increment() {
    this.setState({ foo: this.state.foo + 1 })
  }

  nothing() {
    this.setState()
  }
}

const myStore = alt.createStore('MyStore', new MyStore())

export default {
  'setState': {
    beforeEach() {
      alt.flush()
    },

    'using setState to set the state'() {
      const spy = sinon.spy()
      const sub = myStore.subscribe(spy)

      actions.fire()

      assert(myStore.getState().foo === 2, 'foo was incremented')
      assert.isUndefined(myStore.getState().retVal, 'return value of setState is undefined')

      sub.dispose()

      // calling set state without anything doesn't make things crash and burn
      actions.nothing()

      assert.ok(spy.calledOnce, 'spy was only called once')
    },

    'by using setState a change event is not emitted twice'() {
      const spy = sinon.spy()
      const sub = myStore.subscribe(spy)

      actions.nothing()

      assert(myStore.getState().foo === 1, 'foo remains the same')

      assert.ok(spy.calledOnce, 'spy was only called once')

      sub.dispose()
    },

    'setState with failure'() {
      const alt = new Alt()

      const actions = alt.generateActions('fire')
      class SetState extends Alt.Store {
        constructor() {
          super()
          this.bindActions(actions)

          this.state = { x: 0 }
        }

        fire() {
          throw new Error('error')
        }
      }

      const store = alt.createStore('SetState', new SetState())

      assert(store.getState().x === 0, 'x is initially 0')
      assert.throws(() => actions.fire())
      assert(store.getState().x === 0, 'x remains 0')
    },
  }
}
