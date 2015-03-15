import { assert } from 'chai'
import sinon from 'sinon'
import Alt from '../dist/alt-with-runtime'

const alt = new Alt()

alt.createStore(function MyStore() { })

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
      assert.instanceOf(console.warn.returnValues[0], ReferenceError, 'value returned is an instanceof referenceerror')
    },
  }
}
