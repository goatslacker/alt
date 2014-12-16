var Fux = require('./fux')
var assert = require('assert')

var fux = new Fux()

var myUtils = {
  callServer(query, cb) {
    setTimeout(function () {
      cb('xhr-' + query)
    }, 500)
  }
}

var myActions = fux.createActions(class MyActions {
  updateName(name) {
    this.dispatch(name)
  }

  save(state) {
    // XXX db call that saves state
    console.log('Saving', state)
  }

  updateFoo(a, b) {
    this.dispatch({ a, b })
  }
})

var myStore = fux.createStore(class MyStore {
  constructor() {
    this.bindAction(myActions.updateName, this.onUpdateName)
    this.name = 'lol'
  }

  onUpdateName(name) {
    this.name = name
  }

  methodICanCall() {
    return true
  }

  onTakeSnapshot() {
    console.log('**********SNAPSHOT*************')
  }
})

var secondStore = fux.createStore(class SecondStore {
  constructor() {
    this.foo = 'bar'
    this.name = myStore.getState().name
    this.bindActions(myActions)
  }

  onUpdateFoo(x) {
    this.foo = x.a + x.b
  }

  onUpdateName() {
    this.waitFor(myStore.dispatchToken)
    console.log('when am i called?', myStore.getState())
    this.name = myStore.getState().name
  }
})

!() => {
  assert.equal(typeof myStore.getState, 'function')
  assert.equal(typeof myStore.onTakeSnapshot, 'function')
  assert.equal(typeof myStore.methodICanCall, 'function')
  assert.equal(myStore.methodICanCall(), true)

  // XXX I guess I can now call the onUpdateName methods directly which is kinda lame...
  // I should think about removing the prototype methods. Loss of intuitiveness but you can't set shit directly, only through actions
}()


var str = '{"MyStore":{"name":"wtf"}}'
fux.bootstrap(str)

console.log(myStore.getState())

//secondStore.listen(() => {
//  console.log('changed second', secondStore.getState())
//})

console.log('Current State:', myStore.getState())

myStore.listen((...args) => {
  console.log('Args', args)
  console.log('Changed State:', myStore.getState())
  console.log('Snapshot of entire app state:', fux.takeSnapshot())
})

// Listen to all global events.
fux.dispatcher.register((payload) => {
  console.log('  * Dispatcher => ', payload)
})

//secondStore.listen(() => {
//  console.log('Registering another store')
//})

//var snapshot = '{"myStore":{"name":"hello"},"secondStore":{"yes": true}}'

//fux.bootstrap(snapshot)
//console.log(secondStore.getState())

myActions.updateName('hello')
setTimeout(() => {
  console.log('can i call methods defined in store prototype', myStore.methodICanCall())
  console.log(myStore.getState(), secondStore.getState())
  fux.rollback()
  console.log('rolling back to', fux.takeSnapshot())
}, 1000)
//myActions.updateFoo(1, 2)
