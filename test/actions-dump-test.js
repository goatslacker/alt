import Alt from '../'
import { assert } from 'chai'
import actionsToObject from '../lib/compat/actionsToObject'

const alt = new Alt()

alt.generateActions('generated', ['one', 'two'])

alt.createActions('FooActions', actionsToObject(class FooActions {
  one() {}
  two() {}
}))

const pojo = alt.createActions('Pojo', {
  one() { },
  two() { }
})

alt.createActions('global', {
  one() { },
  two() { }
})

export default {
  'actions obj'() {
    assert.isObject(alt.actions, 'actions exist')
    assert(Object.keys(alt.actions.global).length === 2, 'only two actions exist which were the latest')
    assert(Object.keys(alt.actions.generated).length === 2, 'only two actions exist which were the latest')
    assert(Object.keys(alt.actions.FooActions).length === 2, '2 actions namespaced on FooActions')
    assert.isObject(alt.actions.Pojo, 'pojo named action exists')
    assert(Object.keys(alt.actions.Pojo).length == 2, 'pojo has 2 actions associated with it')
  },
}
