import { assert } from 'chai'
import Alt from '../'
import { createActions, createStore } from '../utils/decorators'

const alt = new Alt()

export default {
  'decorators': {
    'decorate store creation'() {
      @createStore(alt)
      class Store { }

      assert.isObject(Store)
      assert.isString(Store.dispatchToken)
      assert.isString(Store.displayName)
    },

    'decorate store creation with args'() {
      @createStore(alt, 1, 2, 3)
      class StoreArgs {
        static config = { stateKey: 'state' }
        constructor(one, two, three) {
          this.state = { one, two, three }
        }
      }

      assert(StoreArgs.getState().one === 1)
      assert(StoreArgs.getState().two === 2)
      assert(StoreArgs.getState().three === 3)
    },

    'decorating actions'() {
      @createActions(alt)
      class Actions {
        constructor() {
          this.generateActions('fire')
        }
      }

      assert.isObject(Actions)
      assert.isFunction(Actions.fire)
    },

    'decorating actions with args'() {
      @createActions(alt, 'foo')
      class Actions {
        constructor(other) {
          this.generateActions('fire', other)
        }
      }

      assert.isFunction(Actions.foo)
    },
  }
}
