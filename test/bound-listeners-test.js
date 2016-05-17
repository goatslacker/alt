import Alt, { Store } from '../'
import { assert } from 'chai'

const alt = new Alt()

const Actions = alt.generateActions('', ['one', 'two', 'three'])

class NoActions extends Store {
  constructor() {
    super()
    this.bindActions(Actions)
  }

  foo() { }
  bar() { }
}

class OneAction extends Store {
  constructor() {
    super()
    this.bindAction(Actions.one, this.one)
  }

  one() { }
}

class TwoAction extends Store {
  constructor() {
    super()
    this.bindListeners({
      two: Actions.two
    })
  }

  two() { }
}

class BindActions extends Store {
  constructor() {
    super()
    this.bindActions(Actions)
  }

  one() { }
  two() { }
}


export default {
  'Exporting listener names': {
    'when no actions are listened on'() {
      assert(new NoActions().boundListeners.length === 0, 'none are returned')
    },

    'when using bindAction'() {
      const myStore = new OneAction()
      assert(myStore.boundListeners.length === 1)
      assert(myStore.boundListeners[0] === Actions.one.type)
    },

    'when using bindListeners'() {
      const myStore = new TwoAction()
      assert(myStore.boundListeners.length === 1)
      assert(myStore.boundListeners[0] === Actions.two.type)
    },

    'when using bindActions'() {
      const myStore = new BindActions()
      assert(myStore.boundListeners.length === 2)
      assert(
        myStore.boundListeners.indexOf(Actions.one.type) > -1 &&
        myStore.boundListeners.indexOf(Actions.two.type) > -1
      )
    },
  }
}
