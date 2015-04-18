import Alt from '../dist/alt-with-runtime'
import Immutable from 'immutable'
import ImmutableUtil from '../utils/ImmutableUtil'
import { assert } from 'chai'

export default {
  'Immutable Stores': {
    'empty immutable store'() {
      const alt = new Alt()
      ImmutableUtil.enhance(alt)
      const store = alt.createImmutableStore({
        displayName: 'ImmutableStore'
      })

      assert(Object.keys(store.getState().toJS()).length === 0)
    },

    'immutable stores as an object'() {
      const alt = new Alt()
      ImmutableUtil.enhance(alt)

      const actions = alt.generateActions('fire')

      const store = alt.createImmutableStore({
        displayName: 'ImmutableStore',

        state: {
          bar: 'hello'
        },

        bindListeners: {
          handleFoo: actions.fire
        },

        handleFoo: function (x) {
          this.setState(this.state.set('foo', x))
        }
      })

      assert.isUndefined(store.getState().toJS().foo, 'foo has not been defined')
      assert(store.getState().toJS().bar === 'hello', 'bar is part of state')

      actions.fire('lol')

      assert(store.getState().toJS().foo === 'lol', 'foo has been defined')

      var newMap = Immutable.Map({})

      assert.isUndefined(newMap.foo, 'references do not leak')

      const snapshot = JSON.parse(alt.takeSnapshot())

      assert(snapshot.ImmutableStore.foo === 'lol', 'snapshot has proper data')

      alt.bootstrap(JSON.stringify({
        ImmutableStore: { foo: 'bar' }
      }))

      assert(store.getState().toJS().foo === 'bar', 'foo has been set through bootstrap')
    },

    'immutable stores as a constructor'() {
      const alt = new Alt()
      ImmutableUtil.enhance(alt)

      const actions = alt.generateActions('fork')

      function ImmutableStore() {
        this.bindListeners({
          handleFoo: actions.fork
        })

        this.state = {
          bar: 'hello'
        }
      }

      ImmutableStore.prototype.handleFoo = function (x) {
        this.setState(this.state.set('foo', x))
      }

      const store = alt.createImmutableStore(ImmutableStore, 'ImmutableStore')

      assert.isUndefined(store.getState().toJS().foo, 'foo has not been defined')
      assert(store.getState().toJS().bar === 'hello', 'bar is part of state')

      actions.fork('lol')

      assert(store.getState().toJS().foo === 'lol', 'foo has been defined')

      const snapshot = JSON.parse(alt.takeSnapshot())

      assert(snapshot.ImmutableStore.foo === 'lol', 'snapshot has proper data')

      alt.bootstrap(JSON.stringify({
        ImmutableStore: { foo: 'bar' }
      }))

      assert(store.getState().toJS().foo === 'bar', 'foo has been set through bootstrap')
    },

    'immutable stores as a class'() {
      const alt = new Alt()
      ImmutableUtil.enhance(alt)

      const actions = alt.generateActions('fork', 'rm')

      class ImmutableStore {
        constructor() {
          this.bindListeners({
            handleFoo: actions.fork,
            remove: actions.rm
          })

          this.state = {
            bar: 'hello'
          }
        }

        handleFoo(x) {
          this.setState(this.state.set('foo', x))
        }

        remove() {
          this.setState(this.state.delete('foo'))
        }
      }

      const store = alt.createImmutableStore(ImmutableStore, 'ImmutableStore')

      assert.isUndefined(store.getState().toJS().foo, 'foo has not been defined')

      assert(store.getState().toJS().bar === 'hello', 'bar is part of state')

      actions.fork('lol')

      assert(store.getState().toJS().foo === 'lol', 'foo has been defined')

      const snapshot = JSON.parse(alt.takeSnapshot())

      assert(snapshot.ImmutableStore.foo === 'lol', 'snapshot has proper data')

      alt.bootstrap(JSON.stringify({
        ImmutableStore: { foo: 'bar' }
      }))

      assert(store.getState().toJS().foo === 'bar', 'foo has been set through bootstrap')

      actions.rm()

      assert.isUndefined(store.getState().toJS().foo, 'foo has been removed')
    },
  }
}
