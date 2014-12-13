var Fux = require('./fux')

var fux = new Fux()

var myUtils = {
  callServer(query, cb) {
    setTimeout(function () {
      cb('xhr-' + query)
    }, 500)
  }
}

var myActions = fux.createActions({
  updateName(name) {
    return new Fux.Promise((resolve, reject) => {
      myUtils.callServer(name, resolve)
    })
  }
})

var myStore = fux.createStore('myStore', {
  initListeners(on) {
    on(myActions.updateName, this.onUpdateName)
  },

  getInitialState() {
    return { name: 'lol' }
  },

  onUpdateName(name) {
    return new Fux.Promise((resolve, reject) => {
      return resolve({ name: name })
    })
  }
})

// This store intentionally left blank.
var secondStore = fux.createStore('secondStore', {
  initListeners() { },

  getInitialState() {
    return { foo: 'bar' }
  }
})

// XXX ok so how do you use waitFor then?
myStore.listen(() => {
  console.log('Changed State:', myStore.getCurrentState())
  console.log('Snapshot of entire app state:', fux.takeSnapshot())
})

console.log('Current State:', myStore.getCurrentState())

myActions.updateName('hello')

