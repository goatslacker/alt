const sinon = require('sinon')
const test = require('ava')

const Alt = require('../src/alt')

test('API', t => {
  const alt = new Alt()

  const altApi = [
    'generateActionDispatchers',
    'getActionDispatchers',
    'addBranch',
    'getState',
    'subscribe',
    'load',
    'serialize',
    'revert',
  ]

  altApi.forEach(method => (
    t.true(typeof alt[method] === 'function', `${method} is a function`)
  ))
})

test('getState', t => {
  const alt = new Alt()

  t.is(alt.getState(), alt.store.getState())
})

test('subscribe', t => {
  const alt = new Alt()

  const { dispose } = alt.subscribe(() => {})
  t.is(typeof dispose, 'function')
  dispose()
})

test('addReducer', t => {
  const alt = new Alt()
  const state = { hi: '^_^' }

  const spy = sinon.stub().returns(state)
  alt.addReducer('spyReducer', spy)

  const action = { type: 'foo', payload: 'bar' }

  alt.store.dispatch(action)
  t.true(spy.calledWith(state, action))

  t.is(alt.getState().spyReducer.hi, '^_^')
})
