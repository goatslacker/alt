import { jsdom } from 'jsdom'
import React, { Component } from 'react'
import Alt from '../'
import AltContainer from '../AltContainer'
import AltIso from '../utils/AltIso'
import * as Render from '../utils/Render'
import connectToStores from '../utils/connectToStores'
import { assert } from 'chai'

const { TestUtils } = React.addons

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
    console.error('Fail', e)
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
                <h1>{props.user ? props.user.name : ''}</h1>
                <span>{props.user ? props.user.id : 0}</span>
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
  'AltIso browser': {
    afterEach() {
      delete global.document
      delete global.window
    },

    'browser requests'(done) {
      AltIso.render(alt, App, { id: 0, name: 'Z' }).then((obj) => {
        global.document = jsdom(
          `<!doctype html><html><body>${obj.html}</body></html>`
        )
        global.window = global.document.defaultView
      }).then(() => {
        return AltIso.render(alt, App, { id: 0, name: 'Z' })
      }).then((data) => {
        assert(alt.stores.UserStore.getState().user.id === 0)
        assert(alt.stores.UserStore.getState().user.name === 'Z')
        assert.isUndefined(data)

        done()
      }).catch(e => done(e))
    },

    'works with connectToStores'(done) {
      global.document = jsdom('<!doctype html><html><body></body></html>')
      global.window = global.document.defaultView

      const alt = new Alt()

      const actions = alt.generateActions('success', 'fail')

      const DataSource = {
        bananas: {
          remote() {
            return Promise.resolve(2222222)
          },

          success: actions.success,
          error: actions.fail,
        }
      }

      const Store = alt.createStore(function () {
        this.id = 0
        this.registerAsync(DataSource)

        this.bindAction(actions.success, id => this.id = id)
        this.bindAction(actions.fail, err => console.log('STORE FETCH ERROR HANDLER', err))
      }, 'Store')

      const App = Render.withData((props) => {
        return Store.bananas()
      }, connectToStores(class extends Component {
        static getStores() {
          return [Store]
        }

        static getPropsFromStores() {
          return Store.getState()
        }

        render() {
          return <div>{this.props.id}</div>
        }
      }))

      Render.toString(alt, App)
        .then((obj) => {
          assert.isString(obj.html)
          assert.match(obj.html, /2222222/)

          // if you try to render this element you'll have to bootstrap the
          // stores with the state yourself prior to rendering this element.
          assert.ok(React.isValidElement(obj.element))

          done()
        })
        .catch(e => done(e))
    },
  },
}
