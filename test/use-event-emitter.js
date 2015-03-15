import { assert } from 'chai'
import Alt from '../dist/alt-with-runtime'

const alt = new Alt()

class MyStore {
  constructor() { }
}

const myStore = alt.createStore(MyStore)

export default {
  'use the event emitter to emit your own events'() {

    const events = myStore.getEventEmitter()

    const check = (data) => assert(data === 'it works')

    events.on('foo', check)

    events.emit('foo', 'it works')

    events.off('foo', check)
  }
}
