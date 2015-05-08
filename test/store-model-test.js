import Alt from '../dist/alt-with-runtime'
import { assert } from 'chai'

const alt = new Alt()
const Actions = alt.generateActions('hello')

function MyStoreModel() {
  this.bindActions(Actions)

  this.test = 2
}
MyStoreModel.prototype.onHello = function () { this.test = 1 }

const MyStoreModelObj = {
  displayName: 'MyStoreAsObject',

  state: { test: 2 },

  bindListeners: {
    onHello: Actions.HELLO
  },

  onHello: function () {
    this.state.test = 1
  }
}

export default {
  'Exposing the StoreModel': {
    beforeEach() {
      alt.recycle()
    },

    'as an object'() {
      const MyStore = alt.createStore(MyStoreModelObj)

      assert(MyStore.getState().test === 2, 'store state is initially set')

      assert.isDefined(MyStore.StoreModel, 'store model is available')
      assert.isObject(MyStore.StoreModel, 'store model is an object')

      assert(MyStore.StoreModel === MyStoreModelObj, 'the store model is the same as the original object')

      Actions.hello()

      assert(MyStore.getState().test === 1, 'i can change state through actions')
    },

    'as a class'() {
      const MyStore = alt.createStore(MyStoreModel, 'MyStore')

      assert(MyStore.getState().test === 2, 'store state is initially set')

      assert.isDefined(MyStore.StoreModel, 'store model is available')
      assert.isFunction(MyStore.StoreModel, 'store model is a function')

      assert(MyStore.StoreModel === MyStoreModel, 'the store model is the same as the original object')

      Actions.hello()

      assert(MyStore.getState().test === 1, 'i can change state through actions')
    },
  }
}
