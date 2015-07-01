import Alt from '../'
import { assert } from 'chai'
import sinon from 'sinon'

import ListenerMixin from '../mixins/ListenerMixin'
import FluxyMixin from '../mixins/FluxyMixin'
import ReactStateMagicMixin from '../mixins/ReactStateMagicMixin'
import IsomorphicMixin from '../mixins/IsomorphicMixin'

import ReactComponent from './helpers/ReactComponent'

const alt = new Alt()

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
      'asyncStoreAction',
      'updateAnotherVal'
    )
    this.generateActions('anotherAction')

    this.actionOnThis = function (x) {
      this.dispatch(x)
    }
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

const myActions = {}
alt.createActions(MyActions, myActions)

const objActions = alt.createActions({
  hello() { },
  world() { }
})

const myShorthandActions = alt.generateActions('actionOne', 'actionTwo')

class MyStore {
  constructor() {
    const myActionsInst = this.alt.getActions('myActions')
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

    this.exportPublicMethods({
      externalMethodNoStatic: this.externalMethodNoStatic
    })

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

  externalMethodNoStatic() {
   return true
  }
}

const myStore = alt.createStore(MyStore)

class SecondStore {
  constructor() {
    this.foo = 'bar'
    this.name = myStore.getState().name
    this.instance = null

    this.deferrals = 0

    this.recycled = false

    this.bindActions(myActions)

    this.exportPublicMethods({
      externalMethodNoStatic: this.externalMethodNoStatic,
      concatFooWithNoStatic: this.concatFooWithNoStatic
    })

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

  externalMethodNoStatic() {
    return this.getState().foo
  }

  static concatFooWith(x) {
    return this.getState().foo + x
  }

  concatFooWithNoStatic(x) {
    return this.getState().foo + x
  }
}

const secondStore = alt.createStore(SecondStore, 'AltSecondStore')

class LifeCycleStore {
  static config = {
    onSerialize: (state) => {
      state.serialized = true
      return state
    },
    onDeserialize: (data) => {
      data.deserialized = true
    }
  }

