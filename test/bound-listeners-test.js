import Alt from '../dist/alt-with-runtime'
import { assert } from 'chai'

const alt = new Alt()

const Actions = alt.generateActions('one', 'two', 'three')

class NoActions {
  constructor() {
    this.bindActions(Actions)
  }

  foo() { }
  bar() { }
}

class OneAction {
  constructor() {
    this.bindAction(Actions.ONE, this.one)
  }

  one() { }
}

class TwoAction {
  constructor() {
    this.bindListeners({
      two: Actions.TWO
    })
  }

  two() { }
}

class BindActions {
  constructor() {
    this.bindActions(Actions)
  }

  one() { }
  two() { }
}


export default {
  'Exporting listener names': {
    'when no actions are listened on'() {
      const myStore = alt.createStore(NoActions)
      assert(myStore.boundListeners.length === 0, 'none are returned')
    },

    'when using bindAction'() {
      const myStore = alt.createStore(OneAction)
      assert(myStore.boundListeners.length === 1)
      assert(myStore.boundListeners[0] === Actions.ONE)
    },

    'when using bindListeners'() {
      const myStore = alt.createStore(TwoAction)
      assert(myStore.boundListeners.length === 1)
      assert(myStore.boundListeners[0] === Actions.TWO)
    },

    'when using bindActions'() {
      const myStore = alt.createStore(BindActions)
      assert(myStore.boundListeners.length === 2)
      assert(
        myStore.boundListeners.indexOf(Actions.ONE) > -1 &&
        myStore.boundListeners.indexOf(Actions.TWO) > -1
      )
    },

    'dispatching actions'() {
      const alt = new Alt()

      const one = alt.generateActions('one')
      const two = alt.generateActions('one')

      const store = alt.createStore(function Store() {
        this.bindAction(one.one, function (x) {
          assert(x === 1)
        })
        this.bindAction(two.one, function (x) {
          assert(x === 2)
        })
      })

      alt.dispatch('global.one', 1)
      alt.dispatch('global.one1', 2)
    },
  }
}
