import Alt from '../'
import { assert } from 'chai'

const alt = new Alt()

const actions = alt.createActions(class AsyncActions {
  displayName = 'AsyncActions'
  fetch() {
    return Promise.resolve('foo')
  }
})

const store = alt.createStore(class FooStore {
  displayName = 'FooStore'
  constructor() {
    this.dispatched = false
    this.bindActions(actions)
  }
  onFetch() {
    this.dispatched = true
  }
})

export default {
  'async actions'() {
    actions.fetch()
    assert(store.state.dispatched === false, 'async action is not automatically dispatched')
  }
}
