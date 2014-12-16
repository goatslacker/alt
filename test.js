var Fux = require('./fux')
var assert = require('assert')

var fux = new Fux()

var myActions = fux.createActions(class MyActions {
  constructor() {
    this.callInternalMethod = true
  }

  updateName(name) {
    this.dispatch(name)
  }

  updateTwo(a, b) {
    this.dispatch({ a, b })
  }
})

var myStore = fux.createStore(class MyStore {
  constructor() {
    this.bindAction(myActions.updateName, this.onUpdateName)
    this.bindAction(myActions.CALL_INTERNAL_METHOD, this.doCallInternal)
    this.name = 'first'
    this.calledInternal = false
  }

  onUpdateName(name) {
    this.name = name
  }

  doCallInternal() {
    this.internalOnly()
  }

  internalOnly() {
    this.calledInternal = true
  }
})

var secondStore = fux.createStore(class SecondStore {
  constructor() {
    this.foo = 'bar'
    this.name = myStore.getState().name
    this.bindActions(myActions)
  }

  onUpdateTwo(x) {
    this.foo = x.a + x.b
  }

  onUpdateName() {
    this.waitFor(myStore.dispatchToken)
    this.name = myStore.getState().name
  }
})

!() => {
  assert.equal(typeof fux.bootstrap, 'function', 'bootstrap function exists')
  assert.equal(typeof fux.dispatcher, 'object', 'dispatcher exists')
  assert.equal(typeof fux.dispatcher.register, 'function', 'dispatcher function exists for listening to all events')
  assert.equal(typeof fux.takeSnapshot, 'function', 'snapshot function exists for saving app state')
  assert.equal(typeof fux.createActions, 'function', 'createActions function')
  assert.equal(typeof fux.createStore, 'function', 'createStore function')

  var initialSnapshot = fux.takeSnapshot()
  var bootstrapReturnValue = fux.bootstrap(initialSnapshot)
  assert.equal(bootstrapReturnValue, undefined, 'bootstrap returns nothing')

  assert.equal(typeof myActions.callInternalMethod, 'function', 'shorthand function exists')
  assert.equal(myActions.callInternalMethod.length, 1, 'shorthand function is an id function')
  assert.equal(typeof myActions.updateName, 'function', 'prototype defined actions exist')
  assert.equal(typeof myActions.updateTwo, 'function', 'prototype defined actions exist')
  assert.equal(myActions.updateTwo.length, 2, 'actions can have > 1 arity')

  assert.equal(typeof myActions.UPDATE_NAME, 'object', 'a constant is created for each action')
  assert.equal(typeof myActions.UPDATE_TWO, 'object', 'a constant is created for each action')
  assert.equal(typeof myActions.CALL_INTERNAL_METHOD, 'object', 'a constant is created for each action')

  assert.equal(typeof myActions.updateName.defer, 'function', 'actions have a defer method for async flow')

  assert.equal(typeof myStore.getState, 'function', 'the store has a getState method exposed')
  assert.equal(typeof myStore.internalOnly, 'undefined', 'internal only method isnt available')

  assert.equal(myStore.getState().name, 'first', 'store has been initialized properly')
  assert.equal(myStore.getState().calledInternal, false, 'store has been initialized properly')

  var actionReturnType = myActions.updateName('bear')
  assert.equal(actionReturnType, undefined, 'action returns nothing')

  assert.equal(myStore.getState().name, 'bear', 'action was called, state was updated properly')
  assert.equal(myStore.getState().calledInternal, false, 'internal method has not been called')
  assert.equal(secondStore.getState().name, 'bear', 'second store gets its value from myStore')

  myActions.callInternalMethod()
  assert.equal(myStore.getState().calledInternal, true, 'internal method has been called successfully by an action')

  var snapshot = fux.takeSnapshot()
  assert.equal(typeof snapshot, 'string', 'a snapshot json is returned')
  assert.equal(JSON.parse(snapshot).MyStore.name, 'bear', 'the state is current')

  myActions.updateName('blossom')
  assert.equal(myStore.getState().name, 'blossom', 'action was called, state was updated properly')
  assert.equal(JSON.parse(snapshot).MyStore.name, 'bear', 'the snapshot is not affected by action')

  var state = myStore.getState()
  state.name = 'foobar'
  assert.equal(state.name, 'foobar', 'mutated returned state')
  assert.equal(myStore.getState().name, 'blossom', 'store state was not mutated')

  var rollbackValue = fux.rollback()
  assert.equal(rollbackValue, undefined, 'rollback returns nothing')

  assert.equal(myStore.getState().name, 'bear', 'state has been rolledback to last snapshot')

  var mooseChecker = (x) => {
    assert.equal(x.name, 'moose', 'listener for store works')
    assert.equal(myStore.getState().name, 'moose', 'new store state present')
  }
  myStore.listen(mooseChecker)
  myActions.updateName('moose')

  assert.equal(myStore.getState().name, 'moose', 'new store state present')

  myStore.unlisten(mooseChecker)
  myActions.updateName('badger')

  assert.equal(myStore.getState().name, 'badger', 'new store state present')

  try {
    fux.bootstrap('{"MyStore":{"name":"elk"}}')
    assert.equal(true, false, 'I was able bootstrap more than once which is bad')
  } catch (e) {
    assert.equal(e instanceof ReferenceError, true, 'can only bootstrap once')
    assert.equal(e.message, 'Stores have already been bootstrapped', 'can only bootstrap once')
  }

  assert.equal(myStore.getState().name, 'badger', 'store state still the same')

  myActions.updateTwo(4, 2)
  assert.equal(secondStore.getState().foo, 6, 'im able to pass two params into an action')
}()
