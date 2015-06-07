import { assert } from 'chai'
import Alt from '../dist/alt-with-runtime'
import sinon from 'sinon'

const alt = new Alt()

const actions = alt.generateActions('fire', 'nothing')

class MyStore {
  constructor() {
    this.foo = 1
    this.bindListeners({ increment: actions.FIRE, nothing: actions.NOTHING })
  }

  increment() {
    this.retVal = this.setState({ foo: this.foo + 1 })
    return this.retVal
  }

  nothing() {
    this.setState()
  }
}

const myStore = alt.createStore(MyStore)

export default {
  'setState': {
    beforeEach() {
      alt.recycle()
    },

    'using setState to set the state'() {
      const spy = sinon.spy()
      const dispose = myStore.listen(spy)

      actions.fire()

      assert(myStore.getState().foo === 2, 'foo was incremented')
      assert.isUndefined(myStore.getState().retVal, 'return value of setState is undefined')

      dispose()

      // calling set state without anything doesn't make things crash and burn
      actions.nothing()

      assert.ok(spy.calledOnce, 'spy was only called once')
    },

    'by using setState a change event is not emitted twice'() {
      const spy = sinon.spy()
      const dispose = myStore.listen(spy)

      actions.nothing()

      assert(myStore.getState().foo === 1, 'foo remains the same')

      assert.ok(spy.calledOnce, 'spy was only called once')

      dispose()
    },

    'transactional setState'() {
      const alt = new Alt()

      const actions = alt.generateActions('fire')
      class SetState {
        constructor() {
          this.bindActions(actions)
          this.x = 0
        }

        fire() {
          this.setState(() => {
            return {
              x: 1
            }
          })
        }
      }

      const store = alt.createStore(SetState)

      assert(store.getState().x === 0, 'x is initially 0')
      actions.fire()
      assert(store.getState().x === 1, 'x is 1')
    },

    'transactional setState with failure'() {
      const alt = new Alt()

      const actions = alt.generateActions('fire')
      class SetState {
        constructor() {
          this.bindActions(actions)
          this.x = 0
        }

        fire() {
          this.setState(() => {
            throw new Error('error')
          })
        }
      }

      const store = alt.createStore(SetState)

      assert(store.getState().x === 0, 'x is initially 0')
      assert.throws(() => actions.fire())
      assert(store.getState().x === 0, 'x remains 0')
    },

    'setState no dispatch'() {
      const alt = new Alt()

      const actions = alt.generateActions('fire')
      class BrokenSetState {
        constructor() {
          this.x = 0
          this.setState({ x: 1 })
        }
      }

      assert.throws(() => {
        alt.createStore(BrokenSetState)
      })
    },

    'state is set not replaced'() {
      const alt = new Alt()

      const actions = alt.generateActions('fire')
      class SetState {
        constructor() {
          this.bindActions(actions)
          this.x = 0
          this.y = 0
        }

        fire() {
          this.setState({ x: 1 })
        }
      }
      const store = alt.createStore(SetState)

      assert(store.getState().x === 0, 'x is initially 0')
      actions.fire()
      assert(store.getState().x === 1, 'x is now 1')
      assert(store.getState().y === 0, 'y was untouched')
    },
  }
}
