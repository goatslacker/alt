import { assert } from 'chai'
import Alt from '../dist/alt-with-runtime'

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
    'when no actions are listened on': function () {
      const myStore = alt.createStore(NoActions)
      assert(myStore.boundListeners.length === 0, 'none are returned')
    },

    'when using bindAction': function () {
      const myStore = alt.createStore(OneAction)
      assert(myStore.boundListeners.length === 1)
      assert(myStore.boundListeners[0] === Actions.ONE)
    },

    'when using bindListeners': function () {
      const myStore = alt.createStore(TwoAction)
      assert(myStore.boundListeners.length === 1)
      assert(myStore.boundListeners[0] === Actions.TWO)
    },

    'when using bindActions': function () {
      const myStore = alt.createStore(BindActions)
      assert(myStore.boundListeners.length === 2)
      assert(
        myStore.boundListeners.indexOf(Actions.ONE) > -1 &&
        myStore.boundListeners.indexOf(Actions.TWO) > -1
      )
    },

    'dispatching actions': function () {
      const newAlt = new Alt()

      const one = newAlt.generateActions('one')
      const two = newAlt.generateActions('one')

      newAlt.createStore(function Store() {
        this.bindAction(one.one, (x) => {
          assert(x === 1)
        })
        this.bindAction(two.one, (x) => {
          assert(x === 2)
        })
      })

      newAlt.dispatch('global.one', 1)
      newAlt.dispatch('global.one1', 2)
    }
  }
}
