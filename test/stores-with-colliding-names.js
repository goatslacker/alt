import { assert } from 'chai'
import sinon from 'sinon'
import Alt from '../dist/alt-with-runtime'

const alt = new Alt()

function MyStore() { }

alt.createStore(MyStore)

export default {
  'console warn for missing identifier': {
    beforeEach() {
      console.warn = sinon.stub()
      console.warn.returnsArg(0)
    },

    'stores with colliding names'() {
      const MyStore = (function () {
        return function MyStore() { }
      }())
      alt.createStore(MyStore)

      assert.isObject(alt.stores.MyStore1, 'a store was still created')

    },

    'colliding names via identifier'() {
      class auniquestore { }
      alt.createStore(auniquestore, 'MyStore')

      assert.isObject(alt.stores.MyStore1, 'a store was still created')
    },

    'not providing a store name via anonymous function'() {
      alt.createStore(function () { })

      assert.isObject(alt.stores[''], 'a store with no name was still created')
    },

    afterEach() {
      assert.ok(console.warn.calledOnce, 'the warning was called')
      assert.isString(console.warn.returnValues[0], 'value returned is a string error message')
    },
  },

  'overwriting stores': {
    beforeEach() {
      // delete all existing stores
      alt.stores = {}
      alt.createStore(MyStore)
      console.warn = sinon.stub()
      console.warn.returnsArg(0)
    },

    'providing the same exact store many times'() {
      alt.createStore(MyStore)
      alt.createStore(MyStore)
      alt.createStore(MyStore)
      assert.notOk(console.warn.called, 'the warning was not called')
      assert(Object.keys(alt.stores).length === 1, 'there is only one store')
    },
  }
}
