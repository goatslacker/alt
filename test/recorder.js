import Alt from '../dist/alt-with-runtime'
import { assert } from 'chai'

import DispatcherRecorder from '../utils/DispatcherRecorder'

const alt = new Alt()
const recorder = new DispatcherRecorder(alt)

function Actions() { this.generateActions('a', 'b', 'c') }

const actions = alt.createActions(Actions)

class Store {
  constructor() {
    this.bindActions(actions)
    this.a = 0
    this.b = 0
    this.c = 0
  }

  a(value) { this.a = value }
  b(value) { this.b = value }
  c(value) { this.c = value }
}

const store = alt.createStore(Store)

export default {
  'DispatcherRecorder': {
    beforeEach() {
      alt.recycle()
    },

    'the dispatcher recorder util'() {
      const recording1 = recorder.record()

      assert.ok(recording1, 'we are now recording')

      actions.a('hello')
      actions.b('world')
      actions.c('it works')

      const recording2 = recorder.record()

      assert.notOk(recording2, 'we are already recording')

      recorder.stop()

      assert(store.getState().a === 'hello', 'store state is set')
      assert(store.getState().b === 'world', 'store state is set')
      assert(store.getState().c === 'it works', 'store state is set')

      alt.recycle()

      assert(store.getState().a === 0, 'store state is cleared')
      assert(store.getState().b === 0, 'store state is cleared')
      assert(store.getState().c === 0, 'store state is cleared')

      recorder.replay()

      assert(store.getState().a === 'hello', 'store state is set')
      assert(store.getState().b === 'world', 'store state is set')
      assert(store.getState().c === 'it works', 'store state is set')

      assert(recorder.events.length === 3, 'there are 3 events stored')

      recorder.clear()

      assert(recorder.events.length === 0, 'recorder was cleared')
    },

    'asynchronously dispatching events'(done) {
      const recording = recorder.record()

      assert.ok(recording, 'we are now recording')

      actions.a('hello')
      actions.b('world')
      actions.c('it works')

      recorder.stop()

      assert(store.getState().a === 'hello', 'store state is set')
      assert(store.getState().b === 'world', 'store state is set')
      assert(store.getState().c === 'it works', 'store state is set')

      alt.recycle()

      assert(store.getState().a === 0, 'store state is cleared')
      assert(store.getState().b === 0, 'store state is cleared')
      assert(store.getState().c === 0, 'store state is cleared')

      recorder.replay(0, () => {
        assert(store.getState().a === 'hello', 'store state is set')
        assert(store.getState().b === 'world', 'store state is set')
        assert(store.getState().c === 'it works', 'store state is set')

        recorder.clear()
        assert(recorder.events.length === 0, 'recorder was cleared')

        done()
      })
    },

    'serialize and deserialize events'() {
      const recording = recorder.record()

      actions.a()
      actions.a('hello')
      actions.b('world')
      actions.c('it works')

      recorder.stop()

      assert.equal(store.getState().a, 'hello', 'store state is set')
      assert.equal(store.getState().b, 'world', 'store state is set')
      assert.equal(store.getState().c, 'it works', 'store state is set')

      var serialized = recorder.serializeEvents()

      assert.equal(typeof serialized, 'string', 'events were serialized')

      const newRecorder = new DispatcherRecorder(alt)

      assert.equal(newRecorder.events.length, 0, 'events are blank')

      alt.recycle()

      assert.equal(store.getState().a, 0, 'store state is cleared')
      assert.equal(store.getState().b, 0, 'store state is cleared')
      assert.equal(store.getState().c, 0, 'store state is cleared')

      newRecorder.loadEvents(serialized)

      assert.equal(newRecorder.events.length, 4, 'events are loaded')

      newRecorder.replay()

      assert.equal(store.getState().a, 'hello', 'store state is set')
      assert.equal(store.getState().b, 'world', 'store state is set')
      assert.equal(store.getState().c, 'it works', 'store state is set')
    },

    'recording only 1 event'() {
      const recorder = new DispatcherRecorder(alt, 1)
      recorder.record()
      actions.a('hello')
      actions.b('world')
      actions.c('it works')
      assert(recorder.events.length === 1)
      recorder.stop()
    },
  }
}
