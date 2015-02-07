require('6to5/runtime')

var Alt = require('../dist/alt-with-runtime')
var assert = require('assert')

var alt = new Alt()

class MyActions {
  constructor() {
    this.generateActions(
      'callInternalMethod',
      'shortHandBinary',
      'getInstanceInside',
      'dontEmit',
      'moreActions2',
      'moreActions3',
      'resetRecycled'
    )
    this.generateActions('anotherAction')
  }

  updateName(name) {
    this.dispatch(name)
  }

  justTestingInternalActions() {
    return {
      updateThree: this.actions.updateThree,
      updateName: this.actions.updateName
    }
  }

  moreActions() {
    this.dispatch(1)
    this.actions.moreActions2.defer(2)
    this.actions.moreActions3.defer(3)
  }

  updateTwo(a, b) {
    this.dispatch({ a, b })
  }

  updateThree(a, b, c) {
    this.dispatch({ a, b, c })
  }
}

var myActions = {}
alt.createActions(MyActions, myActions)

class MyStore {
  constructor() {
    this.bindAction(myActions.updateName, this.onUpdateName)
    this.bindAction(myActions.CALL_INTERNAL_METHOD, this.doCallInternal)
    this.bindAction(myActions.dontEmit, this.dontEmitEvent)
    this.name = 'first'
    this.calledInternal = false
    this.dontEmitEventCalled = false

    this._dispatcher = this.dispatcher
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

  dontEmitEvent() {
    this.dontEmitEventCalled = true
    return false
  }

  static externalMethod() {
    return true
  }
}

var myStore = alt.createStore(MyStore)

class SecondStore {
  constructor() {
    this.foo = 'bar'
    this.name = myStore.getState().name
    this.instance = null

    this.deferrals = 0

    this.recycled = false

    this.bindActions(myActions)

    this.on('init', () => {
      this.recycled = true
    })
  }

  onResetRecycled() {
    this.recycled = false
  }

  onUpdateTwo(x) {
    this.foo = x.a + x.b
  }

  updateThree(x) {
    this.waitFor([myStore.dispatchToken])
    this.name = myStore.getState().name
    this.foo = x.a + x.b + x.c
  }

  shortHandBinary(arr) {
    this.foo = arr
  }

  onUpdateName() {
    this.waitFor(myStore.dispatchToken)
    this.name = myStore.getState().name
  }

  onGetInstanceInside() {
    this.instance = this.getInstance()
  }

  onMoreActions(x) {
    this.deferrals = x
  }

  onMoreActions2(x) {
    this.deferrals = x
  }

  onMoreActions3(x) {
    this.deferrals = x
  }

  static externalMethod() {
    return this.getState().foo
  }

