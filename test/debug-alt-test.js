import { assert } from 'chai'
import Alt from '../'

export default {
  'debug mode': {
    beforeEach() {
      global.window = {}
    },

    'enable debug mode': function () {
      const alt = new Alt()
      Alt.debug('an identifier', alt)

      assert.isArray(global.window['alt.js.org'])
      assert(global.window['alt.js.org'].length === 1)
      assert.isString(global.window['alt.js.org'][0].name)
      assert(global.window['alt.js.org'][0].alt === alt)
    },

    afterEach() {
      delete global.window
    }
  },

  'isomorphic debug mode': {
    'enable debug mode does not make things explode': function () {
      const alt = new Alt()
      Alt.debug(alt)
    }
  }
}
