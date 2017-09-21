const sinon = require('sinon')
const test = require('ava')

const Alt = require('../src/alt')

function createNewBranch(alt = new Alt()) {
  const actionDispatchers = alt.generateActionDispatchers('increment')

  class MyBranch extends Alt.Branch {
    constructor() {
      super()
      this.namespace = 'MyBranch'
      this.state = { count: 0 }
      this.respondTo({
        increment: actionDispatchers.increment,
      })
    }

    increment() {
      this.setState({ count: this.state.count + 1 })
    }
  }

  const branch = alt.addBranch(new MyBranch())

  return { alt, actionDispatchers, branch }
}

test('addBranch', t => {
  const { branch } = createNewBranch()

  t.truthy(branch, 'A reference to the branch is returned')

  t.true(
    typeof branch.subscribe === 'function',
    'Branch has a subscribe function'
  )
  t.true(
    typeof branch.getState === 'function',
    'Branch has a getState function'
  )
})

test('Branch exists', t => {
  const alt = new Alt()
  createNewBranch(alt)
  const err = t.throws(() => createNewBranch(alt))
  t.is(err.message, 'A branch with this name already exists (name "MyBranch")')
})

test('Branch subscriptions', t => {
  const { actionDispatchers, branch } = createNewBranch()

  const spy = sinon.spy()

  t.is(typeof branch.getState, 'function')
  t.is(typeof branch.subscribe, 'function')

  branch.subscribe(spy)

  actionDispatchers.increment()
  actionDispatchers.increment()

  t.is(spy.callCount, 2)
})

test('No namespace branch', t => {
  const alt = new Alt()

  const err = t.throws(() => {
    alt.addBranch({})
  })

  t.is(err.message, 'Branch was provided without a namespace')
})

test('otherwise', t => {
  const alt = new Alt()

  const ac = Alt.getActionCreators('test', {
    test: x => x,
  })

  class MyBranch extends Alt.Branch {
    constructor() {
      super()
      this.namespace = 'MyBranch'
      this.state = { count: 0 }
    }

    otherwise(action) {
      if (action.type === 'test/test') {
        this.setState({ count: this.state.count + 1 })
      }
    }
  }

  const branch = alt.addBranch(new MyBranch())

  t.is(branch.getState().count, 0)

  alt.store.dispatch(ac.test(1))
  t.is(branch.getState().count, 1)

  alt.store.dispatch(ac.test(1))
  t.is(branch.getState().count, 2)

  alt.store.dispatch(ac.test(1))
  t.is(branch.getState().count, 3)
})