  constructor() {
    this.bootstrapped = false
    this.init = false
    this.rollback = false
    this.snapshotted = false
    this.serialized = false
    this.deserialized = false

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

const lifecycleStore = alt.createStore(LifeCycleStore)

class ThirdStore {
  constructor() {
    this.bindAction(myActions.updateName, this.onUpdateName)
  }

  onUpdateName() {
    this.waitFor(myStore, secondStore) // Not referencing dispatchToken!
    this.name = secondStore.getState().name + '3'
  }
}

const thirdStore = alt.createStore(ThirdStore)

class Model {
  constructor({x, y}) {
    this.x = x
    this.y = y
  }

  get sum() {
    return this.x + this.y
  }

  get product() {
    return this.x * this.y
  }

  get data() {
    return {
      x: this.x,
      y: this.y,
      sum: this.sum,
      product: this.product
    }
  }
}

class InterceptSnapshotStore {
  static config = {
    onSerialize: (state) => {
      return {
        modelData: state.modelData.data,
        anotherVal: state.anotherVal
      }
    },
    onDeserialize: (data) => {
      const obj = {
        modelData: new Model({x: data.modelData.x, y: data.modelData.y}),
        anotherVal: data.anotherVal
      }
      return obj
    }
  }

  constructor() {
    this.bindAction(myActions.updateAnotherVal, this.onUpdateAnotherVal)

    this.modelData = new Model({x: 2, y: 3})
    this.anotherVal = 5
    this.privateVal = 10
  }

  onUpdateAnotherVal(newVal) {
    this.anotherVal = newVal
  }

  static getModelData() {
    return this.getState().modelData.data
  }
}

const interceptSnapshotStore = alt.createStore(InterceptSnapshotStore)

// Alt instances...

class AltInstance extends Alt {
  constructor() {
    super()
    this.addActions('myActions', MyActions, this)
    this.addActions('fauxActions', ['one', 'two'])
    this.addStore('myStore', MyStore, this)
  }
}

const altInstance = new AltInstance()


// Really confusing set of instances
const alt1 = new Alt()
const alt2 = new Alt()

function NameActions() { }
NameActions.prototype.updateName = function (name) {
  this.dispatch(name)
}

const nameActions1 = alt1.createActions(NameActions)
const nameActions2 = alt2.createActions(NameActions)

function NameStore() {
  this.bindActions(nameActions1)
  this.bindActions(nameActions2)
  this.name = 'foo'
}

NameStore.prototype.onUpdateName = function (name) {
  this.name = name
}

const nameStore1 = alt1.createStore(NameStore)
const nameStore2 = alt2.createStore(NameStore)

const consoleWarn = console.warn.bind(console)

/* istanbul ignore next */
const tests = {
  beforeEach() {
    alt.recycle()
    altInstance.recycle()
    alt1.recycle()
    alt2.recycle()
    console.warn = consoleWarn
  },

  'alt instance'() {
    assert.isFunction(alt.bootstrap, 'bootstrap function exists')
    assert.isObject(alt.dispatcher, 'dispatcher exists')
    assert.isFunction(alt.dispatcher.register, 'dispatcher function exists for listening to all events')
    assert.isFunction(alt.takeSnapshot, 'snapshot function exists for saving app state')
    assert.isFunction(alt.createActions, 'createActions function')
    assert.isFunction(alt.createStore, 'createStore function')
    assert.isObject(alt.stores.AltSecondStore, 'store exists in alt.stores')
  },

  'store methods'() {
    const storePrototype = Object.getPrototypeOf(myStore)
    const assertMethods = ['constructor', 'listen', 'unlisten', 'getState']
    assert.deepEqual(Object.getOwnPropertyNames(storePrototype), assertMethods, 'methods exist for store')
    assert.isUndefined(myStore.addListener, 'event emitter methods not present')
    assert.isUndefined(myStore.removeListener, 'event emitter methods not present')
    assert.isUndefined(myStore.emit, 'event emitter methods not present')
  },

  'store external methods'() {
    assert.isFunction(myStore.externalMethod, 'static methods are made available')
    assert.isFunction(myStore.externalMethodNoStatic, 'methods via mixin are made available')
    assert(myStore.externalMethod() === true, 'static methods return proper result')
    assert(myStore.externalMethodNoStatic() === true, 'methods via mixin return proper result')
    assert.isFunction(secondStore.externalMethod, 'static methods are made available')
    assert.isFunction(secondStore.externalMethodNoStatic, 'static methods are made available')
    assert(secondStore.externalMethod() === 'bar', 'static methods have `this` bound to the instance')
    assert(secondStore.externalMethodNoStatic() === 'bar', 'static methods have `this` bound to the instance')
    assert(secondStore.concatFooWith('baz') === 'barbaz', 'static methods may be called with params too')
    assert(secondStore.concatFooWithNoStatic('baz') === 'barbaz', 'static methods may be called with params too')
  },

  'getting state'() {
    assert.isObject(myStore.getState()._dispatcher, 'the dispatcher is exposed internally')

    assert(lifecycleStore.getState().bootstrapped === false, 'bootstrap has not been called yet')
    assert(lifecycleStore.getState().snapshotted === false, 'takeSnapshot has not been called yet')
    assert(lifecycleStore.getState().serialized === false, 'takeSnapshot has not been called yet')
    assert(lifecycleStore.getState().rollback === false, 'rollback has not been called')
    assert(lifecycleStore.getState().init === true, 'init gets called when store initializes')
    assert(lifecycleStore.getState().deserialized === true, 'deserialize has not been called yet')
  },

  'snapshots and bootstrapping'() {
    const initialSnapshot = alt.takeSnapshot()
    assert(lifecycleStore.getState().snapshotted === true, 'takeSnapshot was called and the life cycle event was triggered')

    const bootstrapReturnValue = alt.bootstrap(initialSnapshot)
    assert(bootstrapReturnValue === undefined, 'bootstrap returns nothing')
    assert(lifecycleStore.getState().bootstrapped === true, 'bootstrap was called and the life cycle event was triggered')
    assert(lifecycleStore.getState().snapshotted === true, 'snapshot was called and the life cycle event was triggered')
    assert(lifecycleStore.getState().serialized === true, 'takeSnapshot has not been called yet')
    assert(lifecycleStore.getState().deserialized === true, 'deserialize was called and the life cycle event was triggered')
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

  'existence of constants'() {
    assert.isDefined(myActions.UPDATE_NAME, 'a constant is created for each action')
    assert.isDefined(myActions.UPDATE_TWO, 'a constant is created for each action')
    assert.isDefined(myActions.CALL_INTERNAL_METHOD, 'a constant is created for each action')
  },

  'helper functions'() {
    assert.isFunction(myActions.updateName.defer, 'actions have a defer method for async flow')
  },

  'internal actions'() {
    const internalActions = myActions.justTestingInternalActions()
    assert.isFunction(internalActions.updateThree, 'actions (below) are available internally through this.actions')
    assert.isFunction(internalActions.updateName, 'actions (above) are available internally through this.actions')
    assert.isFunction(internalActions.updateName.defer, 'making sure internal actions has a defer as well')
    assert.isFunction(internalActions.updateThree.defer, 'making sure internal actions has a defer as well')

    assert.isFunction(myStore.getState, 'the store has a getState method exposed')
    assert.isUndefined(myStore.internalOnly, 'internal only method isnt available')

    assert(myStore.getState().name === 'first', 'store has been initialized properly')
    assert(myStore.getState().calledInternal === false, 'store has been initialized properly')
  },

  'calling actions'() {
    const actionReturnType = myActions.updateName('bear')
    assert(actionReturnType === undefined, 'action returns nothing')

    assert(myStore.getState().name === 'bear', 'action was called, state was updated properly')
    assert(myStore.getState().calledInternal === false, 'internal method has not been called')
    assert(secondStore.getState().name === 'bear', 'second store gets its value from myStore')
    assert(thirdStore.getState().name === 'bear3', 'third store gets its value from secondStore, adds 3')
  },

  'calling internal methods'() {
    myActions.callInternalMethod()
    assert(myStore.getState().calledInternal === true, 'internal method has been called successfully by an action')
  },

  'snapshotting'() {
    myActions.updateName('bear')
    const snapshot = alt.takeSnapshot()
    assert.isString(snapshot, 'a snapshot json is returned')
    assert(JSON.parse(snapshot).MyStore.name === 'bear', 'the state is current')
    assert.isObject(JSON.parse(snapshot).AltSecondStore, 'the custom identifier name works')

    myActions.updateName('blossom')
    assert(myStore.getState().name === 'blossom', 'action was called, state was updated properly')
    assert(JSON.parse(snapshot).MyStore.name === 'bear', 'the snapshot is not affected by action')
  },

  'specifying stores to snapshot'() {
    const snapshot = alt.takeSnapshot('MyStore', 'AltSecondStore')
    assert.deepEqual(Object.keys(JSON.parse(snapshot)), ['MyStore', 'AltSecondStore'], 'the snapshot includes specified stores')
    assert(Object.keys(JSON.parse(snapshot)).indexOf('LifeCycleStore') === -1, 'the snapshot does not include unspecified stores')

    const snapshot2 = alt.takeSnapshot(myStore, secondStore)
    assert.deepEqual(Object.keys(JSON.parse(snapshot2)), ['MyStore', 'AltSecondStore'], 'the snapshot includes specified stores')
    assert(Object.keys(JSON.parse(snapshot2)).indexOf('LifeCycleStore') === -1, 'the snapshot does not include unspecified stores')
  },

  'serializing/deserializing snapshot/bootstrap data'(){
    myActions.updateAnotherVal(11)
    const snapshot = alt.takeSnapshot()
    const expectedSerializedData = {
      modelData: {
        x: 2,
        y: 3,
        sum: 5,
        product: 6
      },
      anotherVal: 11
    }
    // serializes snapshot data correctly
    assert.deepEqual(JSON.parse(snapshot).InterceptSnapshotStore, expectedSerializedData, 'interceptSnapshotStore was serialized correctly')
    alt.rollback()
    // deserializes data correctly
    assert.deepEqual(interceptSnapshotStore.getModelData(), expectedSerializedData.modelData)
  },

  'mutation'() {
    const state = myStore.getState()
    state.name = 'foobar'
    assert(state.name === 'foobar', 'mutated returned state')
    assert(myStore.getState().name === 'first', 'store state was not mutated')
  },

  'rolling back'() {
    const rollbackValue = alt.rollback()
    assert(rollbackValue === undefined, 'rollback returns nothing')

    assert(myStore.getState().name === 'first', 'state has been rolledback to last snapshot')
    assert(lifecycleStore.getState().rollback === true, 'rollback lifecycle method was called')

    myActions.updateName('blossom')
    // check that subsequent snapshots overwrite the LAST_SNAPSHOT such that they can be rolled back to
    alt.takeSnapshot()
    alt.rollback()
    assert(myStore.getState().name === 'blossom', 'rolled back to second snapshot')
  },

  'store listening'() {
    const mooseChecker = (x) => {
      assert(x.name === 'moose', 'listener for store works')
      assert(myStore.getState().name === 'moose', 'new store state present')
    }
    const dispose = myStore.listen(mooseChecker)
    myActions.updateName('moose')

    assert(myStore.getState().name === 'moose', 'new store state present')

    dispose()
    myActions.updateName('badger')

    assert(myStore.getState().name === 'badger', 'new store state present')
  },

  'unlistening'() {
    assert(myStore.getState().name !== 'moose', 'state has not been updated')

    const mooseChecker = sinon.spy()
    const unlisten = myStore.listen(mooseChecker)
    myActions.updateName('moose')

    assert(myStore.getState().name === 'moose', 'new store state present')

    unlisten()

    myActions.updateName('badger')

    assert(myStore.getState().name === 'badger', 'new store state present')
    assert.ok(mooseChecker.calledOnce)
  },

  'unlisten lifecycle hook'() {
    const unlistener = sinon.spy()
    class XStore {
      constructor() {
        this.on('unlisten', unlistener)
      }
    }
    const store = alt.createStore(XStore)

    // unlisten directly
    store.listen(function () { })()

    assert.ok(unlistener.calledOnce, 'unlisten lifecycle hook called')
  },

  'bootstrapping'() {
    alt.bootstrap('{"MyStore":{"name":"bee"}}')
    assert(myStore.getState().name === 'bee', 'I can bootstrap many times')

    alt.bootstrap('{}')

    alt.bootstrap('{"MyStore":{"name":"monkey"}}')
    assert(myStore.getState().name === 'monkey', 'I can bootstrap many times')
  },

  'variadic actions'(done) {
    myActions.updateTwo(4, 2)
    assert(secondStore.getState().foo === 6, 'im able to pass two params into an action')

    myActions.updateThree(4, 2, 1)
    assert(secondStore.getState().foo === 7, 'the store method updateThree works')

    myActions.shortHandBinary(1, 0)
    assert(Array.isArray(secondStore.getState().foo) === true, 'shorthand for multiple elements pass through goes as array')
    assert(secondStore.getState().foo[0] === 1, 'shorthand for multiple elements pass through goes as array')
    assert(secondStore.getState().foo[1] === 0, 'shorthand for multiple elements pass through goes as array')


    myActions.shortHandBinary.defer(2, 1)
    setTimeout(() => {
      assert(secondStore.getState().foo[0] === 2, 'shorthand for defer multiple elements pass through goes as array')
      assert(secondStore.getState().foo[1] === 1, 'shorthand for defer multiple elements pass through goes as array')
      done()
    })
  },

  'access of stores'() {
    assert(secondStore.foo === undefined, 'cant access state properties that live inside store')
    assert(secondStore.bindAction === undefined, 'cant access action listeners from outside store')
    assert(secondStore.bindActions === undefined, 'cant access action listeners from outside store')
  },

  'deferral of actions'(done) {
    myActions.updateName('gerenuk')
    assert(myStore.getState().name === 'gerenuk', 'store state was updated properly')
    myActions.updateName.defer('marmot')
    assert(myStore.getState().name === 'gerenuk', 'store state has same name (for now)')
    setTimeout(() => {
      assert(myStore.getState().name === 'marmot', 'store state was updated with defer')
      done()
    })
  },

  'getting instance'() {
    assert.isFunction(myActions.getInstanceInside, 'action for getting the instance inside')
    assert(secondStore.getState().instance === null, 'instance is null because it has not been set')
    myActions.getInstanceInside()
    assert.isObject(secondStore.getState().instance, 'instance has been now set')
    assert.isFunction(secondStore.getState().instance.getState, 'instance is a pointer to secondStore')
    assert.isFunction(secondStore.getState().instance.externalMethod, 'instance has the static methods available')
    assert(secondStore.getState().instance.externalMethod() === 'bar', 'calling a static method from instance and able to use this inside')
  },

  'conflicting listeners on a store'() {
    class StoreWithManyListeners {
      constructor() {
        this.bindActions(myActions)
      }

      // listeners with same action
      updateName() { }
      onUpdateName() { }
    }

    assert.throw(() => alt.createStore(StoreWithManyListeners), ReferenceError, 'You have multiple action handlers bound to an action: updateName and onUpdateName')

    class EvilStore {
      updateName() { }
    }

    class InnocentStore extends EvilStore {
      constructor() {
        super()
        this.bindActions(myActions)
      }

      onUpdateName() { }
    }

    assert.throw(() => alt.createStore(InnocentStore), ReferenceError, 'You have multiple action handlers bound to an action: updateName and onUpdateName')
  },

  'registering invalid action handlers'() {
    class StoreWithInvalidActionHandlers {
      constructor() {
        this.bindAction(myActions.THIS_DOES_NOT_EXIST, this.trololol)
      }

      trololol() { }
    }

    assert.throw(() => alt.createStore(StoreWithInvalidActionHandlers), ReferenceError, 'Invalid action reference passed in')

    class StoreWithInvalidActionHandlers2 {
      constructor() {
        this.bindAction(myActions.UPDATE_NAME, this.invisibleFunction)
      }
    }

    assert.throw(() => alt.createStore(StoreWithInvalidActionHandlers2), TypeError, 'bindAction expects a function')
  },

  'exporting invalid store methods'() {
    class StoreWithInvalidExportType {
      constructor() {
        this.foo = 'bar'
        this.exportPublicMethods({ foo: 'foo' })
      }
    }

    assert.throw(() => alt.createStore(StoreWithInvalidExportType), TypeError, 'exportPublicMethods expects a function')
  },

  'waiting for nothing'() {
    class WaitPlease {
      constructor() {
        this.generateActions('pleaseWait')
      }
    }
    const waiter = alt.createActions(WaitPlease)

    alt.createStore(class WaitsForNobody {
      constructor() {
        this.bindActions(waiter)
      }

      pleaseWait() {
        this.waitFor()
      }
    })

    assert.throw(() => waiter.pleaseWait(), ReferenceError, 'Dispatch tokens not provided')
  },

  'unary action warnings'() {
    class MethodsAreUnary1 {
      constructor() {
        this.bindActions(myActions)
      }

      onUpdateName(name1, name2) { }
    }

    assert.throw(() => alt.createStore(MethodsAreUnary1), TypeError, /Action handler in store .* was defined with two parameters/)

    class MethodsAreUnary2 {
      constructor() {
        this.bindAction(myActions.UPDATE_TWO, this.onUpdateName)
      }

      onUpdateName(name1, name2) { }
    }

    assert.throw(() => alt.createStore(MethodsAreUnary2), TypeError, /Action handler in store .* was defined with two parameters/)
  },

  'cancelling emit'() {
    function eventEmittedFail() {
      assert(true === false, 'event was emitted but I did not want it to be')
    }
    const dispose = myStore.listen(eventEmittedFail)
    myActions.dontEmit()
    dispose()
    assert(myStore.getState().dontEmitEventCalled === true, 'dont emit event was called successfully and event was not emitted')
  },

  'multiple deferrals'(done) {
    myActions.moreActions()
    assert(secondStore.getState().deferrals === 1, 'deferrals is initially set to 1')
    setTimeout(() => {
      assert(secondStore.getState().deferrals === 3, 'but deferrals ends up being set to 3 after all actions complete')
      done()
    })
  },

  'recycling'() {
    alt.recycle()
    assert(myStore.getState().name === 'first', 'recycle sets the state back to its origin')

    myActions.resetRecycled()
    assert(secondStore.getState().recycled === false, 'recycle const was reset due to action')
    alt.recycle()
    assert(secondStore.getState().recycled === true, 'init lifecycle method was called by recycling')
  },

  'flushing'() {
    myActions.updateName('goat')
    const flushed = JSON.parse(alt.flush())
    assert(myStore.getState().name === 'first', 'flush is a lot like recycle')
    assert(flushed.MyStore.name === 'goat', 'except that flush returns the state before recycling')

    myActions.updateName('butterfly')
    assert(myStore.getState().name === 'butterfly', 'I can update the state again after a flush')
    assert(secondStore.getState().name === 'butterfly', 'I can update the state again after a flush')
  },

  'recycling single store'() {
    myActions.updateName('butterfly')
    alt.recycle('MyStore')
    assert(myStore.getState().name === 'first', 'I can recycle specific stores')
    assert(secondStore.getState().name === 'butterfly', 'and other stores will not be recycled')

    myActions.updateName('butterfly')
    alt.recycle(myStore)
    assert(myStore.getState().name === 'first', 'I can recycle specific stores')
  },

  'recycling invalid stores'() {
    assert.throw(() => alt.recycle('StoreThatDoesNotExist'), ReferenceError, 'StoreThatDoesNotExist is not a valid store')
  },

  'alt single instances'() {
    assert.instanceOf(altInstance, Alt, 'altInstance is an instance of alt')
    assert.isObject(altInstance.dispatcher, 'it has a dispatcher')
    assert.isFunction(altInstance.bootstrap, 'bootstrap function exists')
    assert.isFunction(altInstance.createActions, 'createActions function')
    assert.isFunction(altInstance.createStore, 'createStore function')

    const myActionsFromInst = altInstance.getActions('myActions')
    assert.isObject(myActionsFromInst, 'the actions exist')

    const fauxActions = altInstance.getActions('fauxActions')
    assert.isFunction(fauxActions.one, 'faux actions were generated')

    const myActionsFail = altInstance.getActions('ActionsThatDontExist')
    assert.isUndefined(myActionsFail, 'undefined actions')

    myActionsFromInst.updateName('lion')
    assert(altInstance.getStore('myStore').getState().name === 'lion', 'state was updated')
    assert(myStore.getState().name === 'first', 'and other singleton store was not affected')
  },

  'multiple alt instances'() {
    nameActions1.updateName('bar')
    nameActions2.updateName('baz')

    assert(nameStore1.getState().name === 'bar', 'store 1 state is set')
    assert(nameStore2.getState().name === 'baz', 'this store has different state')
    assert(altInstance.getStore('myStore').getState().name === 'first', 'other stores not affected')
    assert(myStore.getState().name === 'first', 'other singleton store not affected')
  },

  'actions with the same name'() {
    const alt = new Alt()

    function UserActions() {
      this.generateActions('update')
    }
    const ua = alt.createActions(UserActions)

    function LinkActions() {
      this.generateActions('update')
    }
    const la = alt.createActions(LinkActions)

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

    const store = alt.createStore(Store)

    ua.update()
    la.update()

    const state = store.getState()

    assert(state.a === 1, 'both actions were called')
    assert(state.b === 1, 'both actions were called')
  },

  'actions with the same name and same class name'() {
    const alt = new Alt()

    const ua = (function () {
      function a() { this.generateActions('update') }
      return alt.createActions(a)
    }())

    const la = (function () {
      function a() { this.generateActions('update') }
      return alt.createActions(a)
    }())

    let uaOnce = 0
    let laOnce = 0

    class Store {
      constructor() {
        this.bindAction(ua.UPDATE, this.ua)
        this.bindAction(la.UPDATE, this.la)

        this.a = 0
        this.b = 0
      }

      ua() {
        this.a = 1
        uaOnce += 1
      }

      la() {
        this.b = 1
        laOnce += 1
      }
    }

    const store = alt.createStore(Store)

    ua.update()
    la.update()

    const state = store.getState()

    assert(state.a === 1, 'both actions were called')
    assert(state.b === 1, 'both actions were called')
    assert.equal(uaOnce, 1, 'actions only called once')
    assert.equal(laOnce, 1, 'actions only called once')
  },

  'dispatching from alt instance'() {
    const inst = new AltInstance()
    let called = false
    const listen = (x) => {
      assert(x.action === inst.getActions('myActions').updateName, 'the action provided is correct')
      assert(x.data === 'yo', 'i can dispatch instances on my own')
      called = true
    }

    const id = inst.dispatcher.register(listen)
    inst.dispatch(inst.getActions('myActions').updateName, 'yo')
    inst.dispatcher.unregister(id)

    assert(called === true, 'listener was called')
  },

  'emit change method works from the store'(done) {
    assert(myStore.getState().async === false, 'store async is false')

    const listener = () => {
      assert(myStore.getState().async === true, 'store async is true')
      dispose()
      done()
    }

    const dispose = myStore.listen(listener)
    myActions.asyncStoreAction()
  },

  'emit change method works with an isolated store'(done) {
    const alt = new Alt()

    function Actions() {
      this.generateActions('test')
    }

    const actions = alt.createActions(Actions)

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

    const store = alt.createStore(Store)

    assert(store.getState().test === false, 'test is false')

    const listener = () => {
      assert(store.getState().test === true, 'test is true')
      dispose()
      done()
    }

    const dispose = store.listen(listener)
    actions.test()
  },

  'extending stores'() {
    const alt = new Alt()

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

    const store = alt.createStore(Store)

    assert(store.getState().foo === true, 'store inherits properties')
    assert(store.getState().bar === true, 'store properties are available')
    assert(store.getState().baz === true, 'inherited methods can be called')
  },

  'exporting public method of ancestor'() {
    class StoreBase {
      baseMethod() {
        return true
      }
    }

    class Store extends StoreBase {
      constructor() {
        super()
        this.exportPublicMethods({
          baseMethod: this.baseMethod
        })
      }
    }

    const store = alt.createStore(Store)

    assert.isFunction(store.baseMethod, 'ancestor methods via export mixin are made available')
  },

  'listener mixin'() {
    const handler = () => { }

    // set up
    ListenerMixin.componentWillMount()

    ListenerMixin.listenTo(myStore, handler)

    assert(ListenerMixin.getListeners().length === 1, 'mixin has one handler')

    ListenerMixin.componentWillUnmount()

    assert(ListenerMixin.getListeners().length === 0, 'mixin was unmounted')

    ListenerMixin.listenToMany([myStore, secondStore], handler)

    assert(ListenerMixin.getListeners().length === 2, 'mixin has two handlers')

    // tear it down
    ListenerMixin.componentWillUnmount()

    assert(ListenerMixin.getListeners().length === 0, 'mixin was unmounted')
  },

  'fluxy mixin object pattern'() {
    let called = false

    class FakeComponent extends ReactComponent {
      doFoo(storeState) {
        this.setState({ foo: myStore.getState() })
      }

      doBar(storeState) { }

      render() {
        assert(this.state.foo.name === 'Fluxy (object)', 'render was called with right state')
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
      assert(called === true, 'render was called')
    })
  },

  'fluxy mixin array pattern'() {
    let called = false

    class FakeComponent extends ReactComponent {
      onChange() {
        this.setState({ foo: myStore.getState() })
      }

      render() {
        assert(this.state.foo.name === 'Fluxy (array)', 'render was called with right state')
        called = true
      }
    }

    FakeComponent.mixins = [FluxyMixin]

    FakeComponent.statics = {
      storeListeners: [myStore, secondStore]
    }

    ReactComponent.test(FakeComponent, () => {
      myActions.updateName('Fluxy (array)')
      assert(called === true, 'render was called')
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

    assert.throw(() => ReactComponent.test(FakeComponent), ReferenceError, 'doFoo does not exist in your React component')
  },

  'fluxy mixin array errors'() {
    class FakeComponent extends ReactComponent { }

    FakeComponent.mixins = [FluxyMixin]

    FakeComponent.statics = {
      storeListeners: [myStore]
    }

    assert.throw(() => ReactComponent.test(FakeComponent), ReferenceError, 'onChange should exist in your React component but is not defined')
  },

  'isomorphic mixin error'() {
    class FakeComponent extends ReactComponent { }
    FakeComponent.mixins = [IsomorphicMixin.create(new Alt())]

    assert.throw(() => ReactComponent.test(FakeComponent), ReferenceError, 'altStores was not provided')
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
          assert(this.state.my.name === 'Magic', 'myStore state was updated properly')
        }

        if (renderCalls === 2) {
          assert(this.state.sc.name === 'Magic', 'secondStore state was updated properly')
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
      assert(called === true, 'render was called')
      assert(renderCalls - 1 === 2, 'render was called twice')
    })
  },

  'the magical mixin single'() {
    let called = false

    class FakeComponent extends ReactComponent {
      render() {
        assert(this.state.name === 'Single magic', 'myStore state was updated properly')
        called = true
      }
    }

    FakeComponent.mixins = [ReactStateMagicMixin]
    FakeComponent.statics = {
      registerStore: myStore
    }

    ReactComponent.test(FakeComponent, () => {
      myActions.updateName('Single magic')
      assert(called === true, 'render was called')
    })
  },

  'the magical mixin errors'() {
    class FakeComponent extends ReactComponent { }
    FakeComponent.mixins = [ReactStateMagicMixin]
    FakeComponent.statics = {
      registerStores: {},
      registerStore: myStore
    }

    assert.throw(() => ReactComponent.test(FakeComponent), ReferenceError, 'You are attempting to use `registerStore` and `registerStores` pick one')
  },

  'binding a listener that does not exist'() {
    class BadListenerStore {
      constructor() {
        this.bindListeners({
          methodThatDoesNotExist: myActions.updateName
        })
      }
    }

    assert.throw(() => alt.createStore(BadListenerStore), ReferenceError, 'methodThatDoesNotExist defined but does not exist in BadListenerStore')
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

    assert.throw(() => alt.createStore(BadListenerStore), ReferenceError, 'Invalid action reference passed in')
  },

  'do not include store in snapshots'() {
    function NoBootstrap() { }

    alt.createUnsavedStore(NoBootstrap, 'NoBootstrap')

    let snapshot = JSON.parse(alt.takeSnapshot())

    assert.isUndefined(snapshot.NoBootstrap, 'Store does not exist in snapshots')
    assert.isObject(snapshot.AltSecondStore, 'AltSecondStore exists')

    alt.createUnsavedStore({
      displayName: 'NoBootstrapObject'
    })

    snapshot = JSON.parse(alt.takeSnapshot())

    assert.isUndefined(snapshot.NoBootstrapObject, 'Store does not exist in snapshots')
    assert.isObject(snapshot.AltSecondStore, 'AltSecondStore exists')
  },

  'actions with no name are still ok'() {
    var actions = alt.createActions(function () {
      this.generateActions('foo')
    })

    assert.isFunction(actions.foo, 'action still exists')
  },

  'recycle store that does not exist'() {
    assert.doesNotThrow(() => {
      alt.bootstrap('{"AStoreThatIJustMadeUpButDoesNotReallyExist": {}}')
    })
  },

  'creating one off actions'() {
    const action = alt.createAction('hello', function (x) {
      this.dispatch(x)
    })

    const store = alt.createStore({
      displayName: 'just testing',
      state: { x: 0 },
      bindListeners: {
        hello: action
      },
      hello(x) { this.state.x = x }
    })

    assert.isFunction(action, 'action was created')

    action(1)

    assert(store.getState().x === 1, 'action fires correctly')
  },

  'setState emits a change if not dispatching'(done) {
    const alt = new Alt()

    const actions = alt.generateActions('fire')

    const store = alt.createStore(class Store {
      constructor() {
        this.bindActions(actions)
        this.test = false
      }

      fire() {
        setTimeout(() => {
          this.setState({
            test: true
          })
        })
        return false
      }
    })

    assert(store.getState().test === false)

    const unlisten = store.listen((state) => {
      assert(state.test === true)
      unlisten()
      done()
    })

    actions.fire()
  },

  'prepare a payload for bootstrap'() {
    const serialized = alt.prepare(myStore, { a: 1, b: 2 })
    const parsed = JSON.parse(serialized)

    assert.isString(serialized)
    assert.isObject(parsed.MyStore)
    assert(parsed.MyStore.a === 1)
    assert(parsed.MyStore.b === 2)
    assert.isUndefined(parsed.MyStore.c)

    assert.throws(() => {
      alt.prepare({}, { x: 0 })
    }, ReferenceError)
  },

  'async dispatches'(done) {
    const AsyncAction = alt.createActions({
      displayName: 'AsyncAction',
      fire(x) {
        return (dispatch) => {
          dispatch(x)
        }
      }
    })

    const token = alt.dispatcher.register((payload) => {
      assert(payload.action === 'AsyncAction.fire')
      assert(payload.data === 2)
      alt.dispatcher.unregister(token)
      done()
    })

    AsyncAction.fire(2)
  },
}

export default tests
