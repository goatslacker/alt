const sinon = require('sinon')
const test = require('ava')

const Alt = require('../src/alt')

test('Alt.Branch#respondToAll', t => {
  const alt = new Alt()

  const posts = alt.generateActionDispatchers('sortBy', 'filter')

  const spy = sinon.spy()

  class Posts extends Alt.Branch {
    constructor() {
      super()
      this.namespace = 'Posts'
      this.respondToAll(posts)
      this.state = {}
    }

    sortBy() {
      spy()
    }
  }

  const postsBranch = new Posts()
  const { responders } = postsBranch
  alt.addBranch(postsBranch)

  posts.sortBy('desc')

  t.true(spy.calledOnce)
  t.is(Object.keys(responders).length, 1)
})

test('Alt.Branch#respondTo', t => {
  const alt = new Alt()

  const posts = alt.generateActionDispatchers('sortBy', 'filter')

  const spy = sinon.spy()
  const spy2 = sinon.spy()

  class Posts extends Alt.Branch {
    constructor() {
      super()
      this.namespace = 'Posts'
      this.respondTo({
        calculateSorting: [posts.sortBy],
        filterPosts: posts.filter,
        catchAll: [posts.sortBy, posts.filter],
      })
      this.state = {}
    }

    calculateSorting() {
      spy()
    }

    filterPosts() {
      spy()
    }

    catchAll() {
      spy2()
    }
  }

  const postsBranch = new Posts()
  const { responders } = postsBranch
  t.is(Object.keys(responders).length, 2)

  alt.addBranch(postsBranch)

  posts.sortBy()
  t.is(spy.callCount, 1)

  posts.filter()
  t.is(spy.callCount, 2)

  t.is(spy2.callCount, 2)
})

test('Alt.Branch#setState', t => {
  const alt = new Alt()

  const drafts = alt.generateActionDispatchers('save')

  const spy = sinon.spy()

  class Inbox extends Alt.Branch {
    constructor() {
      super()
      this.namespace = 'Inbox'
      this.respondTo({
        saveAsDraft: [drafts.save],
      })
      this.state = {
        messages: {},
        drafts: {},
      }
    }

    saveAsDraft(draft) {
      const { id, text } = draft
      this.setState({
        drafts: Object.assign(this.state.drafts, { [id]: text })
      })
    }
  }

  const InboxBranch = alt.addBranch(new Inbox())

  t.is(InboxBranch.getState().drafts['Draft-01'], undefined)

  drafts.save({
    id: 'Draft-01',
    text: 'Hello, World!',
  })

  t.is(InboxBranch.getState().drafts['Draft-01'], 'Hello, World!')
})

test('Alt.Branch#setActionResponder bad action dispatcher', t => {
  const alt = new Alt()

  const badActionDispatcher = () => {}

  const getActionResponder = () => action => action

  const tmpBranch = new Alt.Branch()

  const err = t.throws(() => {
    tmpBranch.setActionResponder(badActionDispatcher, getActionResponder)
  })

  t.is(err.message, 'Action dispatcher is unknown')
})

test('Alt.Branch#setActionResponder bad action responder', t => {
  const alt = new Alt()

  const actionDispatchers = alt.getActionDispatchers('test', { test() { } })
  const getBadActionResponder = () => null

  const tmpBranch = new Alt.Branch()

  const err = t.throws(() => {
    tmpBranch.setActionResponder(actionDispatchers.test, getBadActionResponder)
  })

  t.is(
    err.message,
    'Action responder does not exist in branch (name "test", type "test/test")'
  )
})
