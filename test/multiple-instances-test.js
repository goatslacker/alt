import Alt from '../'
import { assert } from 'chai'

class MyActions {
  constructor() {
    this.updateName = name => name
  }
}

class MyStore extends Alt.Store {
  constructor(alt) {
    super()
    this.bindActions(alt.actions.myActions)
    this.state = { name: 'first' }
  }

  updateName(name) {
    this.setState({ name })
  }
}

class AltInstance extends Alt {
  constructor() {
    super()
    this.createActions('myActions', new MyActions())
    this.generateActions('fauxActions', ['one', 'two'])
    this.createStore('myStore', new MyStore(this))
  }
}

const altInstance = new AltInstance()

const alt = new Alt()
alt.createActions('myActions', new MyActions())
const myStore = alt.createStore('myStore', new MyStore(alt))

// Really confusing set of instances
const alt1 = new Alt()
const alt2 = new Alt()

function NameActions() {
  this.updateName = name => name
}

const nameActions1 = alt1.createActions('nameActions1', new NameActions())
const nameActions2 = alt2.createActions('nameActions2', new NameActions())

function NameStore() {
  Alt.Store.call(this)

  this.bindActions(nameActions1)
  this.bindActions(nameActions2)

  this.state = { name: 'foo' }
}

NameStore.prototype = Object.create(Alt.Store.prototype)
NameStore.prototype.constructor = Alt.Store

NameStore.prototype.onUpdateName = function (name) {
  this.setState({ name })
}

const nameStore1 = alt1.createStore('NameStore1', new NameStore())
const nameStore2 = alt2.createStore('NameStore2', new NameStore())

export default {
  beforeEach() {
    alt.flush()
    alt1.flush()
    alt2.flush()
    altInstance.flush()
  },

  'alt single instances'() {
    assert.instanceOf(altInstance, Alt, 'altInstance is an instance of alt')
    assert.isFunction(altInstance.publish, 'it has a dispatcher')
    assert.isFunction(altInstance.load, 'bootstrap function exists')
    assert.isFunction(altInstance.createActions, 'createActions function')
    assert.isFunction(altInstance.createStore, 'createStore function')

    const myActionsFromInst = altInstance.actions.myActions
    assert.isObject(myActionsFromInst, 'the actions exist')

    const fauxActions = altInstance.actions.fauxActions
    assert.isFunction(fauxActions.one, 'faux actions were generated')

    const myActionsFail = altInstance.actions.ActionsThatDontExist
    assert.isUndefined(myActionsFail, 'undefined actions')

    myActionsFromInst.updateName('lion')
    assert(altInstance.stores.myStore.getState().name === 'lion', 'state was updated')
    assert(myStore.getState().name === 'first', 'and other singleton store was not affected')
  },

  'multiple alt instances'() {
    nameActions1.updateName('bar')
    nameActions2.updateName('baz')

    assert(nameStore1.getState().name === 'bar', 'store 1 state is set')
    assert(nameStore2.getState().name === 'baz', 'this store has different state')
    assert(altInstance.stores.myStore.getState().name === 'first', 'other stores not affected')
    assert(myStore.getState().name === 'first', 'other singleton store not affected')
  },
}
