import Alt from '../'
import timetravel from '../utils/TimeTravel'
import { createActions, createStore } from '../utils/decorators'
import { assert } from 'chai'
import sinon from 'sinon'

const alt = new Alt()

@createActions(alt)
class Actions {
  constructor(alt) {
    this.generateActions('fire')
  }
}

export default {
  'TimeTravel': {
    'check for functions'() {
      @timetravel(alt)
      class MyStore { }

      const store = alt.createStore(MyStore)

      assert(store.displayName === 'MyStore')
      assert.isFunction(store.undo)
      assert.isFunction(store.redo)
      assert.isFunction(store.events)
    },

    'as a function'() {
      const store = alt.createStore(timetravel(alt)(function () { }))
      assert.isFunction(store.undo)
      assert.isFunction(store.redo)
      assert.isFunction(store.events)
    },

    'super works'() {
      const spy = sinon.spy()
      const store = alt.createStore(timetravel(alt)(function SuperStore(alt) {
        spy(alt)
      }), undefined, alt)

      assert.ok(spy.calledOnce)
      assert(spy.args[0][0] === alt)
    },

    'undo and redo work'() {
      @createStore(alt)
      @timetravel(alt)
      class Store {
        static displayName = 'Store'

        constructor() {
          this.x = 0

          this.bindListeners({
            fire: Actions.fire
          })
        }

        fire() {
          this.setState({ x: this.x + 1 })
        }
      }

      assert(0 == Store.getState().x)

      Actions.fire()
      assert(1 == Store.getState().x)

      Actions.fire()
      assert(2 == Store.getState().x)

      Store.undo()
      assert(1 == Store.getState().x)

      Store.redo()
      assert(2 == Store.getState().x)

      Store.undo(18)
      assert(0 == Store.getState().x)

      Store.redo(2)
      assert(2 == Store.getState().x)

      Store.undo(10)
      assert(0 == Store.getState().x)

      Store.redo(25)
      assert(2 == Store.getState().x)

      Store.undo(3)
      assert(0 == Store.getState().x)

      Store.redo(1)
      assert(1 == Store.getState().x)

      Store.redo(2)
      assert(2 == Store.getState().x)

      Store.undo(10)
      assert(0 == Store.getState().x)

      Actions.fire()

      Store.redo(20)
      assert(1 === Store.getState().x)
      assert(Store.events().length === 2)
    },

    'config minmax'() {
      @createStore(alt)
      @timetravel(alt, { max: 0 })
      class MinMaxStore {
        constructor() {
          this.x = 0

          this.bindListeners({
            fire: Actions.fire
          })
        }

        fire() {
          this.setState({ x: this.x + 1 })
        }
      }

      Array.apply(Array, Array(10)).forEach(_ => Actions.fire())

      assert(MinMaxStore.events().length === 1, 'stores will have a minimum of 1 event')
    },

    'config max'() {
      @createStore(alt)
      @timetravel(alt, { max: 5 })
      class MaxStore {
        constructor() {
          this.x = 0

          this.bindListeners({
            fire: Actions.fire
          })
        }

        fire() {
          this.setState({ x: this.x + 1 })
        }
      }

      Array.apply(Array, Array(10)).forEach(_ => Actions.fire())

      assert(MaxStore.events().length === 5, 'max is respected')
    }
  }
}
