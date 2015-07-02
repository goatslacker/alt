import Alt from '../'
import { createStore, datasource } from '../utils/decorators'
import sinon from 'sinon'
import { assert } from 'chai'
import { Promise } from 'es6-promise'

const alt = new Alt()

const StargazerActions = alt.generateActions(
  'fetchingUsers',
  'usersReceived',
  'failed'
)

const fauxjax = sinon.stub().returns(Promise.resolve([1, 2, 3, 4]))
const failjax = sinon.stub().returns(Promise.reject(new Error('things broke')))

const api = {
  remote(state) { },
  local(state) { },
}

const remote = sinon.stub(api, 'remote', (state, repo = state.repo) => {
  const url = `https://api.github.com/repos/${state.user}/${repo}/stargazers`
  return repo === 'alts' ? failjax(url) : fauxjax(url)
})

const local = sinon.stub(api, 'local', (state) => {
  return state.users.length ? state.users : null
})

const StargazerSource = {
  fetchUsers() {
    return {
      remote,
      local,
      loading: StargazerActions.fetchingUsers,
      success: StargazerActions.usersReceived,
      error: StargazerActions.failed
    }
  },

  alwaysFetchUsers: {
    remote,
    local: () => true,
    loading: StargazerActions.fetchingUsers,
    success: StargazerActions.usersReceived,
    error: StargazerActions.failed,
    shouldFetch: () => true
  },

  neverFetchUsers: {
    remote,
    local: () => false,
    loading: StargazerActions.fetchingUsers,
    success: StargazerActions.usersReceived,
    error: StargazerActions.failed,
    shouldFetch: () => false
  },

  fetchRepos: {
    remote() {
      return Promise.resolve('batman')
    },
    interceptResponse(x, action, args) {
      assert(x === 'batman')
      assert(action === StargazerActions.usersReceived)
      assert(Array.isArray(args))
      return 'TESTTEST'
    },
    success: StargazerActions.usersReceived,
    error: StargazerActions.failed
  }
}

@createStore(alt)
class StargazerStore {
  static config = {
    stateKey: 'state'
  }

  constructor() {
    this.state = {
      user: 'goatslacker',
      repo: 'alt',
      users: [],
      errorMessage: null,
      isLoading: false
    }

    this.registerAsync(StargazerSource)

    this.bindListeners({
      loading: StargazerActions.fetchingUsers,
      receivedUsers: StargazerActions.usersReceived,
      failed: StargazerActions.failed
    })
  }

  loading() {
    this.setState({ isLoading: true })
  }

  failed(e) {
    this.setState({ errorMessage: e.statusText || String(e) })
  }

  receivedUsers(users) {
    this.setState({ users, errorMessage: null })
  }
}

