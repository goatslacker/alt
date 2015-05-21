import { assert } from 'chai'
import Alt from '../'
import sinon from 'sinon'

export default {
  'Recycling': {
    'recycles a store with no initial state'() {
      const alt = new Alt()
      const actions = alt.generateActions('fire')

      const store = alt.createStore(function () {
        this.bindAction(actions.fire, () => {
          this.test = (this.test || 0) + 1
        })
      }, 'Store')


      assert(Object.keys(store.getState()).length === 0, 'store has no state')
      actions.fire()

      assert(store.getState().test === 1, 'store has some state')

      alt.recycle()

      assert(Object.keys(store.getState()).length === 0, 'store was emptied')
      assert.isUndefined(store.getState().test, 'store was recycled to initial state')
    },
  }
}
