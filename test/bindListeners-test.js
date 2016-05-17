import Alt from '../'
import { assert } from 'chai'
import sinon from 'sinon'

const alt = new Alt()

export default {
  'lots of listens'() {
    const call = sinon.spy()

    const ImportKeysActions = alt.generateActions('', ['change', 'saved'])

    class BalanceClaimStore extends Alt.Store {
      constructor() {
        super()
        this.bindListeners({
          onRefreshBalanceClaims: ImportKeysActions.saved,
          onLoadMyAccounts: [
            ImportKeysActions.change, ImportKeysActions.saved
          ]
        })
      }

      onRefreshBalanceClaims() {
        call()
      }

      onLoadMyAccounts() {
        call()
      }
    }

    alt.createStore('BalanceClaimStore', new BalanceClaimStore())

    ImportKeysActions.saved()

    assert(call.calledTwice, 'multiple action handlers are ok')
  },
}
