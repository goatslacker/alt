var Fux = require('./dist/fux')
var assert = require('assert')

var fux = new Fux()

class MyActions {
  constructor() {
    this.generateActions('callInternalMethod', 'shortHandBinary')
    this.generateAction('anotherAction')
  }

  updateName(name) {
    this.dispatch(name)
  }

  updateTwo(a, b) {
    this.dispatch({ a, b })
  }

  updateThree(a, b, c) {
    this.dispatch({ a, b, c })
  }
}

var myActions = fux.createActions(MyActions)

class MyStore {
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

  static externalMethod() {
    return true
  }
}

var myStore = fux.createStore(MyStore)

class SecondStore {
  constructor() {
    this.foo = 'bar'
    this.name = myStore.getState().name
    this.bindActions(myActions)
  }

  onUpdateTwo(x) {
    this.foo = x.a + x.b
  }

  updateThree(x) {
    this.foo = x.a + x.b + x.c
  }

  shortHandBinary(arr) {
    this.foo = arr
  }

  onUpdateName() {
    this.waitFor(myStore.dispatchToken)
    this.name = myStore.getState().name
  }

  static externalMethod() {
    return this.getState().foo
  }

  static concatFooWith(x) {
    return this.getState().foo + x
  }
}

var secondStore = fux.createStore(SecondStore)

!() => {
  assert.equal(typeof fux.bootstrap, 'function', 'bootstrap function exists')
  assert.equal(typeof fux.dispatcher, 'object', 'dispatcher exists')
  assert.equal(typeof fux.dispatcher.register, 'function', 'dispatcher function exists for listening to all events')
  assert.equal(typeof fux.takeSnapshot, 'function', 'snapshot function exists for saving app state')
  assert.equal(typeof fux.createActions, 'function', 'createActions function')
  assert.equal(typeof fux.createStore, 'function', 'createStore function')

  var storePrototype = Object.getPrototypeOf(myStore)
  var assertMethods = ['emitChange', 'listen', 'unlisten', 'getState']
  assert.deepEqual(Object.keys(storePrototype), assertMethods, 'methods exist for store')
  assert.equal(typeof myStore.on, 'function', 'event emitter methods')
  assert.equal(typeof myStore.off, 'function', 'event emitter methods')
  assert.equal(typeof myStore.addListener, 'function', 'event emitter methods')
  assert.equal(typeof myStore.removeListener, 'function', 'event emitter methods')
  assert.equal(typeof myStore.once, 'function', 'event emitter methods')
  assert.equal(typeof myStore.emit, 'function', 'event emitter methods')

  assert.equal(typeof myStore.externalMethod, 'function', 'static methods are made available')
  assert.equal(myStore.externalMethod(), true, 'static methods return proper result')
  assert.equal(typeof secondStore.externalMethod, 'function', 'static methods are made available')
  assert.equal(secondStore.externalMethod(), 'bar', 'static methods have `this` bound to the instance')
  assert.equal(secondStore.concatFooWith('baz'), 'barbaz', 'static methods may be called with params too')

  var initialSnapshot = fux.takeSnapshot()
  var bootstrapReturnValue = fux.bootstrap(initialSnapshot)
  assert.equal(bootstrapReturnValue, undefined, 'bootstrap returns nothing')

  assert.equal(typeof myActions.anotherAction, 'function', 'shorthand function created with createAction exists')
  assert.equal(typeof myActions.callInternalMethod, 'function', 'shorthand function created with createActions exists')
  assert.equal(myActions.callInternalMethod.length, 1, 'shorthand function is an id function')
  assert.equal(typeof myActions.updateName, 'function', 'prototype defined actions exist')
  assert.equal(typeof myActions.updateTwo, 'function', 'prototype defined actions exist')
  assert.equal(typeof myActions.updateThree, 'function', 'prototype defined actions exist')
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

  assert.equal(secondStore.foo, undefined, 'cant access state properties that live inside store')
  assert.equal(secondStore.bindAction, undefined, 'cant access action listeners from outside store')
  assert.equal(secondStore.bindActions, undefined, 'cant access action listeners from outside store')

  myActions.updateThree(4, 2, 1)
  assert.equal(secondStore.getState().foo, 7, 'the store method updateThree works')

  myActions.shortHandBinary(1, 0)
  assert.equal(Array.isArray(secondStore.getState().foo), true, 'shorthand for multiple elements pass through goes as array')
  assert.equal(secondStore.getState().foo[0], 1, 'shorthand for multiple elements pass through goes as array')
  assert.equal(secondStore.getState().foo[1], 0, 'shorthand for multiple elements pass through goes as array')

  try {
    fux.createStore(class StoreWithManyListeners {
      constructor() {
        this.bindActions(myActions)
      }

      // listeners with same action
      updateName() { }
      onUpdateName() { }
    })
    assert.equal(true, false, 'a store was able to register with multiple action handlers on the same action')
  } catch (e) {
    assert.equal(e.message, 'You have multiple action handlers bound to an action: updateName and onUpdateName', 'error message is correct')
  }

  try {
    class EvilStore {
      updateName() { }
    }

    fux.createStore(class InnocentStore extends EvilStore {
      constructor() {
        this.bindActions(myActions)
      }

      onUpdateName() { }
    })
    assert.equal(true, false, 'an evil store was able to overload the innocent store\'s action handler')
  } catch (e) {
    assert.equal(e.message, 'You have multiple action handlers bound to an action: updateName and onUpdateName', 'error message is correct')
  }
}()
