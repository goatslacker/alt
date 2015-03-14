import {assert} from 'chai'
import Alt from '../dist/alt-with-runtime'

let alt = new Alt()

export default {
  'the stores get the alt instance'() {
    class MyStore {
      constructor(alt) {
        assert.equal(alt instanceof Alt, true, 'alt is an instance of Alt')
      }
    }

    alt.createStore(MyStore)
  },

  'the actions get the alt instance'() {
    class MyActions {
      constructor(alt) {
        assert.equal(alt instanceof Alt, true, 'alt is an instance of Alt')
      }
    }

    alt.createActions(MyActions)
  }
}
