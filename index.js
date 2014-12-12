var { Actions, Store, Promise } = require('./1d')

// XXX need a single dispatcher instance now

class MyActions extends Actions {
  constructor() {
    super()
  }

  updateName(name) {
    return new Promise((resolve, reject) => {
      return resolve(name)
    })
  }
}
var myActions = new MyActions()



class MyStore extends Store {
  constructor() {
    super()
    this.actionListener(myActions.updateName, this.onUpdateName)
  }

  getInitialState() {
    return { name: 'lol' }
  }

  onUpdateName(name) {
    return new Promise((resolve, reject) => {
      return resolve({ name: name })
    })
  }
}
var myStore = new MyStore()




myStore.listen(() => console.log('Shit has changed', myStore.getCurrentState()))
console.log('=1', myStore.getCurrentState())
myActions.updateName('hello')
