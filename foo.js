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
//const store = alt.register(1, 2, 3)(MyStore)

class MyStore {
  constructor() {
    this.state = { x: 1 }
    this.bindActions(actions)
    this.exportPublicMethods({
      bar: this.bar.bind(this)
    })
  }

  foo() {
    this.setState({ x: this.state.x + 1 })
  }

  bar() {
    return this.state.x
  }
}

const store = alt.createStore(MyStore)

console.log(store.bar())

store.listen(state => console.log('CHANGED', state))

actions.foo()
actions.foo()
actions.foo()
actions.foo()
