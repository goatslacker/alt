import Alt from './'
import { createStore, datasource } from './utils/decorators'
import axios from 'axios'

const alt = new Alt()

const StargazerActions = alt.generateActions(
  'fetchingUsers',
  'usersReceived',
  'failed'
)

const StargazerSource = {
  fetchUsers: {
    fetch(state) {
      const url = `https://api.github.com/repos/${state.user}/${state.repo}/stargazers`
      return axios({ url }).then(response => response.data)
    },

    cache(state) {
      return state.users.length ? state.users : null
    },

    loading: StargazerActions.fetchingUsers,

    success: StargazerActions.usersReceived,

    error: StargazerActions.failed
  }
}

@createStore(alt)
@datasource(StargazerSource)
class StargazerStore {
  constructor() {
    this.user = 'goatslacker'
    this.repo = 'alt'
    this.users = []
    this.errorMessage = null
    this.isLoading = false

    this.bindListeners({
      loading: StargazerActions.fetchingUsers,
      receivedUsers: StargazerActions.usersReceived,
      failed: StargazerActions.failed
    })
  }

  loading() {
    console.log('STORE: starting to load users')
    this.isLoading = true
  }

  failed(e) {
    console.log('STORE: Uh oh')
    this.errorMessage = e.statusText || String(e)
  }

  receivedUsers(users) {
    console.log('STORE: got users')
    this.users = users
    this.errorMessage = null
  }
}

StargazerStore.listen((state) => console.log('CHANGED', state.users.length))
StargazerStore.fetchUsers()
