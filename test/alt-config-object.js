import { assert } from 'chai'
import Alt from '../dist/alt-with-runtime'

class CustomDispatcher {
  waitFor() {}
  dispatchToken() {}
  register() {}
  dispatch() {}
  extraMethod() {}
}

export default {
  'custom dispatcher can be specified in alt config'() {
    const alt = new Alt({
      dispatcher: new CustomDispatcher()
    })
    const dispatcher = alt.dispatcher

    // uses custom dispatcher
    assert.equal(typeof dispatcher.extraMethod, 'function')
    assert.equal(typeof dispatcher.dispatch, 'function')
  }
}
