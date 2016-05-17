import Alt from '../'
import { assert } from 'chai'
import sinon from 'sinon'

const alt = new Alt()

const myActions = alt.generateActions('', ['updateName'])

export default {
  'is fsa'(done) {
    const sub = alt.subscribe((x) => {
      assert.isDefined(x.type, 'there is a type')
      assert.isDefined(x.payload, 'there is a payload')
      assert.isDefined(x.meta, 'meta exists')
      assert.isString(x.meta.id, 'meta contains a unique dispatch id')

      assert(x.payload === 'Jane', 'the payload is correct')

      sub.dispose()

      done()
    })

    myActions.updateName('Jane')
  },

  'can dispatch fsa'(done) {
    const sub = alt.subscribe((x) => {
      assert.isDefined(x.type, 'there is a type')
      assert(x.type === 'owl')
      assert.isDefined(x.payload, 'there is a payload')
      assert(x.payload === 'Tawny')
      assert.isString(x.meta.id, 'meta contains a unique dispatch id')

      sub.dispose()

      done()
    })

    alt.publish({ type: 'owl', payload: 'Tawny' })
  },

  // TODO test FSA errors
  // make sure we follow fsa compliance
}
