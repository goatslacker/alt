import Alt from '../dist/alt-with-runtime'
import makeFinalStore from '../utils/makeFinalStore'
import assert from 'assert'

const alt = new Alt()

export default {
  'make final store'() {
    function Action() { this.generateActions('set') }

    let action = alt.createActions(Action)

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
    let store1 = alt.createStore(Store1)
    let FinalStore = makeFinalStore(alt)
    let store2 = alt.createStore(Store2)
    let store3 = alt.createStore(Store3)


    let finalStoreCalls = 0

    FinalStore.listen(() => {
      assert.equal(++finalStoreCalls, 1, 'final store was called only once')

      assert.equal(store1.getState().value, 1, 'store1 value correct')
      assert.equal(store2.getState().value, 2, 'store2 value correct')
      assert.equal(store3.getState().value, 3, 'store3 value correct')
    })

    let store2Calls = 0

    store2.listen(() => {
      assert.equal(++store2Calls, 1, 'store 2 listen was only called once')
      assert.equal(store2.getState().value, 2, 'store2 state was updated successfully')
    })

    // Fire off the action
    action.set()
  },
}
