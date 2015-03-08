import Alt from '../dist/alt-with-runtime'
import assert from 'assert'

const alt = new Alt()

const actions = alt.generateActions('fire')

function MyStore() {
  var privateVariable = true

  return {
    displayName: 'MyStore',

    state: {
      data: 1
    },

    publicMethods: {
      getData: function () {
        return this.getState().data
      }
    },

    testProperty: 4,

    bindListeners: {
      handleFire: actions.FIRE
    },

    handleFire: function (data) {
      this.state.data = data
    }
  }
}

const myStore = alt.createStore(MyStore())

export default {
  'using the es3 module pattern': {
    beforeEach() {
      alt.recycle()
    },

    'store method exists'() {
      const storePrototype = Object.getPrototypeOf(myStore)
      const assertMethods = ['constructor', 'getEventEmitter', 'emitChange', 'listen', 'unlisten', 'getState']
      assert.deepEqual(Object.getOwnPropertyNames(storePrototype), assertMethods, 'methods exist for store')
      assert.equal(typeof myStore.addListener, 'undefined', 'event emitter methods not present')
      assert.equal(typeof myStore.removeListener, 'undefined', 'event emitter methods not present')
      assert.equal(typeof myStore.emit, 'undefined', 'event emitter methods not present')
    },

    'public methods available'() {
      assert.equal(typeof myStore.getData, 'function', 'public methods are available')
      assert.equal(myStore.getData(), 1, 'initial store data is set')
    },

    'private and instance variables are not available'() {
      assert.equal(myStore.privateVariable, undefined, 'encapsulated variables are not available')
      assert.equal(myStore.testProperty, undefined, 'instance variables are not available')
    },

    'firing an action'() {
      actions.fire(2)

      assert.equal(myStore.getState().data, 2, 'action was fired and handled correctly')
    },

    'adding lifecycle events'() {
      let called = false

      class TestStore {
        constructor() {
          this.lifecycle = {
            init() {
              called = true
            }
          }

          this.state = {
            foo: 'bar'
          }
        }
      }

      const store = alt.createStore(new TestStore())

      assert.equal(called, true, 'lifecycle event was called')
      assert.equal(store.getState().foo, 'bar', 'state is set')
    },

    'set state'() {
      const TestStore = {
        state: { hello: null, inst: null },

        bindListeners: {
          handleFire: actions.FIRE
        },

        handleFire(data) {
          this.state.inst = this.getInstance().getEventEmitter()

          this.setState({
            hello: data
          })

          this.setState()
        }
      }

      const store = alt.createStore(TestStore)
      assert.equal(store.getState().hello, null, 'store state property has not been set yet')
      assert.equal(store.getState().inst, null, 'store state property has not been set yet')

      actions.fire('world')

      assert.equal(store.getState().hello, 'world', 'store state was set using setState')
      assert.equal(store.getState().inst, store.getEventEmitter(), 'get instance works')
    },

    'set state in lifecycle'() {
      const TestStore = {
        state: { test: null },

        lifecycle: {
          init() {
            this.state.test = 'i am here'
          }
        }
      }

      const store = alt.createStore(TestStore)
      assert.equal(store.getState().test, 'i am here', 'setting state on lifecycle')
    },
  }
}
