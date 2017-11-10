import { assert } from 'chai'
import sinon from 'sinon'
import Alt from '../dist/alt-with-runtime'

const alt = new Alt()

const actions = alt.generateActions('fire')

function MyStore() {
    const privateVariable = true; //eslint-disable-line

  return {
    displayName: 'MyStore',

    state: {
      data: 1
    },

    publicMethods: {
      getData() {
        return this.getState().data
      }
    },

    testProperty: 4,

    bindListeners: {
      handleFire: actions.FIRE
    },

    handleFire(data) {
      this.setState({ data })
    }
  }
}

const myStore = alt.createStore(MyStore())

export default {
  'Creating store using ES3 module pattern': {
    beforeEach() {
      alt.recycle()
      console.warn = function () { }
    },

    'store method exists': function () {
      const storePrototype = Object.getPrototypeOf(myStore)
      const assertMethods = ['constructor', 'listen', 'unlisten', 'getState']
      assert.deepEqual(Object.getOwnPropertyNames(storePrototype), assertMethods, 'methods exist for store')
      assert.isUndefined(myStore.addListener, 'event emitter methods not present')
      assert.isUndefined(myStore.removeListener, 'event emitter methods not present')
      assert.isUndefined(myStore.emit, 'event emitter methods not present')
    },

    'public methods available': function () {
      assert.isFunction(myStore.getData, 'public methods are available')
      assert(myStore.getData() === 1, 'initial store data is set')
    },

    'private and instance variables are not available': function () {
      assert.isUndefined(myStore.privateVariable, 'encapsulated variables are not available')
      assert.isUndefined(myStore.testProperty, 'instance variables are not available')
    },

    'firing an action': function () {
      actions.fire(2)

      assert(myStore.getState().data === 2, 'action was fired and handled correctly')
    },

    'adding lifecycle events': function () {
      const spy = sinon.spy()

      class TestStore {
        constructor() {
          this.lifecycle = { init: spy }

          this.state = {
            foo: 'bar'
          }
        }
      }

      const store = alt.createStore(new TestStore())

      assert.ok(spy.calledOnce, 'lifecycle event was called')
      assert(store.getState().foo === 'bar', 'state is set')
    },

    'set state': function () {
      const TestStore = {
        state: { hello: null },

        bindListeners: {
          handleFire: actions.FIRE
        },

        handleFire(data) {
          this.setState({
            hello: data
          })

          this.setState()
        }
      }

      const store = alt.createStore(TestStore)
      assert.isNull(store.getState().hello, 'store state property has not been set yet')

      actions.fire('world')

      assert(store.getState().hello === 'world', 'store state was set using setState')
    },

    'set state in lifecycle': function () {
      const TestStore = {
        state: { test: null },

        lifecycle: {
          init() {
            this.state.test = 'i am here'
          }
        }
      }

      const store = alt.createStore(TestStore)
      assert(store.getState().test === 'i am here', 'setting state on lifecycle')
    },

    'get instance works': function () {
      const TestStore = {
        state: { test: null },
        bindListeners: {
          handleFire: actions.FIRE
        },
        handleFire() {
          this.setState({ test: this.getInstance() })
        }
      }

      const store = alt.createStore(TestStore)
      actions.fire()
      assert(store.getState().test === store)
    }
  }
}
