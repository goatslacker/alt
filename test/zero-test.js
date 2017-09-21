const sinon = require('sinon')
const test = require('ava')

const Alt = require('../src/zero')

test('AwfulStore', t => {
  const alt = new Alt()

  const actionDispatchers = alt.generateActions('fire')

  class AwfulStore extends Alt.Store {
    constructor(initVal) {
      super()
      this.bindActions(actionDispatchers)
      this.x = initVal
    }

    fire() {
      this.x += 1
    }
  }

  const x = alt.createAwfulStore(AwfulStore, 'AwfulStore', 1)

  t.deepEqual(Object.keys(x.getState()), ['x'])

  t.is(x.getState().x, 1)

  actionDispatchers.fire()
  actionDispatchers.fire()
  actionDispatchers.fire()
  actionDispatchers.fire()

  t.is(x.getState().x, 5)

  alt.load({
    AwfulStore: { x: 9 },
  })

  t.is(x.getState().x, 9)

  actionDispatchers.fire()

  t.is(x.getState().x, 10)
})

test('GoodStore', t => {
  const alt = new Alt()

  const actionDispatchers = alt.generateActionDispatchers('openModal')

  class GoodStore extends Alt.Store {
    constructor() {
      super()

      this.state = {
        modalOpened: false,
      }
      this.bindListeners({
        openModal: actionDispatchers.openModal,
      })
    }

    openModal() {
      this.setState({
        modalOpened: true,
      })
    }
  }

  const store = alt.createStore(GoodStore, 'GoodStore')

  t.is(store.getState().modalOpened, false)

  actionDispatchers.openModal()

  t.is(store.getState().modalOpened, true)

  alt.load({
    GoodStore: {
      modalOpened: 3,
    },
  })

  t.is(store.getState().modalOpened, 3)

  t.notThrows(() => {
    store.unlisten(() => {})
  })
})

test('exportPublicMethods', t => {
  const alt = new Alt()

  class MethodyStore extends Alt.Store {
    constructor() {
      super()
      this.state = {}
      this.exportPublicMethods({
        foo: this.foo.bind(this),
      })
    }

    foo(v) {
      return v
    }
  }

  const store = alt.createStore(MethodyStore, 'MethodyStore')

  t.is(typeof store.foo, 'function')
  t.is(store.foo(7), 7)
})

test('bad registerAsync', t => {
  const alt = new Alt()

  const BadSource = {
    fetchUsers() {
      return {
        remote: () => {},
        local: () => {},
        success: () => {},
      }
    },
  }

  class Store extends Alt.Store {
    constructor() {
      super()
      this.registerAsync(BadSource)
    }
  }

  t.throws(() => {
    alt.createStore(Store, 'Store')
  })
})

test('exportAsync', async t => {
  const alt = new Alt()

  const remote = sinon.stub().returns(Promise.resolve([1, 2, 3, 4]))

  const StargazerActions = alt.generateActionDispatchers(
    'fetchingUsers',
    'usersReceived',
    'failed'
  )

  const StargazerSource = {
    fetchUsers() {
      return {
        remote,
        local: state => state.users.length ? state.users : null,
        loading: StargazerActions.fetchingUsers,
        success: StargazerActions.usersReceived,
        error: StargazerActions.failed,
      }
    },
  }

  const StargazerStore = alt.createStore(class extends Alt.Store {
    constructor() {
      super()

      this.state = {
        errorMessage: null,
        isLoading: false,
        repo: 'alt',
        user: 'goatslacker',
        users: [],
      }

      this.exportAsync(StargazerSource)

      this.bindListeners({
        loading: StargazerActions.fetchingUsers,
        receivedUsers: StargazerActions.usersReceived,
        failed: StargazerActions.failed,
      })
    }

    loading() {
      this.setState({ isLoading: true })
    }

    failed(e) {
      this.setState({ errorMessage: e.statusText || String(e) })
    }

    receivedUsers(users) {
      this.setState({ users, errorMessage: null })
    }
  }, 'StargazerStore')

  const spy = sinon.spy()
  let callCount = 0

  const unsubscribe = StargazerStore.listen((state) => {
    callCount += 1

    if (callCount >= 2) {
      unsubscribe()
      t.is(state.users.length, 4)
      t.is(remote.callCount, 1)
      t.false(StargazerStore.isLoading())
      spy(state.users)
    }
  })

  t.false(StargazerStore.isLoading())

  t.is(typeof StargazerStore.fetchUsers, 'function')
  await StargazerStore.fetchUsers()

  t.is(spy.callCount, 1)
  t.true(spy.calledWith([1, 2, 3, 4]))
  t.false(StargazerStore.isLoading())
  t.deepEqual(StargazerStore.getState().users, [1, 2, 3, 4])

  StargazerActions.usersReceived([1, 2, 3])

  const unsubscribe2 = StargazerStore.listen((state) => {
    unsubscribe2()
    t.is(state.users.length, 3)
    t.false(StargazerStore.isLoading())
  })

  await StargazerStore.fetchUsers()
  t.is(remote.callCount, 1)
  t.deepEqual(StargazerStore.getState().users, [1, 2, 3])
})

