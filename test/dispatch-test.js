const sinon = require('sinon')
const test = require('ava')

const Alt = require('../src/alt')

test('dispatches can be prevented', t => {
  const alt = new Alt()

  const spy = sinon.spy()

  const actionDispatchers = alt.getActionDispatchers('test', {
    dontDispatch: () => Alt.PREVENT_DISPATCH,
    definitelyDispatch: () => 1,
  })

  alt.store.subscribe(spy)

  actionDispatchers.dontDispatch()
  t.is(spy.callCount, 0)

  actionDispatchers.definitelyDispatch()
  t.is(spy.callCount, 1)

  actionDispatchers.definitelyDispatch()
  t.is(spy.callCount, 2)

  actionDispatchers.dontDispatch()
  t.is(spy.callCount, 2)
})
