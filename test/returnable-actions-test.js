import Alt from '../'
import { assert } from 'chai'
import sinon from 'sinon'

const alt = new Alt()

const actions = alt.createActions({
  displayName: 'X',
  foo: () => 12,
  bar: () => (dispatch) => dispatch(13)
})

export default {
  'Returnable actions': {
    'the actions can return to dispatch'(done) {
      const spy = sinon.spy()
      const token = alt.dispatcher.register((payload) => {
        assert(payload.data === 12)
        spy()
      })

      assert(actions.foo() === 12)
      assert.ok(spy.calledOnce)

      alt.dispatcher.unregister(token)

      const token2 = alt.dispatcher.register((payload) => {
        assert(payload.data === 13)
        alt.dispatcher.unregister(token2)
        done()
      })

      assert.isFunction(actions.bar())
    },
  }
}
