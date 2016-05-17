import Alt from '../'
import { assert } from 'chai'
import sinon from 'sinon'

const alt = new Alt()

function dispatchIdentity(x, ...a) {
  if (x === undefined) return null
  return a.length ? [x].concat(a) : x
}

class Actions {
  generateActions(...actions) {
    actions.forEach(name => this[name] = dispatchIdentity)
  }
}

class MyActions extends Actions {
  constructor() {
    super()
    this.generateActions(
      'updateName',
      'callInternalMethod',
      'shortHandBinary',
      'getInstanceInside',
      'dontEmit',
      'moreActions2',
      'moreActions3',
      'resetRecycled',
      'asyncStoreAction',
      'updateAnotherVal'
    )
    this.generateActions('anotherAction')

    this.actionOnThis = function (x) {
      return x
    }
  }
}

const myActionsInst = Object.assign(new MyActions, {
  justTestingInternalActions() {
    return {
      updateThree: this.updateThree,
      updateName: this.updateName
    }
  },

  moreActions() {
    return (dispatch) => {
      dispatch(1)
      this.moreActions2.defer(2)
      this.moreActions3.defer(3)
    }
  },

  updateTwo(a, b) {
    return { a, b }
  },

  updateThree(a, b, c) {
    return { a, b, c }
  },
})

const myActions = alt.createActions('MyActions', myActionsInst)

const objActions = alt.createActions('', {
  hello() { },
  world() { },
})

const myShorthandActions = alt.generateActions('', ['actionOne', 'actionTwo'])

export default {
  'API'() {
    assert.isFunction(alt.load)
    assert.isFunction(alt.flush)
    assert.isFunction(alt.publish)
    assert.isFunction(alt.subscribe)
    assert.isFunction(alt.save)
    assert.isFunction(alt.createStore)
    assert.isFunction(alt.createActions)
    assert.isFunction(alt.createAsyncActions)
    assert.isFunction(alt.generateActions)
    assert.isFunction(Alt.debug)
    assert.isFunction(Alt.Store)
  },

  'store methods'() {
    const store = alt.createStore('MyStore', new Alt.Store())

    assert.isObject(store)
    assert.isFunction(store.dispatch)
    assert.isFunction(store.getState)
    assert.isFunction(store.destroy)
    assert.isFunction(store.subscribe)

    assert.isUndefined(store.bindActions)
    assert.isUndefined(store.preventDefault)
    assert.isUndefined(store.bindListeners)
  },

  'existence of actions'() {
    assert.isFunction(myActions.anotherAction, 'shorthand function created with createAction exists')
    assert.isFunction(myActions.callInternalMethod, 'shorthand function created with createActions exists')
    assert.isFunction(myActions.updateName, 'prototype defined actions exist')
    assert.isFunction(myActions.updateTwo, 'prototype defined actions exist')
    assert.isFunction(myActions.updateThree, 'prototype defined actions exist')
    assert.isFunction(myShorthandActions.actionOne, 'action created with shorthand createActions exists')
    assert.isFunction(myShorthandActions.actionTwo, 'other action created with shorthand createActions exists')
    assert.isFunction(objActions.hello, 'actions created by obj are functions')
    assert.isFunction(objActions.world, 'actions created by obj are functions')
    assert.isFunction(myActions.actionOnThis, 'actions defined in `this` are functions')
  },
}
