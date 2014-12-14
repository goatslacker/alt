var Fux = require('./fux')

var fux = new Fux()

var myUtils = {
  callServer(query, cb) {
    setTimeout(function () {
      cb('xhr-' + query)
    }, 500)
  }
}

var myActions = fux.createActions(class MyActions {
//  constructor() {
//    this.thru('updateName')
//  }

  updateName(name) {
    this.dispatch(name)
  }

  save(state) {
    // XXX db call that saves state
    console.log('Saving', state)
  }

  updateFoo(a, b) {
    return {a, b}
  }
})

var myStore = fux.createStore(class MyStore {
  constructor() {
    this.listenTo(myActions.updateName, this.onUpdateName)

    this.name = 'lol'
  }

  getInitialState() {
    return { name: 'lol' }
  }

  onUpdateName(name) {
    return { name }
  }
})

var secondStore = fux.createStore(class SecondStore {
  constructor() {
    this.listenToActions(myActions)
  }

  getInitialState() {
    return { foo: 'bar', name: myStore.getState().name }
  }

  onUpdateFoo(x) {
    return { foo: x.a + x.b }
  }

  onUpdateName(name) {
    fux.dispatcher.waitFor([myStore.dispatchToken])
//    myActions.save()
//    setTimeout(() => {
//      myActions.save(secondStore.getState())
//    }, 1)
    return { name: name }
  }
})

//secondStore.listen(() => {
//  console.log('changed second', secondStore.getState())
//})
//
myStore.listen(() => {
  console.log('Changed State:', myStore.getState())
  console.log('Snapshot of entire app state:', fux.takeSnapshot())
})

console.log('Current State:', myStore.getState())

//var snapshot = '{"myStore":{"name":"hello"},"secondStore":{"yes": true}}'

//fux.bootstrap(snapshot)
//console.log(secondStore.getState())

myActions.updateName('hello')
//myActions.updateFoo(1, 2)
