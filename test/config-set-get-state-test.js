import Alt from '../'
import { assert } from 'chai'
import sinon from 'sinon'


export default {
  'Config state getter and setter': {
    'setting state'() {
      const setState = sinon.stub().returns({
        foo: 'bar'
      })

      const alt = new Alt({ setState })

      const action = alt.generateActions('fire')

      const store = alt.createStore({
        displayName: 'store',
        bindListeners: {
          fire: action.fire
        },
        state: { x: 1 },
        fire() {
          this.setState({ x: 2 })
        }
      })

      assert(store.getState().x === 1)

      action.fire()

      assert.ok(setState.calledOnce)
      assert(setState.args[0].length === 2)
      assert(store.getState().foo === 'bar')
    },

    'getting state'() {
      const getState = sinon.stub().returns({
        foo: 'bar'
      })

      const alt = new Alt({ getState })

      const store = alt.createStore({
        displayName: 'store',
        state: { x: 1 }
      })

      assert.isUndefined(store.getState().x)

      assert.ok(getState.calledOnce)
      assert(getState.args[0].length === 1)
      assert(store.getState().foo === 'bar')
    },
  }
}
