import { assert } from 'chai'
import Alt from '../dist/alt-with-runtime'
import sinon from 'sinon'

export default {
  'functional goodies for alt': {
    'observing for changes in a POJO so we get context passed in'() {
      const alt = new Alt()

      const observe = sinon.stub().returns({})
      const displayName = 'store'

      alt.createStore({ displayName, observe })

      assert.ok(observe.calledOnce)
      assert(observe.args[0][0] === alt, 'first arg is alt')
    },

    'when observing changes, they are observed'() {
      const alt = new Alt()
      const actions = alt.generateActions('fire')

      const displayName = 'store'

      const store = alt.createStore({
        displayName,
        observe() {
          return { fire: actions.fire }
        },
        fire() { }
      })

      assert(store.boundListeners.length === 1, 'there is 1 action bound')
    },

    'otherwise works like a haskell guard'() {
      const alt = new Alt()
      const actions = alt.generateActions('fire', 'test')

      const spy = sinon.spy()

      const store = alt.createStore({
        displayName: 'store',
        state: { x: 0 },
        bindListeners: {
          fire: actions.fire
        },

        fire() {
          this.setState({ x: 1 })
        },

        otherwise() {
          this.setState({ x: 2 })
        }
      })

      const kill = store.listen(spy)

      actions.test()
      assert(store.getState().x === 2, 'the otherwise clause was ran')

      actions.fire()
      assert(store.getState().x === 1, 'just fire was ran')

      assert.ok(spy.calledTwice)

      kill()
    },

    'preventDefault prevents a change event to be emitted'() {
      const alt = new Alt()
      const actions = alt.generateActions('fire')

      const spy = sinon.spy()

      const store = alt.createStore({
        displayName: 'store',
        state: { x: 0 },
        bindListeners: {
          fire: actions.fire
        },

        fire() {
          this.setState({ x: 1 })
          this.preventDefault()
        }
      })

      const kill = store.listen(spy)

      actions.fire()
      assert(store.getState().x === 1, 'just fire was ran')

      assert(spy.callCount === 0, 'store listener was never called')

      kill()
    },

    'reduce fires on every dispatch if defined'() {
      const alt = new Alt()
      const actions = alt.generateActions('fire')

      const store = alt.createStore({
        displayName: 'store',

        state: { x: 0 },

        reduce(state) {
          if (state.x >= 3) return
          return { x: state.x + 1 }
        }
      })

      actions.fire()
      actions.fire()
      actions.fire()
      actions.fire()

      assert(store.getState().x === 3, 'counter was incremented')
    },

    'reduce doesnt emit if preventDefault'() {
      const alt = new Alt()
      const actions = alt.generateActions('fire')

      const store = alt.createStore({
        displayName: 'store',

        state: { x: 0 },

        reduce(state) {
          this.preventDefault()
          return {}
        }
      })

      const spy = sinon.spy()

      const unsub = store.listen(spy)

      actions.fire()

      assert(spy.callCount === 0)

      unsub()
    },

    'stores have a reduce method'() {
      const alt = new Alt()

      const store = alt.createStore({
        displayName: 'store',

        state: { x: 0 },

        reduce(state) {
          return state
        }
      })

      const store2 = alt.createStore({
        displayName: 'store2',

        state: { x: 1 },
      })

      assert.isFunction(store.reduce)
      assert.isFunction(store2.reduce)

      assert(store.reduce(store.state).x === 0)
      assert(store2.reduce(store2.state).x === 1)
    },
  }
}
