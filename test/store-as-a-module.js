import assert from 'assert'

import alt from './helpers/alt'
import actions from './helpers/SampleActions'
import * as StoreModel from './helpers/SaaM'

const store = alt.createStore(StoreModel)

export default {
  'Stores as a Module': {
    beforeEach() {
      alt.recycle()
    },

    'store state is there'() {
      assert.equal(store.getState().data, 1, 'store data is initialized to 1')

      actions.fire(2)

      assert.equal(store.getState().data, 2, 'store data was updated')
    }
  }
}
