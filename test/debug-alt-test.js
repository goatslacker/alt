import Alt from '../'
import { assert } from 'chai'

export default {
  'debug mode': {
    beforeEach() {
      global.window = {}
    },

    'enable debug mode'() {
      const alt = new Alt()
      const alt2 = new Alt()
      Alt.debug('an identifier', alt)
      Alt.debug('alt2', alt2)

      assert.isArray(global.window['alt.js.org'])
      assert(global.window['alt.js.org'].length === 2)
      assert.isString(global.window['alt.js.org'][0].name)
      assert(global.window['alt.js.org'][0].alt === alt)
    },

    afterEach() {
      delete global.window
    }
  },

  'isomorphic debug mode': {
    'enable debug mode does not make things explode'() {
      const alt = new Alt()
      Alt.debug('hello', alt)
    },
  }
}
