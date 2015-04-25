import Alt from '../dist/alt-with-runtime'
import makeFinalStore from '../utils/makeFinalStore'
import { assert } from 'chai'
import sinon from 'sinon'

const alt = new Alt()
const FinalStore = makeFinalStore(alt)

export default {
  'FinalStore': {
    'make final store'() {
      function Action() { this.generateActions('set') }

      const action = alt.createActions(Action)

      function Store1() {
        this.bindActions(action)
        this.value = null
      }
      Store1.prototype.set = function () {
        this.value = 1
      }

      function Store2() {
        this.bindActions(action)
        this.value = null
      }
      Store2.prototype.set = function () {
        this.value = 2
      }

      function Store3() {
        this.bindActions(action)
        this.value = null
      }
      Store3.prototype.set = function () {
        this.value = 3
      }

      // I put these out of order intentionally because order shouldn't
      // determine when these get called, the finalstore should always be last.
      const store1 = alt.createStore(Store1)
      const FinalStore = makeFinalStore(alt)
      const store2 = alt.createStore(Store2)
      const store3 = alt.createStore(Store3)

      const finalStoreListener = sinon.spy()
      FinalStore.listen(finalStoreListener)

      const store2Listener = sinon.spy()
      store2.listen(store2Listener)

      // Fire off the action
      action.set()

      assert.ok(finalStoreListener.calledOnce, 'final store called once')
      assert.ok(store2Listener.calledOnce, 'store2 listener caleld once')

      assert(store1.getState().value === 1, 'store1 value correct')
      assert(store2.getState().value === 2, 'store2 value correct')
      assert(store3.getState().value === 3, 'store3 value correct')

      assert.ok(finalStoreListener.calledAfter(store2Listener), 'final store was last one to be called')

      const stateListen = sinon.spy()
      FinalStore.listen(stateListen)

      action.set(27)

      assert.ok(stateListen.calledOnce, 'final store called once')
      assert(stateListen.args[0][0].payload.data === 27, 'the payload was received')
    },

    'making another final store returns the right store'() {
      const store = makeFinalStore(alt)
      assert(store === FinalStore)
    },
  }
}
