import {assert} from 'chai'
import Alt from '../dist/alt-with-runtime'

import ActionListeners from '../utils/ActionListeners'

let alt = new Alt()

class MyActions {
  constructor() {
    this.generateActions('updateName')
  }
}

let myActions = alt.createActions(MyActions)

let listener = new ActionListeners(alt)

export default {
  'listen to actions globally'() {
    let id = listener.addActionListener(myActions.UPDATE_NAME, (name) => {
      assert.equal(name, 'yes', 'proper data was passed in')
    })

    assert.equal(typeof id, 'string', 'the dispatcher id is returned for the listener')

    myActions.updateName('yes')

    listener.removeActionListener(id)

    myActions.updateName('no')
    assert.equal(true, true, 'no error was thrown by above action since listener was removed')

    listener.addActionListener(myActions.UPDATE_NAME, (name) => {
      assert.equal(name, 'mud', 'proper data was passed in again')
    })

    myActions.updateName('mud')

    listener.removeAllActionListeners()

    myActions.updateName('bill')

    assert.equal(true, true, 'all listeners were removed')
  }
}
