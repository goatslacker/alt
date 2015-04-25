import { assert } from 'chai'
import Alt from '../dist/alt-with-runtime'

class MyActions {
  constructor() {
    this.generateActions('changeNumber')
  }
}

class MyStore {
  constructor() {
    this.number = 2
    this.letter = 'a'
  }

  onChangeNumber() {
    this.number *= 2
  }
}

export default {
  'custom dispatcher can be specified in alt config'() {
    class CustomDispatcher {
      waitFor() {}
      register() {}
      dispatch() {}
      extraMethod() {}
    }

    const alt = new Alt({
      dispatcher: new CustomDispatcher()
    })
    const dispatcher = alt.dispatcher

    // uses custom dispatcher
    assert.equal(typeof dispatcher.extraMethod, 'function')
    assert.equal(typeof dispatcher.dispatch, 'function')
  },

  'custom serialize/deserialize'() {
    const CustomSerialize = (data) => {
      return Object.keys(data).reduce((obj, key) => {
        obj[key] = {wrapper: data[key]}
        return obj
      }, {})
    }
    const CustomDeserialize = (data) => {
      return Object.keys(data).reduce((obj, key) => {
        obj[key] = data[key].wrapper
        return obj
      }, {})
    }

    const alt = new Alt({
      serialize: CustomSerialize,
      deserialize: CustomDeserialize,
    })
    alt.addStore('MyStore', MyStore)
    alt.addActions('MyActions', MyActions)
    const snapshot = alt.takeSnapshot()
    alt.getActions('MyActions').changeNumber()
    alt.rollback()

    assert.deepEqual(snapshot, {MyStore: {wrapper: {number: 2, letter: 'a'}}})
    assert.deepEqual(alt.getStore('MyStore').getState(), {number: 2, letter: 'a'})
  },

  'custom transforms'() {
    const alt = new Alt({ storeTransforms: [] })
    assert.isArray(alt.storeTransforms)
  },
}
