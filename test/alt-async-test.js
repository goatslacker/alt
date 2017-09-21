const test = require('ava')

const Alt = require('../src/alt')

test('Alt Async', async t => {
  const alt = new Alt()

  const callOrder = []

  const drafts = alt.getActionDispatchers('drafts', {
    save(draft) {
      return Alt.asyncDispatch(draft, {
        onSuccess: () => callOrder.push(3),
      })
    },
  })

  class Inbox extends Alt.Branch {
    constructor() {
      super()

      this.namespace = 'Inbox'

      this.state = {
        messages: {},
        drafts: {},
      }

      this.respondToAsync(drafts.save, {
        start: this.startSavingDraft.bind(this),
        finish: this.finishSavingDraft.bind(this),
        success: this.draftSaved.bind(this),
      })
    }

    startSavingDraft() {
      callOrder.push(0)
    }

    draftSaved(draft) {
      callOrder.push(1)
      const { id, text } = draft
      this.setState({
        drafts: Object.assign(this.state.drafts, { [id]: text })
      })
    }

    finishSavingDraft() {
      callOrder.push(2)
    }
  }

  const InboxBranch = alt.addBranch(new Inbox())

  t.is(InboxBranch.getState().drafts['Draft-01'], undefined)

  await drafts.save({
    id: 'Draft-01',
    text: 'Hello, World!',
  }).promise.then(() => {
    callOrder.push(4)

    t.is(InboxBranch.getState().drafts['Draft-01'], 'Hello, World!')
    callOrder.forEach((x, i) => t.is(x, i, 'Call order correct'))
  })
})
