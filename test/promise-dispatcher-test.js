import Alt from '../'
import PromiseDispatcher from '../utils/PromiseDispatcher'
import { assert } from 'chai'
import sinon from 'sinon'

const dispatcher = new PromiseDispatcher()


export default {
  'A promise dispatcher': {
    'returning from a store'(done) {
      const alt = new Alt({
        dispatcher: new PromiseDispatcher()
      })

      const TodoActions = alt.createActions({
        fetchTodo(id) {
          return this.dispatch(id)
        },

        addTodo(obj) {
          return this.dispatch(obj)
        }
      })

      class TodoStore {
        constructor() {
          this.todos = {}
          this.bindListeners({
            fetchTodo: TodoActions.fetchTodo,
            addTodo: TodoActions.addTodo
          })
        }

        addTodo(obj) {
          return Promise.resolve(this.todos[obj.id] = obj)
        }

        fetchTodo(id) {
          return new Promise((resolve, reject) => {
            setTimeout(() => {
              const todo = { id, text: 'awesome' }
              TodoActions.addTodo(todo).then(() => {
                resolve(this.getInstance().getState())
              })
            }, 100)
          })
        }
      }

      const Store = alt.createStore(TodoStore)

      assert(Object.keys(Store.getState().todos).length === 0, 'empty todos')

      const spy = sinon.spy()

      // called once promise is resolved
      Store.listen(spy)

      // hey, a promise!
      TodoActions.fetchTodo(2)
        .then(([state]) => {
          assert(Object.keys(state.todos).length === 1, 'got a new todo')
          assert(state.todos['2'].text === 'awesome')
          assert(spy.callCount === 2, 'the listener was called twice')
        })
        .catch((e) => {
          console.error(e)
          throw e
        })
        .then(done)
    },

    'testing the dispatcher resolving'(done) {
      const order = []

      const token1 = dispatcher.register((payload) => {
        order.push(1)
        return Promise.resolve(1)
      })

      const token2 = dispatcher.register((payload) => {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            order.push(2)
            resolve(2)
          }, 10)
        })
      })

      const token3 = dispatcher.register((payload, context) => {
        return dispatcher.waitFor(context, [token2, token4]).then(() => {
          order.push(3)
          return Promise.resolve(3)
        })
      })

      const token4 = dispatcher.register((payload) => {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            order.push(4)
            resolve(4)
          }, 100)
        })
      })

      dispatcher.dispatch({ hello: 'world' })
        .then((x) => {
          assert.deepEqual(x, [1, 2, 3, 4], 'the events are received in order in the promise')
          assert.deepEqual(order, [1, 2, 4, 3], 'but the waitFor order differs a bit')

          dispatcher.unregister(token1)
          dispatcher.unregister(token2)
          dispatcher.unregister(token3)
          dispatcher.unregister(token4)
        })
        .catch((e) => {
          console.error(e)
          throw e
        })
        .then(done)

      assert.ok(dispatcher.isDispatching())
    }
  }
}

