import Alt from '../dist/alt-with-runtime'
import assert from 'assert'

import ListenerMixin from '../mixins/ListenerMixin'
import FluxyMixin from '../mixins/FluxyMixin'
import ReactStateMagicMixin from '../mixins/ReactStateMagicMixin'
import IsomorphicMixin from '../mixins/IsomorphicMixin'

import ReactComponent from './helpers/ReactComponent'

let alt = new Alt()

class MyActions {
  constructor() {
    this.generateActions(
      'callInternalMethod',
      'shortHandBinary',
      'getInstanceInside',
      'dontEmit',
      'moreActions2',
      'moreActions3',
      'resetRecycled',
      'asyncStoreAction'
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

let myActions = {}
alt.createActions(MyActions, myActions)

let myShorthandActions = alt.generateActions("actionOne", "actionTwo")

class MyStore {
  constructor() {
    let myActionsInst = this.alt.getActions('myActions')
    if (myActionsInst) {
      this.bindAction(myActionsInst.updateName, this.onUpdateName)
    }

    this.bindAction(myActions.updateName, this.onUpdateName)
    this.bindAction(myActions.CALL_INTERNAL_METHOD, this.doCallInternal)
    this.bindAction(myActions.dontEmit, this.dontEmitEvent)
    this.bindAction(myActions.asyncStoreAction, this.doStoreAsync)
    this.name = 'first'
    this.calledInternal = false
    this.dontEmitEventCalled = false
    this.async = false

    this._dispatcher = this.dispatcher
  }

  doStoreAsync() {
    setTimeout(() => {
      this.async = true
      this.getInstance().emitChange()
    })
    return false
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

let myStore = alt.createStore(MyStore)

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

let secondStore = alt.createStore(SecondStore, 'AltSecondStore')

class LifeCycleStore {
  constructor() {
    this.bootstrapped = false
    this.init = false
    this.rollback = false
    this.snapshotted = false

    this.bindListeners({
      test: myActions.updateName,
      test2: [myActions.updateName, myActions.updateTwo],
      test3: myActions.updateName
    })

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

  test() { }
  test2() { }
  test3() { }
}

let lifecycleStore = alt.createStore(LifeCycleStore)

class ThirdStore {
  constructor() {
    this.bindAction(myActions.updateName, this.onUpdateName)
  }

  onUpdateName() {
    this.waitFor(myStore, secondStore) // Not referencing dispatchToken!
    this.name = secondStore.getState().name + '3'
  }
}

let thirdStore = alt.createStore(ThirdStore)

// Alt instances...

class AltInstance extends Alt {
  constructor() {
    super()
    this.addActions('myActions', MyActions)
    this.addStore('myStore', MyStore)
  }
}

let altInstance = new AltInstance()


// Really confusing set of instances
let alt1 = new Alt()
let alt2 = new Alt()

function NameActions() { }
NameActions.prototype.updateName = function (name) {
  this.dispatch(name)
}

let nameActions1 = alt1.createActions(NameActions)
let nameActions2 = alt2.createActions(NameActions)

function NameStore() {
  this.bindActions(nameActions1)
  this.bindActions(nameActions2)
  this.name = 'foo'
}

NameStore.prototype.onUpdateName = function (name) {
  this.name = name
}

let nameStore1 = alt1.createStore(NameStore)
let nameStore2 = alt2.createStore(NameStore)

const consoleWarn = console.warn.bind(console)

/* istanbul ignore next */
let tests = {
  beforeEach() {
    alt.recycle()
    altInstance.recycle()
    alt1.recycle()
    alt2.recycle()
    console.warn = consoleWarn
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
    let storePrototype = Object.getPrototypeOf(myStore)
    let assertMethods = ['constructor', 'getEventEmitter', 'emitChange', 'listen', 'unlisten', 'getState']
    assert.deepEqual(Object.getOwnPropertyNames(storePrototype), assertMethods, 'methods exist for store')
    assert.equal(typeof myStore.addListener, 'undefined', 'event emitter methods not present')
    assert.equal(typeof myStore.removeListener, 'undefined', 'event emitter methods not present')
    assert.equal(typeof myStore.emit, 'undefined', 'event emitter methods not present')
  },

  'store name extraction'() {
    let hiddenName = "hiddenName"
    // IIFE is needed since babel will take the variable name as a function name
    let storeModelWithoutName = (function() { return function () {} })()

    // When no name can be found, the store will have the name ''
    let storeWithoutName = alt.createStore(storeModelWithoutName)
    assert.notEqual(alt.stores[''], undefined)

    // override toString so that a name can be extracted by using the source
    // of the function
    storeModelWithoutName.toString = function() {
      return "function " + hiddenName + "() {}"
    }

    let storeWithHiddenName = alt.createStore(storeModelWithoutName)
    assert.notEqual(alt.stores[hiddenName], undefined)
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
    let initialSnapshot = alt.takeSnapshot()
    assert.equal(lifecycleStore.getState().snapshotted, true, 'takeSnapshot was called and the life cycle event was triggered')

    let bootstrapReturnValue = alt.bootstrap(initialSnapshot)
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
    assert.equal(typeof myShorthandActions.actionOne, 'function', 'action created with shorthand createActions exists')
    assert.equal(typeof myShorthandActions.actionTwo, 'function', 'other action created with shorthand createActions exists')
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
    let internalActions = myActions.justTestingInternalActions()
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
    let actionReturnType = myActions.updateName('bear')
    assert.equal(actionReturnType, undefined, 'action returns nothing')

    assert.equal(myStore.getState().name, 'bear', 'action was called, state was updated properly')
    assert.equal(myStore.getState().calledInternal, false, 'internal method has not been called')
    assert.equal(secondStore.getState().name, 'bear', 'second store gets its value from myStore')
    assert.equal(thirdStore.getState().name, 'bear3', 'third store gets its value from secondStore, adds 3')
  },

  'calling internal methods'() {
    myActions.callInternalMethod()
    assert.equal(myStore.getState().calledInternal, true, 'internal method has been called successfully by an action')
  },

  'snapshotting'() {
    myActions.updateName('bear')
    let snapshot = alt.takeSnapshot()
    assert.equal(typeof snapshot, 'string', 'a snapshot json is returned')
    assert.equal(JSON.parse(snapshot).MyStore.name, 'bear', 'the state is current')
    assert.equal(typeof JSON.parse(snapshot).AltSecondStore, 'object', 'the custom identifier name works')

    myActions.updateName('blossom')
    assert.equal(myStore.getState().name, 'blossom', 'action was called, state was updated properly')
    assert.equal(JSON.parse(snapshot).MyStore.name, 'bear', 'the snapshot is not affected by action')
  },

  'mutation'() {
    let state = myStore.getState()
    state.name = 'foobar'
    assert.equal(state.name, 'foobar', 'mutated returned state')
    assert.equal(myStore.getState().name, 'first', 'store state was not mutated')
  },

  'rolling back'() {
    let rollbackValue = alt.rollback()
    assert.equal(rollbackValue, undefined, 'rollback returns nothing')

    assert.equal(myStore.getState().name, 'bear', 'state has been rolledback to last snapshot')
    assert.equal(lifecycleStore.getState().rollback, true, 'rollback lifecycle method was called')
  },

  'store listening'() {
    let mooseChecker = (x) => {
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
    assert.equal(myStore.getState().name, 'bee', 'I can bootstrap many times')

    alt.bootstrap('{}')

    alt.bootstrap('{"MyStore":{"name":"monkey"}}')
    assert.equal(myStore.getState().name, 'monkey', 'I can bootstrap many times')
  },

  'letiadic actions'(done) {
    myActions.updateTwo(4, 2)
    assert.equal(secondStore.getState().foo, 6, 'im able to pass two params into an action')

    myActions.updateThree(4, 2, 1)
    assert.equal(secondStore.getState().foo, 7, 'the store method updateThree works')

    myActions.shortHandBinary(1, 0)
    assert.equal(Array.isArray(secondStore.getState().foo), true, 'shorthand for multiple elements pass through goes as array')
    assert.equal(secondStore.getState().foo[0], 1, 'shorthand for multiple elements pass through goes as array')
    assert.equal(secondStore.getState().foo[1], 0, 'shorthand for multiple elements pass through goes as array')


    myActions.shortHandBinary.defer(2, 1)
    setTimeout(() => {
      assert.equal(secondStore.getState().foo[0], 2, 'shorthand for defer multiple elements pass through goes as array')
      assert.equal(secondStore.getState().foo[1], 1, 'shorthand for defer multiple elements pass through goes as array')
      done()
    })
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
      if (e.name === 'AssertionError') {
        throw e
      }
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
      if (e.name === 'AssertionError') {
        throw e
      }
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
      if (e.name === 'AssertionError') {
        throw e
      }
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
      if (e.name === 'AssertionError') {
        throw e
      }
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
      let waiter = alt.createActions(WaitPlease)

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
      if (e.name === 'AssertionError') {
        throw e
      }
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
      if (e.name === 'AssertionError') {
        throw e
      }
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
      if (e.name === 'AssertionError') {
        throw e
      }
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
    let called = false
    console.warn = function (x) {
      called = true
      assert.equal(x instanceof ReferenceError, true)
    }

    let MyStore = (function () {
      return function MyStore() { }
    }())
    alt.createStore(MyStore)

    assert.equal(called, true, 'a warning was called')

    assert.equal(typeof alt.stores.MyStore1, 'object', 'a store was still created')
  },

  'colliding names via identifier'() {
    let called = false
    console.warn = function (x) {
      called = true
      assert.equal(x instanceof ReferenceError, true)
    }

    class auniquestore { }
    alt.createStore(auniquestore, 'MyStore')

    assert.equal(called, true, 'a warning was called')

    assert.equal(typeof alt.stores.MyStore1, 'object', 'a store was still created')
  },

  'not providing a store name via anonymous function'() {
    let called = false
    console.warn = function (x) {
      called = true
      assert.equal(x instanceof ReferenceError, true)
    }

    alt.createStore(function () { })

    assert.equal(called, true, 'a warning was called')

    assert.equal(typeof alt.stores[''], 'object', 'a store with no name was still created')
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
    assert.equal(secondStore.getState().recycled, false, 'recycle let was reset due to action')
    alt.recycle()
    assert.equal(secondStore.getState().recycled, true, 'init lifecycle method was called by recycling')
  },

  'flushing'() {
    myActions.updateName('goat')
    let flushed = JSON.parse(alt.flush())
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
      if (e.name === 'AssertionError') {
        throw e
      }
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

    let myActionsFromInst = altInstance.getActions('myActions')
    assert.equal(typeof myActionsFromInst, 'object', 'the actions exist')

    let myActionsFail = altInstance.getActions('ActionsThatDontExist')
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
  },

  'actions with the same name'() {
    let alt = new Alt()

    function UserActions() {
      this.generateActions('update')
    }
    let ua = alt.createActions(UserActions)

    function LinkActions() {
      this.generateActions('update')
    }
    let la = alt.createActions(LinkActions)

    function Store() {
      this.bindAction(ua.UPDATE, this.ua)
      this.bindAction(la.UPDATE, this.la)

      this.a = 0
      this.b = 0
    }

    Store.prototype.ua = function () {
      this.a = 1
    }

    Store.prototype.la = function () {
      this.b = 1
    }

    let store = alt.createStore(Store)

    ua.update()
    la.update()

    let state = store.getState()

    assert.equal(state.a, 1, 'both actions were called')
    assert.equal(state.b, 1, 'both actions were called')
  },

  'actions with the same name and same class name'() {
    let alt = new Alt()

    let ua = (function () {
      function a() { this.generateActions('update') }
      return alt.createActions(a)
    }())

    let la = (function () {
      function a() { this.generateActions('update') }
      return alt.createActions(a)
    }())

    class Store {
      constructor() {
        this.bindAction(ua.UPDATE, this.ua)
        this.bindAction(la.UPDATE, this.la)

        this.a = 0
        this.b = 0
      }

      ua() {
        this.a = 1
      }

      la() {
        this.b = 1
      }
    }

    let store = alt.createStore(Store)

    ua.update()
    la.update()

    let state = store.getState()

    assert.equal(state.a, 1, 'both actions were called')
    assert.equal(state.b, 1, 'both actions were called')
  },

  'dispatching from alt instance'() {
    let inst = new AltInstance()
    let called = false
    let listen = (x) => {
      assert.equal(x.action, inst.getActions('myActions').updateName, 'the action provided is correct')
      assert.equal(x.data, 'yo', 'i can dispatch instances on my own')
      called = true
    }

    let id = inst.dispatcher.register(listen)
    inst.dispatch(inst.getActions('myActions').updateName, 'yo')
    inst.dispatcher.unregister(id)

    assert.equal(called, true, 'listener was called')
  },

  'emit change method works from the store'(done) {
    assert.equal(myStore.getState().async, false, 'store async is false')

    let listener = () => {
      assert.equal(myStore.getState().async, true, 'store async is true')
      myStore.unlisten(listener)
      done()
    }

    myStore.listen(listener)
    myActions.asyncStoreAction()
  },

  'emit change method works with an isolated store'(done) {
    let alt = new Alt()

    function Actions() {
      this.generateActions('test')
    }

    let actions = alt.createActions(Actions)

    class Store {
      constructor() {
        this.bindActions(actions)
        this.test = false
      }

      onTest() {
        setTimeout(() => {
          this.test = true
          this.emitChange()
        })
        return false
      }
    }

    let store = alt.createStore(Store)

    assert.equal(store.getState().test, false, 'test is false')

    let listener = () => {
      assert.equal(store.getState().test, true, 'test is true')
      store.unlisten(listener)
      done()
    }

    store.listen(listener)
    actions.test()
  },

  'extending stores'() {
    let alt = new Alt()

    class Other {
      constructor() {
        this.foo = true
      }

      test() { return true }
    }

    class Store extends Other {
      constructor() {
        super()
        this.bar = true
        this.baz = super.test()
      }
    }

    let store = alt.createStore(Store)

    assert.equal(store.getState().foo, true, 'store inherits properties')
    assert.equal(store.getState().bar, true, 'store properties are available')
    assert.equal(store.getState().baz, true, 'inherited methods can be called')
  },

  'listener mixin'() {
    let handler = () => { }

    // set up
    ListenerMixin.componentWillMount()

    ListenerMixin.listenTo(myStore, handler)

    assert.equal(ListenerMixin.getListeners().length, 1, 'mixin has one handler')

    ListenerMixin.componentWillUnmount()

    assert.equal(ListenerMixin.getListeners().length, 0, 'mixin was unmounted')

    ListenerMixin.listenToMany([myStore, secondStore], handler)

    assert.equal(ListenerMixin.getListeners().length, 2, 'mixin has two handlers')

    // tear it down
    ListenerMixin.componentWillUnmount()

    assert.equal(ListenerMixin.getListeners().length, 0, 'mixin was unmounted')
  },

  'fluxy mixin object pattern'() {
    let called = false

    class FakeComponent extends ReactComponent {
      doFoo(storeState) {
        this.setState({ foo: myStore.getState() })
      }

      doBar(storeState) { }

      render() {
        assert.equal(this.state.foo.name, 'Fluxy (object)', 'render was called with right state')
        called = true
      }
    }

    FakeComponent.mixins = [FluxyMixin]

    FakeComponent.statics = {
      storeListeners: {
        doFoo: myStore,
        doBar: secondStore
      }
    }

    ReactComponent.test(FakeComponent, () => {
      myActions.updateName('Fluxy (object)')
      assert.equal(called, true, 'render was called')
    })
  },

  'fluxy mixin array pattern'() {
    let called = false

    class FakeComponent extends ReactComponent {
      onChange() {
        this.setState({ foo: myStore.getState() })
      }

      render() {
        assert.equal(this.state.foo.name, 'Fluxy (array)', 'render was called with right state')
        called = true
      }
    }

    FakeComponent.mixins = [FluxyMixin]

    FakeComponent.statics = {
      storeListeners: [myStore, secondStore]
    }

    ReactComponent.test(FakeComponent, () => {
      myActions.updateName('Fluxy (array)')
      assert.equal(called, true, 'render was called')
    })
  },

  'fluxy mixin object errors'() {
    class FakeComponent extends ReactComponent { }

    FakeComponent.mixins = [FluxyMixin]

    FakeComponent.statics = {
      storeListeners: {
        doFoo: myStore
      }
    }

    try {
      ReactComponent.test(FakeComponent)
      assert.equal(true, false, 'an error was not called')
    } catch (e) {
      assert.equal(e instanceof ReferenceError, true, 'reference error doFoo is not defined')
    }
  },

  'fluxy mixin array errors'() {
    class FakeComponent extends ReactComponent { }

    FakeComponent.mixins = [FluxyMixin]

    FakeComponent.statics = {
      storeListeners: [myStore]
    }

    try {
      ReactComponent.test(FakeComponent)
      assert.equal(true, false, 'an error was not called')
    } catch (e) {
      assert.equal(e instanceof ReferenceError, true, 'reference error onChange is not defined')
    }
  },

  'isomorphic mixin error'() {
    class FakeComponent extends ReactComponent { }
    FakeComponent.mixins = [IsomorphicMixin.create(new Alt())]

    try {
      ReactComponent.test(FakeComponent)
      assert.equal(true, false, 'I did not pass the correct props')
    } catch (e) {
      assert.equal(e instanceof ReferenceError, true, 'altStores was not provided')
    }
  },

  'isomorphic mixin'() {
    class FakeComponent extends ReactComponent {
      getDefaultProps() {
        return {
          altStores: {}
        }
      }
    }
    FakeComponent.mixins = [IsomorphicMixin.create(new Alt())]

    ReactComponent.test(FakeComponent, null)
  },

  'the magical mixin'() {
    let called = false

    let renderCalls = 1

    class FakeComponent extends ReactComponent {
      render() {
        if (renderCalls === 1) {
          assert.equal(this.state.my.name, 'Magic', 'myStore state was updated properly')
        }

        if (renderCalls === 2) {
          assert.equal(this.state.sc.name, 'Magic', 'secondStore state was updated properly')
        }

        called = true
        renderCalls += 1
      }
    }

    FakeComponent.mixins = [ReactStateMagicMixin]
    FakeComponent.statics = {
      registerStores: {
        my: myStore,
        sc: secondStore
      }
    }

    ReactComponent.test(FakeComponent, () => {
      myActions.updateName('Magic')
      assert.equal(called, true, 'render was called')
      assert.equal(renderCalls - 1, 2, 'render was called twice')
    })
  },

  'the magical mixin single'() {
    let called = false

    class FakeComponent extends ReactComponent {
      render() {
        assert.equal(this.state.name, 'Single magic', 'myStore state was updated properly')
        called = true
      }
    }

    FakeComponent.mixins = [ReactStateMagicMixin]
    FakeComponent.statics = {
      registerStore: myStore
    }

    ReactComponent.test(FakeComponent, () => {
      myActions.updateName('Single magic')
      assert.equal(called, true, 'render was called')
    })
  },

  'the magical mixin errors'() {
    class FakeComponent extends ReactComponent { }
    FakeComponent.mixins = [ReactStateMagicMixin]
    FakeComponent.statics = {
      registerStores: {},
      registerStore: myStore
    }

    try {
      ReactComponent.test(FakeComponent)
      assert.equal(true, false, 'I was able to use registerStore and registerStores')
    } catch (e) {
      assert.equal(e instanceof ReferenceError, true, 'must pick one')
    }
  },

  'binding a listener that does not exist'() {
    class BadListenerStore {
      constructor() {
        this.bindListeners({
          methodThatDoesNotExist: myActions.updateName
        })
      }
    }

    try {
      alt.createStore(BadListenerStore)
      assert.equal(true, false, 'I was able to bind an unknown method')
    } catch (e) {
      assert.equal(e instanceof ReferenceError, true, 'cannot bind methods that dont exist')
    }
  },

  'binding listeners to action that does not exist'() {
    class BadListenerStore {
      constructor() {
        this.bindListeners({
          foo: myActions.trolololololol
        })
      }

      foo() { }
    }

    try {
      alt.createStore(BadListenerStore)
      assert.equal(true, false, 'I was able to bind an unknown method')
    } catch (e) {
      assert.equal(e instanceof ReferenceError, true, 'invalid action reference passed in')
    }
  },

  'do not include store in snapshots'() {
    function NoBootstrap() { }

    alt.createStore(NoBootstrap, 'NoBootstrap', false)

    let snapshot = JSON.parse(alt.takeSnapshot())

    assert.equal(typeof snapshot.NoBootstrap, 'undefined', 'Store does not exist in snapshots')
    assert.equal(typeof snapshot.AltSecondStore, 'object', 'AltSecondStore exists')
  },

  'actions with no name are still ok'() {
    var actions = alt.createActions(function () {
      this.generateActions('foo')
    })

    assert.equal(typeof actions.foo, 'function', 'action still exists')
  },
}

export default tests
