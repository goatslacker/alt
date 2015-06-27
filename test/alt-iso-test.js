import React from 'react'
import Alt from '../'
import AltContainer from '../AltContainer'
import AltIso from '../utils/AltIso'
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

@AltIso.define((props) => {
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
  'AltIso': {
    'concurrent server requests are resolved properly'(done) {
      const promises = []
      function test(Component, props) {
        promises.push(AltIso.render(alt, Component, props))
      }

      setTimeout(() => test(App, { id: 111111, name: 'AAAAAA' }), 10)
      setTimeout(() => test(App, { id: 333333, name: 'CCCCCC' }), 20)
      setTimeout(() => test(App, { id: 222222, name: 'BBBBBB' }), 10)
      setTimeout(() => test(App, { id: 444444, name: 'DDDDDD' }), 20)

      setTimeout(() => {
        Promise.all(promises).then((values) => {
          assert.match(values[0].html, /AAAAAA/)
          assert.match(values[0].html, /111111/)

          assert.notMatch(values[0].html, /BBBBBB/)
          assert.notMatch(values[0].html, /222222/)
          assert.notMatch(values[0].html, /CCCCCC/)
          assert.notMatch(values[0].html, /333333/)
          assert.notMatch(values[0].html, /DDDDDD/)
          assert.notMatch(values[0].html, /444444/)

          assert.match(values[1].html, /BBBBBB/)
          assert.match(values[1].html, /222222/)

          assert.notMatch(values[1].html, /AAAAAA/)
          assert.notMatch(values[1].html, /111111/)
          assert.notMatch(values[1].html, /CCCCCC/)
          assert.notMatch(values[1].html, /333333/)
          assert.notMatch(values[1].html, /DDDDDD/)
          assert.notMatch(values[1].html, /444444/)

          assert.match(values[2].html, /CCCCCC/)
          assert.match(values[2].html, /333333/)

          assert.notMatch(values[2].html, /AAAAAA/)
          assert.notMatch(values[2].html, /111111/)
          assert.notMatch(values[2].html, /BBBBBB/)
          assert.notMatch(values[2].html, /222222/)
          assert.notMatch(values[2].html, /DDDDDD/)
          assert.notMatch(values[2].html, /444444/)

          assert.match(values[3].html, /DDDDDD/)
          assert.match(values[3].html, /444444/)

          assert.notMatch(values[3].html, /AAAAAA/)
          assert.notMatch(values[3].html, /111111/)
          assert.notMatch(values[3].html, /BBBBBB/)
          assert.notMatch(values[3].html, /222222/)
          assert.notMatch(values[3].html, /CCCCCC/)
          assert.notMatch(values[3].html, /333333/)

          done()
        }).catch(e => done(e))
      }, 50)
    },

    'not as a decorator'() {
      const User = AltIso.define(() => { }, class extends React.Component { })
      assert.isFunction(User)
    },

    'single fetch call, single request'(done) {
      const User = AltIso.define((props) => {
        return userStore.fetchUser(props.id, props.name)
      }, class extends React.Component {
        render() {
          return (
            <AltContainer
              store={userStore}
              render={props => <span>{props.user.name}</span>}
            />
          )
        }
      })

      AltIso.render(alt, User, { id: 0, name: 'ZZZZZZ' }).then((obj) => {
        assert.match(obj.html, /ZZZZZZ/)
        done()
      }).catch(e => done(e))
    },

    'errors still render the request'() {
      const err = new Error('oops')
      const User = AltIso.define((props) => {
        return Promise.reject(err)
      }, class extends React.Component {
        render() {
          return <span>JUST TESTING</span>
        }
      })

      AltIso.render(alt, User, { id: 0, name: '√∆' }).catch((obj) => {
        assert(obj.err === err)
        assert.match(obj.html, /JUST TESTING/)
        done()
      })
    },
  }
}