export default {
  'async': {
    beforeEach() {
      global.window = {}

      alt.recycle()
      local.reset()
      remote.reset()
    },

    afterEach() {
      delete global.window
    },

    'methods are available'() {
      assert.isFunction(StargazerStore.fetchUsers)
      assert.isFunction(StargazerStore.isLoading)
    },

    'data source with no action'() {
      assert.throws(() => {
        @createStore(alt)
        @datasource({
          derp() { return { success: () => null } }
        })
        class Store { }
      }, Error, /handler must be an action function/)
    },

    'loading state'(done) {
      const spy = sinon.spy()
      const begin = StargazerStore.listen(spy)

      const test = StargazerStore.listen((state) => {
        assert.isArray(state.users, 'we have an array')

        if (spy.callCount === 1) {
          assert(state.isLoading === true, 'the loading action was called')
          assert.ok(StargazerStore.isLoading(), 'and the loading function returns true')
          assert(state.users.length === 0, 'empty array')
        } else if (spy.callCount === 2) {
          assert.notOk(StargazerStore.isLoading(), 'and the loading function returns false')
          assert(state.users.length === 4, 'there are 4 elements present')
        }
      })

      const end = StargazerStore.listen((state) => {
        if (spy.callCount === 2) {
          begin()
          test()
          end()

          assert.ok(local.calledOnce)
          assert.ok(remote.calledOnce)
          done()
        }
      })

      StargazerStore.fetchUsers()
      assert.ok(StargazerStore.isLoading())
    },

    'data available already'(done) {
      StargazerActions.usersReceived([1, 2, 3])

      const spy = sinon.spy()
      const count = StargazerStore.listen(spy)

      const test = StargazerStore.listen((state) => {
        if (spy.callCount === 1) {
          assert(state.users.length === 3)
          count()
          test()
          assert.ok(local.calledOnce)
          assert.notOk(StargazerStore.isLoading())
          assert(remote.callCount === 0)
          done()
        }
      })

      StargazerStore.fetchUsers()
      assert.notOk(StargazerStore.isLoading())
    },

    'errors'(done) {
      const spy = sinon.spy()
      const count = StargazerStore.listen(spy)

      const test = StargazerStore.listen((state) => {
        if (spy.callCount === 1) {
          assert(state.users.length === 0)
        } else if (spy.callCount === 2) {
          assert.match(state.errorMessage, /things broke/)
          count()
          test()
          assert.notOk(StargazerStore.isLoading())
          assert.ok(local.calledOnce)
          assert.ok(remote.calledOnce)
          done()
        }
      })

      StargazerStore.fetchUsers('alts')
      assert.ok(StargazerStore.isLoading())
    },

    'shouldFetch is true'() {
      StargazerStore.alwaysFetchUsers()
      assert.ok(StargazerStore.isLoading(), 'i am loading')
      assert.ok(remote.calledOnce, 'remote was called once')
    },

    'shouldFetch is false'() {
      StargazerStore.neverFetchUsers()
      assert.notOk(StargazerStore.isLoading(), 'loading now')
      assert(remote.callCount === 0, 'remote was not called')
    },

    'multiple loads'(done) {
      const unsub = StargazerStore.listen((state) => {
        if (state.users === 'TESTTEST') {
          assert.notOk(StargazerStore.isLoading())
          unsub()
          done()
        } else {
          assert.ok(StargazerStore.isLoading())
        }
      })

      StargazerStore.fetchUsers()
      StargazerStore.fetchRepos()
      assert.ok(StargazerStore.isLoading())
    },

    'as a function'() {
      const FauxSource = sinon.stub().returns({})

      class FauxStore {
        static displayName = 'FauxStore'

        constructor() {
          this.exportAsync(FauxSource)
        }
      }

      const store = alt.createStore(FauxStore)

      assert(FauxSource.firstCall.args[0] === alt)
      assert.isFunction(store.isLoading)
    },

    'as an object'() {
      const actions = alt.generateActions('test')

      const PojoSource = {
        justTesting: {
          success: actions.test,
          error: actions.test,
        }
      }

      class MyStore {
        static displayName = 'MyStore'
      }

      const store = alt.createStore(datasource(PojoSource)(MyStore))

      assert.isFunction(store.justTesting)
      assert.isFunction(store.isLoading)
    },

    'server rendering does not happen unless you lock alt'(done) {
      delete global.window

      const actions = alt.generateActions('test')
      alt.trapAsync = true

      const PojoSource = {
        justTesting: {
          remote() {
            return Promise.resolve(true)
          },
          success: actions.test,
          error: actions.test,
        }
      }

      @datasource(PojoSource)
      class MyStore {
        static displayName = 'ServerRenderingStore'
      }

      const spy = sinon.spy()

      const dispatchToken = alt.dispatcher.register(spy)

      const store = alt.createStore(MyStore)

      store.justTesting().then((value) => {
        assert.isFunction(value)
        assert(spy.callCount === 0, 'the dispatcher was never called')

        value()

        assert.ok(spy.calledOnce, 'the dispatcher was flushed')

        alt.dispatcher.unregister(dispatchToken)
        alt.trapAsync = false
        done()
      })
    },
  }
}
