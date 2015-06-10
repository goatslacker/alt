import React from 'react'
import Alt from '../'
import AltContainer from '../AltContainer'
import * as Render from '../utils/Render'
import { assert } from 'chai'

const alt = new Alt()

const UserActions = alt.generateActions('receivedUser', 'failed')

const UserSource = {
  fetchUser() {
    return {
      remote(state, id, name) {
        return new Promise((resolve, reject) => {
          setTimeout(() => resolve({ id, name }), 10)
        })
      },

      success: UserActions.receivedUser,
      error: UserActions.failed
    }
  }
}

class UserStore {
  static displayName = 'UserStore'

  constructor() {
    this.user = null

    this.exportAsync(UserSource)
    this.bindActions(UserActions)
  }

  receivedUser(user) {
    this.user = user
  }

  failed(e) {
    console.error('Failure', e)
  }
}

const userStore = alt.createStore(UserStore)

const NumberActions = alt.generateActions('receivedNumber', 'failed')

const NumberSource = {
  fetchNumber() {
    return {
      remote(state, id) {
        return new Promise((resolve, reject) => {
          setTimeout(() => resolve(id), 5)
        })
      },

      success: NumberActions.receivedNumber,
      error: NumberActions.failed
    }
  }
}

class NumberStore {
  static displayName = 'NumberStore'

  constructor() {
    this.n = []
    this.exportAsync(NumberSource)
    this.bindActions(NumberActions)
  }

  receivedNumber(n) {
    this.n = n
  }

  failed(e) {
    console.error(e)
  }
}

const numberStore = alt.createStore(NumberStore)

@Render.withData((props) => {
  return Promise.all([
    userStore.fetchUser(props.id, props.name),
    numberStore.fetchNumber(props.id)
  ])
})
class User extends React.Component {
  render() {
    return (
      <div>
        <AltContainer
          store={userStore}
          render={(props) => {
            return (
              <div>
                <h1>{props.user.name}</h1>
                <span>{props.user.id}</span>
              </div>
            )
          }}
        />
        <AltContainer
          store={numberStore}
          render={(props) => {
            return <span>{props.n}</span>
          }}
        />
      </div>
    )
  }
}

class App extends React.Component {
  render() {
    return <User id={this.props.id} name={this.props.name} />
  }
}

export default {
  'Render': {
    'preparing some components'(done) {
      Render.prepare(App, { id: 0, name: 'Z' }).then((Element) => {
        assert.ok(React.isValidElement(Element))
        done()
      })
    },
  }
}
