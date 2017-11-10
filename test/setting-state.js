import { assert } from 'chai'
import sinon from 'sinon'
import Alt from '../dist/alt-with-runtime'

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
  setState: {
    beforeEach() {
      alt.recycle()
    },

    'using setState to set the state': function () {
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

    'by using setState a change event is not emitted twice': function () {
      const spy = sinon.spy()
      const dispose = myStore.listen(spy)

      actions.nothing()

      assert(myStore.getState().foo === 1, 'foo remains the same')

      assert.ok(spy.calledOnce, 'spy was only called once')

      dispose()
    },

    'transactional setState': function () {
      const newAlt = new Alt()

      const newActions = newAlt.generateActions('fire')
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

      const store = newAlt.createStore(SetState)

      assert(store.getState().x === 0, 'x is initially 0')
      newActions.fire()
      assert(store.getState().x === 1, 'x is 1')
    },

    'transactional setState with failure': function () {
      const newAlt = new Alt()

      const newActions = newAlt.generateActions('fire')
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

      const store = newAlt.createStore(SetState)

      assert(store.getState().x === 0, 'x is initially 0')
      assert.throws(() => { return newActions.fire() })
      assert(store.getState().x === 0, 'x remains 0')
    },

    'setState no dispatch': function () {
      const newAlt = new Alt()

      newAlt.generateActions('fire')
      class BrokenSetState {
        constructor() {
          this.x = 0
          this.setState({ x: 1 })
        }
      }

      assert.throws(() => {
        newAlt.createStore(BrokenSetState)
      })
    },

    'state is set not replaced': function () {
      const newAlt = new Alt()
      const newActions = newAlt.generateActions('fire')
      class SetState {
        constructor() {
          this.bindActions(newActions)
          this.x = 0
          this.y = 0
        }

        fire() {
          this.setState({ x: 1 })
        }
      }
      const store = newAlt.createStore(SetState)

      assert(store.getState().x === 0, 'x is initially 0')
      newActions.fire()
      assert(store.getState().x === 1, 'x is now 1')
      assert(store.getState().y === 0, 'y was untouched')
    }
  }
}
