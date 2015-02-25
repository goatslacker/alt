import 'babel/external-helpers'

import Alt from '../dist/alt-with-runtime'
import assert from 'assert'

import DispatcherRecorder from '../utils/DispatcherRecorder'

let alt = new Alt()
let recorder = new DispatcherRecorder(alt)

function Actions() { this.generateActions('a', 'b', 'c') }

let actions = alt.createActions(Actions)

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

let store = alt.createStore(Store)

export default {
  'the dispatcher recorder util'() {
    let recording = recorder.record()

    assert.equal(recording, true, 'we are now recording')

    actions.a('hello')
    actions.b('world')
    actions.c('it works')

    recording = recorder.record()

    assert.equal(recording, false, 'we are already recording')

    recorder.stop()

    assert.equal(store.getState().a, 'hello', 'store state is set')
    assert.equal(store.getState().b, 'world', 'store state is set')
    assert.equal(store.getState().c, 'it works', 'store state is set')

    alt.recycle()

    assert.equal(store.getState().a, 0, 'store state is cleared')
    assert.equal(store.getState().b, 0, 'store state is cleared')
    assert.equal(store.getState().c, 0, 'store state is cleared')

    recorder.replay()

    assert.equal(store.getState().a, 'hello', 'store state is set')
    assert.equal(store.getState().b, 'world', 'store state is set')
    assert.equal(store.getState().c, 'it works', 'store state is set')

    assert.equal(recorder.events.length, 3, 'there are 3 events stored')

    recorder.clear()

    assert.equal(recorder.events.length, 0, 'recorder was cleared')
  }
}
