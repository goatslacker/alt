import Alt from '../'
import { assert } from 'chai'

const alt = new Alt()

const myActions = alt.generateActions('', ['updateName'])

export default {
  'binding a listener that does not exist'() {
    class BadListenerStore extends Alt.Store {
      constructor() {
        super()
        this.bindListeners({
          methodThatDoesNotExist: myActions.updateName
        })
      }
    }

    assert.throw(
      () => alt.createStore('BadListenerStore', new BadListenerStore()),
      ReferenceError,
      'methodThatDoesNotExist defined but does not exist in self'
    )
  },

  'binding listeners to action that does not exist'() {
    class BadListenerStore extends Alt.Store {
      constructor() {
        super()
        this.bindListeners({
          foo: myActions.trolololololol
        })
      }

      foo() { }
    }

    assert.throw(
      () => alt.createStore('BadListenerStore', new BadListenerStore()),
      TypeError
    )
  },

  'conflicting listeners on a store'() {
    class StoreWithManyListeners extends Alt.Store {
      constructor() {
        super()
        this.bindActions(myActions)
      }

      // listeners with same action
      updateName() { }
      onUpdateName() { }
    }

    assert.throw(
      () => alt.createStore('StoreWithManyListeners', new StoreWithManyListeners()),
      ReferenceError,
      'You have multiple handlers bound to an action: updateName and onUpdateName'
    )

    class EvilStore extends Alt.Store {
      updateName() { }
    }

    class InnocentStore extends EvilStore {
      constructor() {
        super()
        this.bindActions(myActions)
      }

      onUpdateName() { }
    }

    assert.throw(
      () => alt.createStore('InnocentStore', new InnocentStore()),
      ReferenceError,
      'You have multiple handlers bound to an action: updateName and onUpdateName'
    )
  },
}
