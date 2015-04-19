import Alt from '../dist/alt-with-runtime'
import Immutable from 'immutable'
import ImmutableUtil from '../utils/ImmutableUtil'
import { assert } from 'chai'

export default {
  'Immutable Stores': {
    'no name immutable'() {
      const alt = new Alt()
      ImmutableUtil.enhance(alt)
      const store = alt.createImmutableStore(function ImmutableStore() {
        this.state = Immutable.Map({})
      })

      assert(Object.keys(store.getState().toJS()).length === 0)
    },

    'normal stores'() {
      const alt = new Alt()
      ImmutableUtil.enhance(alt)

      const action = alt.generateActions('addY')

      const store1 = alt.createImmutableStore({
        displayName: 'ImmutableStore',
        bindListeners: { addY: action.addY },
        state: Immutable.Map({ x: 1 }),
        addY() {
          this.setState(this.state.set('y', 2))
        }
      })

      const store2 = alt.createStore({
        displayName: 'MutableStore',
        bindListeners: { addY: action.addY },
        state: { x: 1 },
        addY() {
          this.setState({ y: 2 })
        }
      })

      assert(store1.getState().toJS().x === 1)
      assert(store2.getState().x === 1)

      action.addY()

      assert(store1.getState().toJS().x === 1)
      assert(store2.getState().x === 1, 'store2 state was not replaced')
      assert(store1.getState().toJS().y === 2)
      assert(store2.getState().y === 2, 'new state exists')
    },

    'using list'() {
      const alt = new Alt()
      ImmutableUtil.enhance(alt)
      const store = alt.createImmutableStore({
        state: Immutable.List([1, 2, 3])
      }, 'ListImmutableStore')

      assert(store.getState().get(0) === 1)
    },

    'passing args to constructor'() {
      const alt = new Alt()
      ImmutableUtil.enhance(alt)

      const store = alt.createImmutableStore(function ImmutableStore(x) {
        assert(x === 'hello world')
        this.state = Immutable.Map({ x: x })
      }, 'MyImmutableStore', 'hello world')

      assert(store.getState().toJS().x === 'hello world')
    },

    'immutable stores as an object'() {
      const alt = new Alt()
      ImmutableUtil.enhance(alt)

      const actions = alt.generateActions('fire')

      const store = alt.createImmutableStore({
        displayName: 'ImmutableStore',

        state: Immutable.Map({
          bar: 'hello'
        }),

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

        this.state = Immutable.Map({
          bar: 'hello'
        })
      }

      ImmutableStore.prototype.handleFoo = function (x) {
        this.setState(this.state.set('foo', x))
      }

      ImmutableStore.displayName = 'ImmutableStore'

      const store = alt.createImmutableStore(ImmutableStore)

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

          this.state = Immutable.Map({
            bar: 'hello'
          })
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
