import { assert } from 'chai'
import Alt from '../'

class MyStore extends Alt.Store {
  constructor() {
    super()

    this.state = { number: 2, letter: 'a' }
  }
}

export default {
  'custom dispatcher can be specified in alt config'() {
    function publish() { }

    const alt = new Alt({
      publish,
      subscribe() { },
    })

    assert(alt.publish === publish)

    assert.isFunction(alt.publish)
    assert.isFunction(alt.subscribe)
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

    alt.createStore('MyStore', new MyStore())
    const snapshot = alt.save()

    alt.flush()

    assert.deepEqual(snapshot, {MyStore: {wrapper: {number: 2, letter: 'a'}}})
    assert.deepEqual(alt.stores.MyStore.getState(), {number: 2, letter: 'a'})
  },
}
