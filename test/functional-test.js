import { assert } from 'chai'
import Alt from '../'
import sinon from 'sinon'
import storeFromObject from '../lib/compat/storeFromObject'

export default {
  'functional goodies for alt': {
    'otherwise works like a haskell guard'() {
      const alt = new Alt()
      const actions = alt.generateActions('a', ['fire', 'test'])

      const spy = sinon.spy()

      const store = alt.createStore('store', storeFromObject({
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
      }))

      const sub = store.subscribe(spy)

      actions.test()
      assert(store.getState().x === 2, 'the otherwise clause was ran')

      actions.fire()
      assert(store.getState().x === 1, 'just fire was ran')

      assert.ok(spy.calledTwice)

      sub.dispose()
    },

    'preventDefault prevents a change event to be emitted'() {
      const alt = new Alt()
      const actions = alt.generateActions('', ['fire'])

      const spy = sinon.spy()

      const store = alt.createStore('store', storeFromObject({
        state: { x: 0 },
        bindListeners: {
          fire: actions.fire
        },

        fire() {
          this.setState({ x: 1 })
          this.preventDefault()
        }
      }))

      const sub = store.subscribe(spy)

      actions.fire()
      assert(store.getState().x === 1, 'just fire was ran')

      assert(spy.callCount === 0, 'store listener was never called')

      sub.dispose()
    },

    'reduce fires on every dispatch if defined'() {
      const alt = new Alt()
      const actions = alt.generateActions('', ['fire'])

      const store = alt.createStore('store', storeFromObject({
        state: { x: 0 },

        reduce(state) {
          if (state.x >= 3) return
          return { x: state.x + 1 }
        }
      }))

      actions.fire()
      actions.fire()
      actions.fire()
      actions.fire()

      assert(store.getState().x === 3, 'counter was incremented')
    },

    'reduce doesnt emit if preventDefault'() {
      const alt = new Alt()
      const actions = alt.generateActions('', ['fire'])

      const store = alt.createStore('store', storeFromObject({
        state: { x: 0 },

        reduce(state) {
          this.preventDefault()
          return {}
        }
      }))

      const spy = sinon.spy()

      const sub = store.subscribe(spy)

      actions.fire()

      assert(spy.callCount === 0)

      sub.dispose()
    },

    'stores have a dispatch function'() {
      const alt = new Alt()

      const store = alt.createStore('store', storeFromObject({
        state: { x: 0 },

        reduce(state) {
          return state
        }
      }))

      const store2 = alt.createStore('store2', storeFromObject({
        state: { x: 1 },
      }))

      assert.isFunction(store.dispatch)
      assert.isFunction(store2.dispatch)

      assert(store.dispatch({}).x === 0)
      assert(store2.dispatch({}).x === 1)
    },
  }
}
