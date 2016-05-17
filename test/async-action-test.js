import Alt from '../'
import { assert } from 'chai'

const alt = new Alt()

const actions = alt.createAsyncActions('AsyncActions', {
  ok: () => Promise.resolve(1),
  notOk: () => Promise.reject(0),
})

class FooStore extends Alt.Store {
  constructor() {
    super()
    this.state = {
      success: false,
      error: false,
      loading: false,
    }

    this.bindActions(actions)
  }

  ok(payload, action) {
    if (!action.meta.loading && !action.error) {
      this.setState({ success: true })
    }
    this.setState({ loading: !!action.meta.loading, error: !!action.error })
  }

  notOk(payload, action) {
    this.setState({ loading: !!action.meta.loading, error: !!action.error })
  }
}

const store = alt.createStore('FooStore', new FooStore())

export default {
  'async actions': {
    afterEach() {
      alt.flush(store)
    },

    'dispatched whenever a success is received'() {
      const res = actions.ok().then(() => {
        assert.isTrue(store.getState().success)
      })
      assert.isFalse(store.getState().success, 'async action is not automatically dispatched')
      assert.isTrue(store.getState().loading, 'loading has been set to true')
      return res
    },

    'errors are dispatched too with FSA semantics'() {
      return actions.notOk().catch(() => {
        assert.isTrue(store.getState().error)
      })
    },
  },
}
