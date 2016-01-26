import Alt from '../'
import { assert } from 'chai'
import isPromise from 'is-promise'

const alt = new Alt()

const actions = alt.createActions(class AsyncActions {
  static displayName = 'AsyncActions';
  fetch() {
    return Promise.resolve('foo')
  }

  fetchAndDispatch() {
    return (dispatch) => {
      dispatch()
      return Promise.resolve('foo')
    }
  }
})

const store = alt.createStore(class FooStore {
  static displayName = 'FooStore';
  constructor() {
    this.dispatched = false
    this.bindActions(actions)
  }
  onFetch() {
    this.dispatched = true
  }
  onFetchAndDispatch() {
    this.dispatched = true
  }
})

export default {
  'async actions': {
    afterEach() {
      alt.recycle(store)
    },

    'are not dispatched automatically'() {
      actions.fetch()
      assert(store.state.dispatched === false, 'async action is not automatically dispatched')
    },

    'return the result of inner function invocation'() {
      const promise = actions.fetchAndDispatch()
      assert(isPromise(promise), 'async action does not return the result of inner function invocation')
      assert(store.state.dispatched === true, 'async action is dispatched when the dispatch is invoked manually')
    },
  },
}
