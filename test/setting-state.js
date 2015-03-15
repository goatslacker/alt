import { assert } from 'chai'
import Alt from '../dist/alt-with-runtime'
import sinon from 'sinon'

const alt = new Alt()

const actions = alt.generateActions('fire', 'nothing')

class MyStore {
  constructor() {
    this.foo = 1
    this.bindListeners({ increment: actions.FIRE, nothing: actions.NOTHING })
  }

  increment() {
    this.retVal = this.setState({ foo: this.foo + 1 })
    return this.retVal
  }

  nothing() {
    this.setState()
  }
}

const myStore = alt.createStore(MyStore)

export default {
  'setState': {
    'using setState to set the state'() {
      const spy = sinon.spy()
      myStore.listen(spy)

      actions.fire()

      assert(myStore.getState().foo === 2, 'foo was incremented')
      assert(myStore.getState().retVal === false, 'return value of setState is false')

      myStore.unlisten(spy)

      // calling set state without anything doesn't make things crash and burn
      actions.nothing()

      assert.ok(spy.calledOnce, 'spy was only called once')
    }
  }
}
