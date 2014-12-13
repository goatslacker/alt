// XXX test this with a require that compiles to es6
var Fux = require('./fux')

var fux = new Fux()

var myUtils = {
  callServer(query, cb) {
    setTimeout(function () {
      cb('xhr-' + query)
    }, 500)
  }
}

// XXX not a fan of always providing a function if the function is just an `id` function
// what if the function takes two params? I'd still like to pass those through...
var myActions = fux.createActions({
  updateName: Fux.id,

  updateFoo(a, b) {
    return {a, b}
  }
//  updateName: 1
//  updateName(name) {
//    return new Fux.Promise((resolve, reject) => {
//      myUtils.callServer(name, resolve)
//    })
//  }
})

var myStore = fux.createStore(class MyStore {
  constructor() {
    this.listenTo(myActions.updateName, this.onUpdateName)
  }

  getInitialState() {
    return { name: 'lol' }
  }

  onUpdateName(name) {
    return new Fux.Promise((resolve, reject) => {
      return resolve({ name: name })
    })
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
