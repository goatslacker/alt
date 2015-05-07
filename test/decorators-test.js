import { assert } from 'chai'
import Alt from '../'
import { createActions, createStore, bind, expose } from '../utils/decorators'

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

    'decorating action listening and public methods'() {
      const TodoActions = alt.generateActions('addTodo')

      @createStore(alt)
      class TodoStore {
        static displayName = 'TodoStore'

        constructor() {
          this.todos = {}
          this.id = 0
        }

        uid() {
          return this.id++
        }

        @bind(TodoActions.addTodo)
        addTodo(todo) {
          this.todos[this.uid()] = todo
        }

        @expose
        getTodo(id) {
          return this.getState().todos[id]
        }
      }

      TodoActions.addTodo('hello')

      assert(TodoStore.getState().id === 1)
      assert.isFunction(TodoStore.getTodo)
      assert(TodoStore.getTodo(0) === 'hello')
    },
  }
}
