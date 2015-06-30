import React from 'react'
import Alt from '../'
import connectToStores from '../utils/connectToStores'
import Render from '../utils/Render'
import { assert } from 'chai'
import { jsdom } from 'jsdom'
import sinon from 'sinon'

const alt = new Alt()

const actions = alt.generateActions('yes', 'no')

const Source = {
  doThing: {
    remote() {
      return Promise.resolve('ok')
    },
    success: actions.yes,
    error: actions.no
  }
}

const Store = alt.createStore(function () {
  this.exportAsync(Source)
}, 'Store')

@Render.resolve((props) => {
  return Store.doThing()
})
class App extends React.Component {
  render() {
    return <Child />
  }
}

@Render.resolve((props) => {
  return Store.doThing()
})
class Child extends React.Component {
  render() {
    return <div>Hi</div>
  }
}

export default {
  'Render': {
    'max number of iterations reached'(done) {
      const render = new Render(alt, { maxIterations: 1 })

      render.toStaticMarkup(App, {}).then((result) => {
        assert.instanceOf(result.error, Error)
        assert.match(result.error.message, /number of iterations/)
        done()
      }).catch(e => done(e))
    },

    'render timeout'(done) {
      const render = new Render(alt, { timeout: 1 })

      render.toStaticMarkup(App, {}).then((result) => {
        assert.instanceOf(result.error, Error)
        assert.match(result.error.message, /timed out/)
        done()
      }).catch(e => done(e))
    },

    'a render that just works'(done) {
      const render = new Render(alt)

      render.toStaticMarkup(App, {}).then((result) => {
        assert.isNull(result.error)
        assert.match(result.html, /Hi/)
        done()
      }).catch(e => done(e))
    },
  },

  'Render Browser': {
    beforeEach() {
      global.document = jsdom('<!doctype html><html><body></body></html>')
      global.window = global.document.parentWindow
      global.navigator = global.window.navigator

      alt.recycle()

    },
    afterEach() {
      delete global.document
      delete global.window
      delete global.navigator
    },

    'rendering to dom'(done) {
      const alt = new Alt()

      const actions = alt.generateActions('yes', 'no')

      const resolveSpy = sinon.spy()
      const renderSpy = sinon.spy()
      const successSpy = sinon.spy()

      const Source = {
        checkOneTwo: {
          remote() {
            return Promise.resolve('ok')
          },
          success: actions.yes,
          error: actions.no
        }
      }

      const Store = alt.createStore(function () {
        this.exportAsync(Source)
        this.bindAction(actions.yes, successSpy)
      }, 'Store')

      @Render.resolve((props) => {
        resolveSpy()
        return Store.checkOneTwo()
      })
      class App extends React.Component {
        render() {
          renderSpy()
          return <div>Hello</div>
        }
      }

      new Render(alt).toDOM(App, {}, document.body).then(() => {
        assert.ok(resolveSpy.calledOnce, 'the resolver')
      })

      const unlisten = Store.listen(() => {
        assert.ok(successSpy.calledOnce, 'action success')
        unlisten()
        // TODO catch errors here...
        done()
      })
    },
  }
}
