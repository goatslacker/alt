import assert from 'assert'
import Alt from '../dist/alt-with-runtime'

let alt = new Alt()

class MyStore {
  constructor() { }
}

let myStore = alt.createStore(MyStore)

export default {
  'use the event emitter to emit your own events'() {

    let events = myStore.getEventEmitter()

    let check = (data) => assert.equal(data, 'it works')

    events.on('foo', check)

    events.emit('foo', 'it works')

    events.off('foo', check)
  }
}
