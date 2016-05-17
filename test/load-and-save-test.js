import Alt from '../'
import { assert } from 'chai'
import sinon from 'sinon'

const alt = new Alt()

const myActions = alt.generateActions('', [
  'updateName',
  'updateTwo',
  'updateAnotherVal',
])

class LifecycleStore extends Alt.Store {
  constructor() {
    super()

    this.state = {
      loaded: false,
      saved: false,
    }

    this.bindListeners({
      test: myActions.updateName,
      test2: [myActions.updateName, myActions.updateTwo],
      test3: myActions.updateName
    })

    this.on('load', () => this.setState({ loaded: true }))
    this.on('save', () => this.setState({ saved: true }))
  }

  test() { }
  test2() { }
  test3() { }
}

const lifecycleStore = alt.createStore('LifecycleStore', new LifecycleStore())

class MyStore extends Alt.Store {
  constructor() {
    super()
    this.state = { name: 'first' }
    this.bindActions(myActions)
  }

  updateName(name) {
    this.setState({ name })
  }
}
const myStore = alt.createStore('MyStore', new MyStore())

export default {
  beforeEach() {
    alt.flush()
  },

  'saving and loading'() {
    const initialSnapshot = alt.save()
    assert(lifecycleStore.getState().saved === true, 'save was called and the life cycle event was triggered')

    const loadReturnValue = alt.load(initialSnapshot)
    assert(loadReturnValue === undefined, 'load returns nothing')
    assert(lifecycleStore.getState().loaded === true, 'load was called and the life cycle event was triggered')
    assert(lifecycleStore.getState().saved === false, 'save was set back to false')
  },

  'saving'() {
    myActions.updateName('bear')
    const snapshot = alt.save()
    assert.isString(snapshot, 'a snapshot json is returned')

    assert(JSON.parse(snapshot).MyStore.name === 'bear', 'the state is current')

    myActions.updateName('blossom')
    assert(myStore.getState().name === 'blossom', 'action was called, state was updated properly')
    assert(JSON.parse(snapshot).MyStore.name === 'bear', 'the snapshot is not affected by action')
  },

  'specifying stores to save'() {
    const snapshot = alt.save({ MyStore: myStore })
    assert.deepEqual(Object.keys(JSON.parse(snapshot)), ['MyStore'], 'the snapshot includes specified stores')
    assert(Object.keys(JSON.parse(snapshot)).indexOf('LifecycleStore') === -1, 'the snapshot does not include unspecified stores')
  },

  'loading'() {
    alt.load('{"MyStore":{"name":"bee"}}')
    assert(myStore.getState().name === 'bee', 'I can load many times')

    alt.load('{}')

    alt.load({ MyStore: { name: 'monkey' }})
    assert(myStore.getState().name === 'monkey', 'I can load many times')
  },

  'load store that does not exist'() {
    assert.doesNotThrow(() => {
      alt.load('{"AStoreThatIJustMadeUpButDoesNotReallyExist": {}}')
    })
  },


}
