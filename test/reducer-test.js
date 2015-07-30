import { assert } from 'chai'
import Alt from '../'
import sinon from 'sinon'
import { combine, reduceWith } from '../utils/reducers'

const alt = new Alt()

const actions = alt.generateActions('fire', 'foo', 'bar')

const store = alt.createStore({
  state: 21,

  displayName: 'ValueStore',

  reduce: combine(
    reduceWith([actions.fire, actions.BAR], (state, payload) => {
      return state + 1
    })
  )
})

export default {
  'value stores': {
    beforeEach() {
      alt.recycle()
    },

    'reducer utils help ease the pain of switch statements'() {
      const spy = sinon.spy()
      const unlisten = store.listen(spy)

      actions.fire()
      actions.foo()
      actions.bar()

      assert(store.getState() === 23, 'state is correct')
      assert.ok(spy.calledTwice, 'spy was only called twice')

      unlisten()
    },
  }
}
