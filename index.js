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



// XXX now I need a global store registry so I can save all of the state into a single snapshot
// and then be able to hydrate all of that with the serialized data <-- this one sort of goes against flux since i wouldn't be calling actions

myStore.listen(() => console.log('Shit has changed', myStore.getCurrentState()))
console.log('=1', myStore.getCurrentState())
myActions.updateName('hello')
