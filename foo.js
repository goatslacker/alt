import Alt from './'
import React from 'react'
import Render, { connect } from './utils/Render'

const alt = new Alt()

const actions = alt.generateActions('yes', 'no')

const UserStore = alt.createStore(function () {
  this.state = { user: null }

  this.bindAction(actions.yes, user => this.setState({ user }))

  this.exportPublicMethods({
    getUser: () => this.state.user,

    fetchUser: (id) => {
      return this.fetch({
        remote() {
          if (id === 1) {
            return Promise.resolve('Josh')
          } else {
            return Promise.reject('Unknown')
          }
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
    return UserStore.fetchUser(props.id)
  },

  reduceProps(props, context) {
    return {
      user: UserStore.getUser()
    }
  },

  // if something failed on the server you might want to retry fetching on the client...
  failed() {
    return <div>Uh oh</div>
  }
})
class App extends React.Component {
  render() {
    return <div>{this.props.user}</div>
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
