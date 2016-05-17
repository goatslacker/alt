'use strict'

// This one runs in node v4!

const Alt = require('../')
const assert = require('chai').assert
const sinon = require('sinon')

const alt = new Alt()

const fire = alt.createActions('MyActions', {
  fire() {
    return dispatch => dispatch(1)
  }
}).fire

class MyStore extends Alt.Store {
  constructor() {
    super()
    this.state = 0

    this.bindActions({ fire })
  }

  fire(val) {
    this.setState(this.state + val)
  }
}

const store = alt.createStore('MyStore', new MyStore())

module.exports = {
  'basic'() {
    const spy = sinon.spy()
    const sub = store.subscribe(spy)

    assert(store.getState() === 0)

    fire()
    fire()
    fire()
    fire()

    assert(store.getState() === 4)

    const save = alt.save({ MyStore: store })

    assert(JSON.parse(save).MyStore === 4)

    alt.flush()

    assert(store.getState() === 0)

    alt.load({ MyStore: 7 })

    assert(store.getState() === 7)

    assert.isFunction(alt.publish)
    assert.isFunction(alt.subscribe)
    assert.isFunction(alt.serialize)
    assert.isFunction(alt.deserialize)
    assert.isObject(alt.actions)
    assert.isObject(alt.stores)
    assert.isDefined(alt.stores.MyStore)
    assert.isObject(alt.actions.MyActions)
    assert.isFunction(alt.actions.MyActions.fire)

    store.destroy()

    assert(Object.keys(alt.stores).length === 0)
  },
}
