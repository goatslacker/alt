import { assert } from 'chai'
import Alt from '../dist/alt-with-runtime'
import sinon from 'sinon'

export default {
  'catch failed dispatches': {
    'uncaught dispatches result in an error'() {
      const alt = new Alt()
      const actions = alt.generateActions('fire')

      class Uncaught {
        constructor() {
          this.bindListeners({ fire: actions.FIRE })
        }

        fire() {
          throw new Error('oops')
        }
      }

      const uncaught = alt.createStore(Uncaught)

      assert.throws(() => actions.fire())
    },

    'errors can be caught though'() {
      const alt = new Alt()
      const actions = alt.generateActions('fire')

      class Caught {
        constructor() {
          this.x = 0
          this.bindListeners({ fire: actions.FIRE })

          this.on('error', () => {
            this.x = 1
          })
        }

        fire() {
          throw new Error('oops')
        }
      }

      const caught = alt.createStore(Caught)

      const storeListener = sinon.spy()

      caught.listen(storeListener)

      assert(caught.getState().x === 0)
      assert.doesNotThrow(() => actions.fire())
      assert(caught.getState().x === 1)

      assert.notOk(storeListener.calledOnce, 'the store did not emit a change')

      caught.unlisten(storeListener)
    },

    'you have to emit changes yourself'() {
      const alt = new Alt()
      const actions = alt.generateActions('fire')

      class CaughtReturn {
        constructor() {
          this.x = 0
          this.bindListeners({ fire: actions.FIRE })

          this.on('error', () => {
            this.x = 1
            this.emitChange()
          })
        }

        fire() {
          throw new Error('oops')
        }
      }

      const caughtReturn = alt.createStore(CaughtReturn)

      const storeListener = sinon.spy()

      const dispose = caughtReturn.listen(storeListener)

      assert(caughtReturn.getState().x === 0)
      assert.doesNotThrow(() => actions.fire())
      assert(caughtReturn.getState().x === 1)

      assert.ok(storeListener.calledOnce)

      dispose()
    },
  }
}