test('async error', async t => {
  const alt = new Alt()

  const { success, error } = alt.generateActions('success', 'error')

  const shouldFetch = () => true
  const remote = () => Promise.reject(':<')

  const ErrorSource = {
    go() {
      return {
        error,
        remote,
        shouldFetch,
        success,
      }
    },
  }

  const spy = sinon.spy()

  class Store extends Alt.Store {
    constructor() {
      super()
      this.registerAsync(ErrorSource)
      this.bindActions({ error })
    }

    error(err) {
      spy(err)
    }
  }

  const store = alt.createStore(Store, 'Store')

  const storeErr = await store.go().catch(err => err)

  t.is(spy.callCount, 1)
  t.true(spy.calledWith(':<'))
  t.is(storeErr, ':<')
})

test('bindAction', t => {
  const alt = new Alt()

  const { foo } = alt.generateActionDispatchers('foo')
  const spy = sinon.spy()

  class Store extends Alt.Store {
    constructor() {
      super()
      this.bindAction(foo, this.foo.bind(this))
    }

    foo() {
      spy()
    }
  }

  const store = alt.createStore(Store, 'Store')

  foo()

  t.true(spy.calledOnce)
})

test('lifecycle stores', t => {
  const alt = new Alt()

  const { foo } = alt.generateActionDispatchers('foo')
  const afterEach = sinon.spy()
  const beforeEach = sinon.spy()
  const errorSpy = sinon.spy()
  const genSpy = sinon.spy()

  class Store extends Alt.Store {
    constructor() {
      super()
      this.on('afterEach', afterEach)
      this.on('beforeEach', beforeEach)
      this.on('error', errorSpy)
      this.on('init', genSpy)
      this.on('unlisten', genSpy)

      this.bindAction(foo, x => {
        if (x) throw x
      })
    }
  }

  const store = alt.createStore(Store, 'Store')

  t.is(genSpy.callCount, 1)
  t.true(genSpy.calledWith(undefined))

  const unlisten = store.listen(() => {})
  unlisten()

  t.is(genSpy.callCount, 2)
  t.true(genSpy.calledWith(undefined))

  t.is(beforeEach.callCount, 0)
  t.is(afterEach.callCount, 0)
  foo()
  t.is(beforeEach.callCount, 1)
  t.is(afterEach.callCount, 1)

  foo(new Error('Oops'))
  t.is(errorSpy.callCount, 1)
  t.is(beforeEach.callCount, 2)
  t.is(afterEach.callCount, 2)

  class OwnErrors extends Alt.Store {
    constructor() {
      super()
      this.bindAction(foo, x => {
        if (x) throw x
      })
    }
  }

  alt.createStore(OwnErrors, 'OwnErrors')

  t.throws(() => {
    foo(new Error('Again'))
  }, 'Again')
})

test('createActions', t => {
  const alt = new Alt()

  const foo = sinon.spy()
  const foo2 = sinon.spy()
  const fooResponder = sinon.spy()

  const actions = {
    foo() {
      foo()
      return 99
    },
  }

  class Actions {
    foo() {
      this.dispatch(21)
      foo2()
    }
  }

  const one = alt.createActions(actions)
  const two = alt.createActions(Actions)

  class Branch extends Alt.Branch {
    constructor() {
      super()
      this.namespace = 'Just Testing'
      this.state = {}
      this.respondTo({
        test: two.foo,
      })
    }

    test(payload) {
      fooResponder(payload)
    }
  }
  alt.addBranch(new Branch())

  t.is(typeof one.foo, 'function')
  t.is(typeof two.foo, 'function')

  t.is(foo.callCount, 0)
  one.foo()
  t.is(foo.callCount, 1)

  t.is(foo2.callCount, 0)
  two.foo()
  t.is(foo2.callCount, 1)
  t.is(fooResponder.callCount, 1)
  t.true(fooResponder.calledWith(21))
})

test('bootstrap/snapshot', t => {
  const alt = new Alt()

  t.is(typeof alt.bootstrap, 'function')
  t.is(typeof alt.takeSnapshot, 'function')
  t.is(typeof alt.flush, 'function')

  alt.bootstrap('{}')
  alt.bootstrap({})
  alt.takeSnapshot()
  alt.flush()
})
