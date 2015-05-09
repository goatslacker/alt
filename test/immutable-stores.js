import Alt from '../dist/alt-with-runtime'
import Immutable from 'immutable'
import immutable from '../utils/ImmutableUtil'
import { assert } from 'chai'

export default {
  'Immutable Stores': {
    'no name immutable'() {
      const alt = new Alt()
      const store = alt.createStore(immutable(function () {
        this.state = Immutable.Map({})
      }), 'nonameimmutable')

      assert(Object.keys(store.getState().toJS()).length === 0)
    },

    'normal stores'() {
      const alt = new Alt()

      const action = alt.generateActions('addY', 'addX')

      const store1 = alt.createStore(immutable({
        displayName: 'ImmutableStore',
        bindListeners: { addY: action.addY, addX: action.addX },
        state: Immutable.Map({ x: 1 }),
        addY() {
          this.setState(this.state.set('y', 2))
        },
        addX() {
          this.setState(this.state.set('x', 5))
        }
      }))

      const store2 = alt.createStore({
        displayName: 'MutableStore',
        bindListeners: { addY: action.addY, addX: action.addX },
        state: { x: 1 },
        addY() {
          this.setState({ y: 2 })
        },
        addX() {
          this.setState({ x: 5 })
        }
      })

      assert(store1.getState().toJS().x === 1)
      assert(store2.getState().x === 1)

      action.addY()
      assert(store1.getState().toJS().x === 1, 'store1 x was not replaced')
      assert(store2.getState().x === 1, 'store2 x was not replaced')
      assert(store1.getState().toJS().y === 2, 'new y exists in store1')
      assert(store2.getState().y === 2, 'new y exists in store2')

      action.addX()
      assert(store1.getState().toJS().x === 5, 'new x exists in store1')
      assert(store2.getState().x === 5, 'new x exists in store2')

      assert(store1.getState().toJS().y === 2, 'store1 y was not replaced')
      assert(store2.getState().y === 2, 'store2 y was not replaced')

      // fire it again to make sure state is not blown away
      action.addY()

      assert(store1.getState().toJS().x === 5, 'store1 x remains 5')
      assert(store2.getState().x === 5, 'store2 state remains 5')
      assert(store1.getState().toJS().y === 2, 'store1 y value has been updated')
      assert(store2.getState().y === 2, 'store2 y value has been updated')
    },

    'nested immutable structures'() {
      const alt = new Alt()

      const actions = alt.generateActions('replaceMap', 'replaceList', 'updateBar')

      @immutable
      class ImmutableStore {
        constructor() {
          this.bindListeners({
            handleUpdateBar: actions.updateBar,
            handleReplaceMap: actions.replaceMap,
            handleReplaceList: actions.replaceList
          })

          this.state = Immutable.Map({
            bar: 'hello',
            list: Immutable.List([]),
            map: Immutable.Map({})
          })
        }

        handleUpdateBar(x) {
          this.setState(this.state.set('bar', x))
        }

        handleReplaceMap(x) {
          this.setState(this.state.set('map', Immutable.fromJS(x).toMap()))
        }

        handleReplaceList(x) {
          this.setState(this.state.set('list', Immutable.fromJS(x).toList()))
        }
      }

      const store = alt.createStore(ImmutableStore, 'ImmutableStore')

      assert(store.getState().get('bar') === 'hello', 'bar is initially `hello`')
      assert(store.getState().get('map').count() === 0, 'map is initially zero')
      assert(store.getState().get('list').count() === 0, 'list is initially zero')

      actions.replaceMap({a: 1, b: 2})
      assert(store.getState().get('bar') === 'hello', 'bar is still `hello` after replacing map')
      assert(store.getState().get('list').count() === 0, 'list still has zero items after replacing map')
      assert(store.getState().get('map').count() === 2, 'map has 2 items in it now after replacing map')

      actions.replaceList([1, 2, 3, 4])
      assert(store.getState().get('bar') === 'hello', 'bar is still `hello` after replacing list')
      assert(store.getState().get('list').count() === 4, 'list has 4 items now after replacing list')
      assert(store.getState().get('map').count() === 2, 'map still has 2 items in it after replacing list')

      actions.updateBar('world')
      assert(store.getState().get('bar') === 'world', 'bar is now `world` after updating bar')
      assert(store.getState().get('list').count() === 4, 'list still has 4 items  after updating bar')
      assert(store.getState().get('map').count() === 2, 'map still has 2 items in it after updating bar')
    },

    'using list'() {
      const alt = new Alt()
      const store = alt.createStore(immutable({
        state: Immutable.List([1, 2, 3])
      }), 'ListImmutableStore')

      assert(store.getState().get(0) === 1)
    },

    'passing args to constructor'() {
      const alt = new Alt()

      const store = alt.createStore(immutable(function ImmutableStore(x) {
        assert(x === 'hello world')
        this.state = Immutable.Map({ x: x })
      }), 'MyImmutableStore', 'hello world')

      assert(store.getState().toJS().x === 'hello world')
    },

    'immutable stores as an object'() {
      const alt = new Alt()

      const actions = alt.generateActions('fire')

      const store = alt.createStore(immutable({
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
      }))

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

      const store = alt.createStore(immutable(ImmutableStore))

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

      const actions = alt.generateActions('fork', 'rm')

      @immutable
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

      const store = alt.createStore(ImmutableStore, 'ImmutableStore')

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
