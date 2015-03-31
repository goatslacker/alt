import Alt from '../dist/alt-with-runtime'
import Immutable from 'immutable'
import { assert } from 'chai'
import sinon from 'sinon'

const alt = new Alt()

const actions = alt.generateActions('fire')

const assign = require('object-assign')

const store = alt.createStore({
  displayName: 'ImmutableStore',

  state: Immutable.Map({}),

  bindListeners: {
    handleFoo: actions.fire
  },

  lifecycle: {
    init: function () {
      console.log('This console log should fire')
    }
  },

  handleFoo: function (x) {
    this.setState(this.state.set('foo', x))
  }
})

actions.fire('hello')

assert.ok(store.getState().toJS().foo === 'hello')
assert.ok(JSON.parse(alt.takeSnapshot()).ImmutableStore.foo === 'hello')


var wtf = Immutable.Map({})

assert.ok(wtf.toJS().foo === undefined)
