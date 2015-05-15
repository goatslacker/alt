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
  }
}

@createStore(alt)
@datasource(StargazerSource)
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
      alt.recycle()
      local.reset()
      remote.reset()
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
          assert.notOk(StargazerStore.hasError(), 'no errors')
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
          assert.ok(StargazerStore.hasError(), 'we have an error')
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
  }
}
