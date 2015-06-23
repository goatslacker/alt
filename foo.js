import Alt, { Store } from './'

const alt = new Alt()

const actions = alt.generateActions('foo')

class MyStore extends Store {
  constructor(one, two, three) {
    super(alt)
//      displayName: 'MyStore'
//    })

    this.state = { x: 1 }

    this.bindAction(actions.foo, () => {
      this.setState({ x: this.state.x + 1 })
    })
  }
}

//export default alt.registerStore(1, 2, 3)(MyStore)

const store = alt.registerStore()(MyStore)

store.listen(state => console.log('CHANGED', state))

actions.foo()
actions.foo()
actions.foo()
actions.foo()
