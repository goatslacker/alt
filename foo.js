import Alt, { Store } from './'

const alt = new Alt()

const actions = alt.generateActions('foo')

//class MyStore extends Store {
//  constructor(one, two, three) {
//    super()
//
//    this.state = { x: 1 }
//
//    this.bindAction(actions.foo, () => {
//      this.setState({ x: this.state.x + 1 })
//    })
//  }
//}

//export default alt.registerStore(1, 2, 3)(MyStore)

// XXX good except i need to pull the config
//const store = alt.register(1, 2, 3)(MyStore)


const store = alt.createStore(class {
  constructor(one, two, three) {
    super()

    this.state = { x: 1 }

    this.bindAction(actions.foo, () => {
      this.setState({ x: this.state.x + 1 })
    })
  }
})

store.listen(state => console.log('CHANGED', state))

actions.foo()
actions.foo()
actions.foo()
actions.foo()
