import assert from 'assert'
import Alt from '../'

import * as StoreModel from './helpers/SaaM'

const alt = new Alt()
const actions = alt.generateActions('increment')
const store = alt.createStore(StoreModel)

export default {
  'Stores as a Module': {
    'store state is there'() {
      assert.equal(store.getState(), 1, 'store data is initialized to 1')

      actions.increment()

      assert.equal(store.getState(), 2, 'store data was updated')

      actions.increment()

      assert.equal(store.getState(), 3, 'incremented again')
    }
  }
}