  static concatFooWith(x) {
    return this.getState().foo + x
  }
}

var secondStore = alt.createStore(SecondStore, 'AltSecondStore')

class LifeCycleStore {
  constructor() {
    this.bootstrapped = false
    this.init = false
    this.rollback = false
    this.snapshotted = false

    this.on('init', () => {
      this.init = true
    })
    this.on('bootstrap', () => {
      this.bootstrapped = true
    })
    this.on('snapshot', () => {
      this.snapshotted = true
    })
    this.on('rollback', () => {
      this.rollback = true
    })
  }
}

var lifecycleStore = alt.createStore(LifeCycleStore)

// Alt instances...

class AltInstance extends Alt {
  constructor() {
    super()
    this.addActions('myActions', MyActions)
    this.addStore('myStore', MyStore)
  }
}

var altInstance = new AltInstance()


// Really confusing set of instances
var alt1 = new Alt()
var alt2 = new Alt()

function NameActions() { }
NameActions.prototype.updateName = function (name) {
  this.dispatch(name)
}

var nameActions1 = alt1.createActions(NameActions)
var nameActions2 = alt2.createActions(NameActions)

function NameStore() {
  // It's ok to bind whatever actions since Symbol.for maintains
  // a global registry. As long as the methods called in nameActions2 are defined
  // in nameActions1 so the constants are created.
  this.bindActions(nameActions1)
  this.name = 'foo'
}

NameStore.prototype.onUpdateName = function (name) {
  this.name = name
}

var nameStore1 = alt1.createStore(NameStore)
var nameStore2 = alt2.createStore(NameStore)


/* istanbul ignore next */
module.exports = {
  beforeEach() {
    alt.recycle()
    altInstance.recycle()
    alt1.recycle()
    alt2.recycle()
  },

  'alt instance'() {
    assert.equal(typeof alt.bootstrap, 'function', 'bootstrap function exists')
    assert.equal(typeof alt.dispatcher, 'object', 'dispatcher exists')
    assert.equal(typeof alt.dispatcher.register, 'function', 'dispatcher function exists for listening to all events')
    assert.equal(typeof alt.takeSnapshot, 'function', 'snapshot function exists for saving app state')
    assert.equal(typeof alt.createActions, 'function', 'createActions function')
    assert.equal(typeof alt.createStore, 'function', 'createStore function')

    assert.equal(typeof alt.stores.AltSecondStore, 'object', 'store exists in alt.stores')
  },

  'store methods'() {
    var storePrototype = Object.getPrototypeOf(myStore)
    var assertMethods = ['constructor', 'emitChange', 'listen', 'unlisten', 'getState']
    assert.deepEqual(Object.getOwnPropertyNames(storePrototype), assertMethods, 'methods exist for store')
    assert.equal(typeof myStore.addListener, 'undefined', 'event emitter methods not present')
    assert.equal(typeof myStore.removeListener, 'undefined', 'event emitter methods not present')
    assert.equal(typeof myStore.emit, 'undefined', 'event emitter methods not present')
  },

  'store external methods'() {
    assert.equal(typeof myStore.externalMethod, 'function', 'static methods are made available')
    assert.equal(myStore.externalMethod(), true, 'static methods return proper result')
    assert.equal(typeof secondStore.externalMethod, 'function', 'static methods are made available')
    assert.equal(secondStore.externalMethod(), 'bar', 'static methods have `this` bound to the instance')
    assert.equal(secondStore.concatFooWith('baz'), 'barbaz', 'static methods may be called with params too')
  },

  'getting state'() {
    assert.equal(typeof myStore.getState()._dispatcher, 'object', 'the dispatcher is exposed internally')

    assert.equal(lifecycleStore.getState().bootstrapped, false, 'bootstrap has not been called yet')
    assert.equal(lifecycleStore.getState().snapshotted, false, 'takeSnapshot has not been called yet')
    assert.equal(lifecycleStore.getState().rollback, false, 'rollback has not been called')
    assert.equal(lifecycleStore.getState().init, true, 'init gets called when store initializes')
  },

  'snapshots and bootstrapping'() {
    var initialSnapshot = alt.takeSnapshot()
    assert.equal(lifecycleStore.getState().snapshotted, true, 'takeSnapshot was called and the life cycle event was triggered')

    var bootstrapReturnValue = alt.bootstrap(initialSnapshot)
    assert.equal(bootstrapReturnValue, undefined, 'bootstrap returns nothing')
    assert.equal(lifecycleStore.getState().bootstrapped, true, 'bootstrap was called and the life cycle event was triggered')
  },

  'existence of actions'() {
    assert.equal(typeof myActions.anotherAction, 'function', 'shorthand function created with createAction exists')
    assert.equal(typeof myActions.callInternalMethod, 'function', 'shorthand function created with createActions exists')
    assert.equal(myActions.callInternalMethod.length, 1, 'shorthand function is an id function')
    assert.equal(typeof myActions.updateName, 'function', 'prototype defined actions exist')
    assert.equal(typeof myActions.updateTwo, 'function', 'prototype defined actions exist')
    assert.equal(typeof myActions.updateThree, 'function', 'prototype defined actions exist')
    assert.equal(myActions.updateTwo.length, 2, 'actions can have > 1 arity')
  },

  'existence of constants'() {
    assert.notEqual(typeof myActions.UPDATE_NAME, 'undefined', 'a constant is created for each action')
    assert.notEqual(typeof myActions.UPDATE_TWO, 'undefined', 'a constant is created for each action')
    assert.notEqual(typeof myActions.CALL_INTERNAL_METHOD, 'undefined', 'a constant is created for each action')
  },

  'helper functions'() {
    assert.equal(typeof myActions.updateName.defer, 'function', 'actions have a defer method for async flow')
  },

  'internal actions'() {
    var internalActions = myActions.justTestingInternalActions()
    assert.equal(typeof internalActions.updateThree, 'function', 'actions (below) are available internally through this.actions')
    assert.equal(typeof internalActions.updateName, 'function', 'actions (above) are available internally through this.actions')
    assert.equal(typeof internalActions.updateName.defer, 'function', 'making sure internal actions has a defer as well')
    assert.equal(typeof internalActions.updateThree.defer, 'function', 'making sure internal actions has a defer as well')

    assert.equal(typeof myStore.getState, 'function', 'the store has a getState method exposed')
    assert.equal(typeof myStore.internalOnly, 'undefined', 'internal only method isnt available')

    assert.equal(myStore.getState().name, 'first', 'store has been initialized properly')
    assert.equal(myStore.getState().calledInternal, false, 'store has been initialized properly')
  },

  'calling actions'() {
    var actionReturnType = myActions.updateName('bear')
    assert.equal(actionReturnType, undefined, 'action returns nothing')

    assert.equal(myStore.getState().name, 'bear', 'action was called, state was updated properly')
    assert.equal(myStore.getState().calledInternal, false, 'internal method has not been called')
    assert.equal(secondStore.getState().name, 'bear', 'second store gets its value from myStore')
  },

  'calling internal methods'() {
    myActions.callInternalMethod()
    assert.equal(myStore.getState().calledInternal, true, 'internal method has been called successfully by an action')
  },

  'snapshotting'() {
    myActions.updateName('bear')
    var snapshot = alt.takeSnapshot()
    assert.equal(typeof snapshot, 'string', 'a snapshot json is returned')
    assert.equal(JSON.parse(snapshot).MyStore.name, 'bear', 'the state is current')
    assert.equal(typeof JSON.parse(snapshot).AltSecondStore, 'object', 'the custom identifier name works')

    myActions.updateName('blossom')
    assert.equal(myStore.getState().name, 'blossom', 'action was called, state was updated properly')
    assert.equal(JSON.parse(snapshot).MyStore.name, 'bear', 'the snapshot is not affected by action')
  },

  'mutation'() {
    var state = myStore.getState()
    state.name = 'foobar'
    assert.equal(state.name, 'foobar', 'mutated returned state')
    assert.equal(myStore.getState().name, 'first', 'store state was not mutated')
  },

  'rolling back'() {
    var rollbackValue = alt.rollback()
    assert.equal(rollbackValue, undefined, 'rollback returns nothing')

    assert.equal(myStore.getState().name, 'bear', 'state has been rolledback to last snapshot')
    assert.equal(lifecycleStore.getState().rollback, true, 'rollback lifecycle method was called')
  },

  'store listening'() {
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
  },

  'bootstrapping'() {
    alt.bootstrap('{"MyStore":{"name":"bee"}}')
    assert.equal(myStore.getState().name, 'bee', 'on server I can bootstrap many times')

    try {
      // simulate the browser
      global.window = {};

      alt.bootstrap('{}')
      // Attempting to bootstrap more than once
      alt.bootstrap('{"MyStore":{"name":"bee"}}')

      assert.equal(true, false, 'I was able bootstrap more than once which is bad')
    } catch (e) {
      assert.equal(e instanceof ReferenceError, true, 'can only bootstrap once')
      assert.equal(e.message, 'Stores have already been bootstrapped', 'can only bootstrap once')
    }
  },

  'variadic actions'() {
    myActions.updateTwo(4, 2)
    assert.equal(secondStore.getState().foo, 6, 'im able to pass two params into an action')

    myActions.updateThree(4, 2, 1)
    assert.equal(secondStore.getState().foo, 7, 'the store method updateThree works')

    myActions.shortHandBinary(1, 0)
    assert.equal(Array.isArray(secondStore.getState().foo), true, 'shorthand for multiple elements pass through goes as array')
    assert.equal(secondStore.getState().foo[0], 1, 'shorthand for multiple elements pass through goes as array')
    assert.equal(secondStore.getState().foo[1], 0, 'shorthand for multiple elements pass through goes as array')
  },

  'access of stores'() {
    assert.equal(secondStore.foo, undefined, 'cant access state properties that live inside store')
    assert.equal(secondStore.bindAction, undefined, 'cant access action listeners from outside store')
    assert.equal(secondStore.bindActions, undefined, 'cant access action listeners from outside store')
  },

  'deferral of actions'(done) {
    myActions.updateName('gerenuk')
    assert.equal(myStore.getState().name, 'gerenuk', 'store state was updated properly')
    myActions.updateName.defer('marmot')
    assert.equal(myStore.getState().name, 'gerenuk', 'store state has same name (for now)')
    setTimeout(() => {
      assert.equal(myStore.getState().name, 'marmot', 'store state was updated with defer')
      done()
    })
  },

  'getting instance'() {
    assert.equal(typeof myActions.getInstanceInside, 'function', 'action for getting the instance inside')
    assert.equal(secondStore.getState().instance, null, 'instance is null because it has not been set')
    myActions.getInstanceInside()
    assert.equal(typeof secondStore.getState().instance, 'object', 'instance has been now set')
    assert.equal(typeof secondStore.getState().instance.getState, 'function', 'instance is a pointer to secondStore')
    assert.equal(typeof secondStore.getState().instance.externalMethod, 'function', 'instance has the static methods available')
    assert.deepEqual(secondStore.getState().instance.externalMethod(), 'bar', 'calling a static method from instance and able to use this inside')
  },

  'conflicting listeners on a store'() {
    try {
      alt.createStore(class StoreWithManyListeners {
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

      alt.createStore(class InnocentStore extends EvilStore {
        constructor() {
          this.bindActions(myActions)
        }

        onUpdateName() { }
      })
      assert.equal(true, false, 'an evil store was able to overload the innocent store\'s action handler')
    } catch (e) {
      assert.equal(e.message, 'You have multiple action handlers bound to an action: updateName and onUpdateName', 'error message is correct')
    }
  },

  'registering invalid action handlers'() {
    try {
      class StoreWithInvalidActionHandlers {
        constructor() {
          this.bindAction(myActions.THIS_DOES_NOT_EXIST, this.trololol)
        }

        trololol() { }
      }

      alt.createStore(StoreWithInvalidActionHandlers)

      assert.equal(true, false, 'i was able to bind an undefined action handler')
    } catch (e) {
      assert.equal(e.message, 'Invalid action reference passed in', 'proper error message for undefined action')
    }

    try {
      class StoreWithInvalidActionHandlers2 {
        constructor() {
          this.bindAction(myActions.UPDATE_NAME, this.invisibleFunction)
        }
      }

      alt.createStore(StoreWithInvalidActionHandlers2)

      assert.equal(true, false, 'i was able to bind an action handler to undefined')
    } catch (e) {
      assert.equal(e.message, 'bindAction expects a function', 'proper error message for undefined action')
    }
  },

  'waiting for nothing'() {
    try {
      class WaitPlease {
        constructor() {
          this.generateActions('pleaseWait')
        }
      }
      var waiter = alt.createActions(WaitPlease)

      class WaitsForNobody {
        constructor() {
          this.bindActions(waiter)
        }

        pleaseWait() {
          this.waitFor()
        }
      }
      alt.createStore(WaitsForNobody)

      waiter.pleaseWait()

      assert.equal(true, false, 'i was able to waitFor nothing')
    } catch (e) {
      assert.equal(e.message, 'Dispatch tokens not provided', 'must provide dispatch tokens')
    }
  },

  'unary action warnings'() {
    try {
      class MethodsAreUnary1 {
        constructor() {
          this.bindActions(myActions)
        }

        onUpdateName(name1, name2) { }
      }

      alt.createStore(MethodsAreUnary1)
      assert.equal(true, false, 'i bound a method with two args successfully using bindActions')
    } catch (e) {
      assert.equal(e instanceof TypeError, true, 'A TypeError was thrown, you cant bind two args with bindActions')
    }

    try {
      class MethodsAreUnary2 {
        constructor() {
          this.bindAction(myActions.UPDATE_TWO, this.onUpdateName)
        }

        onUpdateName(name1, name2) { }
      }

      alt.createStore(MethodsAreUnary2)
      assert.equal(true, false, 'i bound a method with two args successfully using bindAction')
    } catch (e) {
      assert.equal(e instanceof TypeError, true, 'A TypeError was thrown, you cant bind two args with bindAction')
    }
  },

  'cancelling emit'() {
    function eventEmittedFail() {
      assert.equal(true, false, 'event was emitted but I did not want it to be')
    }
    myStore.listen(eventEmittedFail)
    myActions.dontEmit()
    myStore.unlisten(eventEmittedFail)
    assert.equal(myStore.getState().dontEmitEventCalled, true, 'dont emit event was called successfully and event was not emitted')
  },

  'stores with colliding names'() {
    try {
      var MyStore = (function () {
        return function MyStore() { }
      }())
      alt.createStore(MyStore)
      assert.equal(true, false, 'I was able to create a store with the same name')
    } catch (e) {
      assert.equal(e instanceof ReferenceError, true, 'error was thrown for store with same name')
    }

    try {
      var mystore = (function () {
        return function mystore() { }
      }())
      alt.createStore(mystore, 'MyStore')
      assert.equal(true, false, 'I was able to create a store with the same name by passing in an identifier')
    } catch (e) {
      assert.equal(e instanceof ReferenceError, true, 'error was thrown for store with same name')
    }
  },

  'multiple deferrals'(done) {
    myActions.moreActions()
    assert.equal(secondStore.getState().deferrals, 1, 'deferrals is initially set to 1')
    setTimeout(() => {
      assert.equal(secondStore.getState().deferrals, 3, 'but deferrals ends up being set to 3 after all actions complete')
      done()
    })
  },

  'recycling'() {
    alt.recycle()
    assert.equal(myStore.getState().name, 'first', 'recycle sets the state back to its origin')

    myActions.resetRecycled()
    assert.equal(secondStore.getState().recycled, false, 'recycle var was reset due to action')
    alt.recycle()
    assert.equal(secondStore.getState().recycled, true, 'init lifecycle method was called by recycling')
  },

  'flushing'() {
    myActions.updateName('goat')
    var flushed = JSON.parse(alt.flush())
    assert.equal(myStore.getState().name, 'first', 'flush is a lot like recycle')
    assert.equal(flushed.MyStore.name, 'goat', 'except that flush returns the state before recycling')

    myActions.updateName('butterfly')
    assert.equal(myStore.getState().name, 'butterfly', 'I can update the state again after a flush')
    assert.equal(secondStore.getState().name, 'butterfly', 'I can update the state again after a flush')
  },

  'recycling single store'() {
    myActions.updateName('butterfly')
    alt.recycle('MyStore')
    assert.equal(myStore.getState().name, 'first', 'I can recycle specific stores')
    assert.equal(secondStore.getState().name, 'butterfly', 'and other stores will not be recycled')
  },

  'recycling invalid stores'() {
    try {
      alt.recycle('StoreThatDoesNotExist')
      assert.equal(true, false, 'I was able to recycle a store that does not exist')
    } catch (e) {
      assert.equal(e instanceof ReferenceError, true, 'store that does not exist throws a RefenceError')
      assert.equal(e.message, 'StoreThatDoesNotExist is not a valid store')
    }
  },

  'alt single instances'() {
    assert.equal(altInstance instanceof Alt, true, 'altInstance is an instance of alt')
    assert.equal(typeof altInstance.dispatcher, 'object', 'it has a dispatcher')
    assert.equal(typeof altInstance.bootstrap, 'function', 'bootstrap function exists')
    assert.equal(typeof altInstance.createActions, 'function', 'createActions function')
    assert.equal(typeof altInstance.createStore, 'function', 'createStore function')

    var myActionsFromInst = altInstance.getActions('myActions')
    assert.equal(typeof myActionsFromInst, 'object', 'the actions exist')

    var myActionsFail = altInstance.getActions('ActionsThatDontExist')
    assert.equal(typeof myActionsFail, 'undefined', 'undefined actions')

    myActionsFromInst.updateName('lion')
    assert.equal(altInstance.getStore('myStore').getState().name, 'lion', 'state was updated')
    assert.equal(myStore.getState().name, 'first', 'and other singleton store was not affected')
  },

  'multiple alt instances'() {
    nameActions1.updateName('bar')
    nameActions2.updateName('baz')

    assert.equal(nameStore1.getState().name, 'bar', 'store 1 state is set')
    assert.equal(nameStore2.getState().name, 'baz', 'this store has different state')
    assert.equal(altInstance.getStore('myStore').getState().name, 'first', 'other stores not affected')
    assert.equal(myStore.getState().name, 'first', 'other singleton store not affected')
  }
}
