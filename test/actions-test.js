import Alt from '../'
import { assert } from 'chai'
import sinon from 'sinon'

const alt = new Alt()

const myActions = alt.generateActions('', [
  'updateThree',
  'updateTwo',
  'updateName',
  'justTestingInternalActions',
  'callInternalMethod',
  'shortHandBinary',
])

class MyStore extends Alt.Store {
  constructor() {
    super()
    this.state = { name: '', calledInternal: false }
    this.bindActions(myActions)
  }

  updateName(name) {
    this.setState({ name })
  }

  callInternalMethod() {
    this.foo()
  }

  foo() {
    this.setState({ calledInternal: true })
  }
}

class ThirdStore extends Alt.Store {
  constructor() {
    super()
    this.state = { name: '', foo: 0 }
    this.bindActions(myActions)
  }

  updateName() {
    const name = `${alt.stores.MyStore.getState().name}3`
    this.setState({ name })
  }

  onUpdateTwo(x) {
    this.setState({ foo: x[0] + x[1] })
  }

  onUpdateThree(x) {
    this.setState({ foo: x[0] + x[1] + x[2] })
  }
}

const myStore = alt.createStore('MyStore', new MyStore())
const thirdStore = alt.createStore('ThirdStore', new ThirdStore())

export default {
  beforeEach() {
    alt.flush()
  },

  'calling actions'() {
    const actionReturnType = myActions.updateName('bear')
    assert(actionReturnType === 'bear', 'action returns what is dispatched')

    assert(myStore.getState().name === 'bear', 'action was called, state was updated properly')
    assert(myStore.getState().calledInternal === false, 'internal method has not been called')
    assert(thirdStore.getState().name === 'bear3', 'third store gets its value from myStore, adds 3')
  },

  'calling internal methods'() {
    myActions.callInternalMethod()
    assert(myStore.getState().calledInternal === true, 'internal method has been called successfully by an action')
  },

  'variadic actions'() {
    myActions.updateTwo(4, 2)
    assert(thirdStore.getState().foo === 6, 'im able to pass two params into an action')

    myActions.updateThree(4, 2, 1)
    assert(thirdStore.getState().foo === 7, 'the store method updateThree works')

    const spy = sinon.spy()

    const otherActions = alt.createActions('other', { spy })
    otherActions.spy(1, 2, 3)

    assert(spy.args[0].length === 3)
  },
}
