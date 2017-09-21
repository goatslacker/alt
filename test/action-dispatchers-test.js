const test = require('ava')

const Alt = require('../src/alt')

function testActionDispatchers(t, actionDispatchers) {
  t.true(
    typeof actionDispatchers.increment === 'function',
    'generates an increment action dispatcher'
  )
  t.truthy(
    actionDispatchers.increment.actionDetails,
    'actionDetails object exists'
  )

  const { name, type } = actionDispatchers.increment.actionDetails

  t.true(typeof name === 'string', 'A namespace exists')
  t.true(typeof type === 'string', 'The action has a type')
  t.true(name === 'increment', 'The name is deterministic')
}

test('generateActionDispatchers', t => {
  const alt = new Alt()
  const actionDispatchers = alt.generateActionDispatchers('increment')

  testActionDispatchers(t, actionDispatchers)
})

test('getActionDispatchers', t => {
  const alt = new Alt()
  const actionDispatchers = alt.getActionDispatchers('namespace', {
    increment: () => 1,
  })

  testActionDispatchers(t, actionDispatchers)

  t.true(
    actionDispatchers.increment.actionDetails.type === 'namespace/increment',
    'Type is deterministic'
  )
})
