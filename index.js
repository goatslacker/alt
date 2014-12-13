var Fux = require('./fux')

var fux = new Fux()

// XXX need a single dispatcher instance now

var myActions = fux.createActions({
  updateName(name) {
    return new Fux.Promise((resolve, reject) => {
      return resolve(name)
    })
  }
})

//var caca = myActions.updateName
//listeners[

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

myStore.listen(() => console.log('Shit has changed', myStore.getCurrentState()))
console.log('=1', myStore.getCurrentState())
myActions.updateName('hello')

//console.log('snapshot', fux.takeSnapshot())
