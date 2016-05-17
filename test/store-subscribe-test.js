import Alt from '../'
import { assert } from 'chai'
import sinon from 'sinon'

const alt = new Alt()

const {
  updateName,
  dontEmit,
} = alt.generateActions('', ['updateName', 'dontEmit'])

class MyStore extends Alt.Store {
  constructor() {
    super()
    this.bindActions({ updateName, dontEmit })
    this.state = { name: '', nope: false }
  }

  updateName(name) {
    this.setState({ name })
  }

  dontEmit() {
    this.setState({ nope: true })
    this.preventDefault()
  }
}

const myStore = alt.createStore('MyStore', new MyStore())

export default {
  beforeEach() {
    alt.flush()
  },

  'store listening'() {
    const mooseChecker = (x) => {
      assert(x.name === 'moose', 'listener for store works')
      assert(myStore.getState().name === 'moose', 'new store state present')
    }
    const sub = myStore.subscribe(mooseChecker)
    updateName('moose')

    assert(myStore.getState().name === 'moose', 'new store state present')

    sub.dispose()
    updateName('badger')

    assert(myStore.getState().name === 'badger', 'new store state present')
  },

  'unlistening'() {
    assert(myStore.getState().name !== 'moose', 'state has not been updated')

    const mooseChecker = sinon.spy()
    const sub = myStore.subscribe(mooseChecker)
    updateName('moose')

    assert(myStore.getState().name === 'moose', 'new store state present')

    sub.dispose()

    updateName('badger')

    assert(myStore.getState().name === 'badger', 'new store state present')
    assert.ok(mooseChecker.calledOnce)
  },

  'unlisten lifecycle hook'() {
    const unlistener = sinon.spy()
    const spy2 = sinon.spy()
    class XStore extends Alt.Store {
      constructor() {
        super()
        this.on('unlisten', unlistener)
        this.on('unlisten', spy2)
      }
    }
    const store = alt.createStore('XStore', new XStore())

    // unlisten directly
    store.subscribe(function () { }).dispose()

    assert.ok(unlistener.calledOnce, 'unlisten lifecycle hook called')
    assert.ok(spy2.calledOnce)
  },

  'prevent emit'() {
    assert.isFalse(myStore.getState().nope)

    const sub = myStore.subscribe(() => {
      throw new Error('Event was emitted')
    })

    dontEmit()
    sub.dispose()

    assert.isTrue(myStore.getState().nope)

    const spy = sinon.spy()

    const sub2 = myStore.subscribe(spy)
    updateName('Fox')
    sub2.dispose()

    assert.ok(spy.calledOnce)
    assert(myStore.getState().name === 'Fox')
  },
}
