import Alt from './'
import React from 'react'
import Render, { connect } from './utils/Render'
import axios from 'axios'

const alt = new Alt()

const actions = alt.generateActions('yes', 'no')

const UserStore = alt.createStore(function () {
  this.state = { users: [] }

  this.bindAction(actions.yes, users => this.setState({ users }))
//  this.bindAction(actions.yes, users => console.log('data', users))

  this.exportPublicMethods({
    getUsers: () => this.state.users,

    fetchUsers: (user, repo) => {
      return this.fetch({
        remote() {
          const url = `https://api.github.com/repos/${user}/${repo}/stargazers`
          return axios({ url }).then(response => response.data)
        },

        success: actions.yes,
        error: actions.no
      })
    }
  })
}, 'UserStore')

@connect({
  listenTo() {
    return [UserStore]
  },

  resolveAsync(props) {
    return UserStore.fetchUsers(props.user, props.repo)
  },

  reduceProps(props, context) {
    return {
      users: UserStore.getUsers()
    }
  },

  loading() {
    return <div>Loading...</div>
  },

  failed(props, context) {
    return <div>Uh oh</div>
  }
})
class Stargazers extends React.Component {
  render() {
    return (
      <section>
        <div className="card">
          <div className="card-content">
            <span className="card-title deep-purple-text">Stargazers</span>
            <p>
              People who have starred this project
            </p>
          </div>
        </div>

        {this.renderUsers(this.props.users)}
      </section>
    )
  }

  renderUser(user) {
    return (
      <div key={user.id} style={{ display: 'inline-block' }}>
        <img src={user.avatar_url} alt="" width={32} height={32} />
        <br />
        {user.login}
      </div>
    )
  }

  renderUsers(users) {
    return (
      <div>
        {users.map(user => (
          <div key={user.id}>
            {this.renderUser(user)}
          </div>
        ))}
      </div>
    )
  }
}

class Count extends React.Component {
  render() {
    return <div />
  }
}

class App extends React.Component {
  constructor() {
    super()
    this.state = {
      user: 'goatslacker',
      repo: 'alt'
    }

    this.doChange = this.doChange.bind(this)
  }

  doChange() {
    const user = this.refs.user.getDOMNode().value
    const repo = this.refs.repo.getDOMNode().value

    this.setState({ user, repo })
  }

  render() {
    return (
      <div>
        <label>
          User
          <input type="text" ref="user" defaultValue={this.state.user} />
        </label>
        <label>
          Repo
          <input type="text" ref="repo" defaultValue={this.state.repo} />
        </label>
        <button onClick={this.doChange}>Go</button>
        <Count user={this.state.user} repo={this.state.repo} />
        <Stargazers user={this.state.user} repo={this.state.repo} />
      </div>
    )
  }
}

export default {
  server(props) {
    console.log('Requesting', props)
    return new Render(alt).toString(App, props)
  },

  client(state, props, node, meta) {
    alt.bootstrap(state)
    new Render(alt).toDOM(App, props, node, meta)
  }
}
