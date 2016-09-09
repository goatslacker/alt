import Alt from '../'
import generateAsyncActions from '../utils/generateAsyncActions'
import { assert } from 'chai'

const alt = new Alt()

export default {
  'async actions generated'() {
    const actions = generateAsyncActions(alt, 'foo', 'bar')

    assert.isFunction(actions.fooStarting)
    assert.isFunction(actions.fooSuccess)
    assert.isFunction(actions.fooFailure)
    assert.isFunction(actions.barStarting)
    assert.isFunction(actions.barSuccess)
    assert.isFunction(actions.barFailure)
  },
}
