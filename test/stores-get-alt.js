import { assert } from 'chai'
import Alt from '../dist/alt-with-runtime'

const alt = new Alt()

export default {
  'the stores get the alt instance'() {
    class MyStore {
      constructor(alt) {
        assert.instanceOf(alt, Alt, 'alt is an instance of Alt')
      }
    }

    alt.createStore(MyStore, 'MyStore', alt)
  },

  'the actions get the alt instance'() {
    class MyActions {
      constructor(alt) {
        assert.instanceOf(alt, Alt, 'alt is an instance of Alt')
      }
    }

    alt.createActions(MyActions, undefined, alt)
  }
}
