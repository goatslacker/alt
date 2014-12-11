var Reflux = require('reflux')

var action = Reflux.createActions(['setFoo'])

var store = Reflux.createStore({
  listenables: action,

  init: () => {
    this.foo = 1
  },

  onSetFoo(foo) {
    this.foo = foo
    this.trigger()
  },

  getState: () => {
    return this.foo
  }
})

action.setFoo(2)
store.listen((test) => {
  console.log('@', test, 'and', store.getState())
})
