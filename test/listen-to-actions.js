import { assert } from 'chai'
import Alt from '../dist/alt-with-runtime'

import ActionListeners from '../utils/ActionListeners'

const alt = new Alt()

class MyActions {
  static displayName = 'ActionListenerActions'

  constructor() {
    this.generateActions('updateName')
  }
}

const myActions = alt.createActions(MyActions)

const listener = new ActionListeners(alt)

export default {
  'listen to actions globally'() {
    const id = listener.addActionListener(myActions.UPDATE_NAME, (name, details) => {
      assert(name === 'yes', 'proper data was passed in')
      assert(details.namespace === 'ActionListenerActions')
      assert(details.name === 'updateName')
    })

    assert.isString(id, 'the dispatcher id is returned for the listener')

    myActions.updateName('yes')

    listener.removeActionListener(id)

    assert.doesNotThrow(() => myActions.updateName('no'), 'no error was thrown by action since listener was removed')

    listener.addActionListener(myActions.UPDATE_NAME, (name) => {
      assert(name === 'mud', 'proper data was passed in again')
    })

    myActions.updateName('mud')

    listener.removeAllActionListeners()

    myActions.updateName('bill')
    assert.doesNotThrow(() => myActions.updateName('bill'), 'all listeners were removed')
  }
}
