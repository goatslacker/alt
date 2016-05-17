import Alt from '../'
import { assert } from 'chai'
import sinon from 'sinon'

const alt = new Alt()

const myActions = alt.generateActions('', [
  'updateName',
  'resetRecycled',
])

class MyStore extends Alt.Store {
  constructor() {
    super()
    this.state = { name: 'first' }
    this.bindActions(myActions)
  }

  updateName(name) {
    this.setState({ name })
  }

  resetRecycled() {
    this.setState({ recycled: false })
  }
}

const myStore = alt.createStore('MyStore', new MyStore())
const secondStore = alt.createStore('SecondStore', new MyStore())

export default {
  beforeEach() {
    alt.flush()
  },

  'flushing'() {
    myActions.resetRecycled()
    assert(secondStore.getState().recycled === false, 'flush const was reset due to action')
    alt.flush()

    myActions.updateName('goat')
    const flushed = JSON.parse(alt.flush())
    assert(myStore.getState().name === 'first', 'flush is a lot like recycle')
    assert(flushed.MyStore.name === 'goat', 'except that flush returns the state before recycling')

    myActions.updateName('butterfly')
    assert(myStore.getState().name === 'butterfly', 'I can update the state again after a flush')
    assert(secondStore.getState().name === 'butterfly', 'I can update the state again after a flush')

    alt.flush()
    assert(myStore.getState().name === 'first', 'flush sets the state back to its origin')
  },

  'flushing a single store'() {
    myActions.updateName('butterfly')
    alt.flush({ 'MyStore': myStore })
    assert(myStore.getState().name === 'first', 'I can flush specific stores')
    assert(secondStore.getState().name === 'butterfly', 'and other stores will not be flushed')

    myActions.updateName('butterfly')
    alt.flush({ 'MyStore': myStore })
    assert(myStore.getState().name === 'first', 'I can flush specific stores')
  },
}
