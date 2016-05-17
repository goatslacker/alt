import { assert } from 'chai'
import Alt from '../'
import fromLegacyStore from '../lib/compat/fromLegacyStore'
import sinon from 'sinon'

export default {
  'catch failed dispatches': {
    'uncaught dispatches result in an error'() {
      const alt = new Alt()
      const actions = alt.generateActions('', ['fire'])

      class Uncaught {
        constructor() {
          this.bindListeners({ fire: actions.fire })
        }

        fire() {
          throw new Error('oops')
        }
      }

      const uncaught = alt.createStore('Uncaught', fromLegacyStore(Uncaught))

      assert.throws(() => actions.fire())
    },

    'errors can be caught though'() {
      const alt = new Alt()
      const actions = alt.generateActions('', ['fire'])

      class Caught {
        constructor() {
          this.x = 0
          this.bindListeners({ fire: actions.fire })

          this.on('error', () => {
            this.x = 1
          })
        }

        fire() {
          throw new Error('oops')
        }
      }

      const caught = alt.createStore('Caught', fromLegacyStore(Caught))

      const storeListener = sinon.spy()

      const listener = caught.subscribe(storeListener)

      assert(caught.getState().x === 0)
      assert.doesNotThrow(() => actions.fire())
      assert(caught.getState().x === 1)

      assert.ok(storeListener.calledOnce, 'the store always emits a change')

      listener.dispose()
    },
  }
}
