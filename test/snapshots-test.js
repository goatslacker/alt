const test = require('ava')

const Alt = require('../src/alt')

test('load', t => {
  const alt = new Alt()

  const branch = alt.addBranch({
    namespace: 'WillBeLoaded',
    state: { x: 0 },
    responders: {},
  })

  t.is(branch.getState().x, 0)

  alt.load({
    WillBeLoaded: { x: 1 }
  })

  t.is(branch.getState().x, 1)
})

test('serialize', t => {
  const alt = new Alt()

  const state =  { a: 1, b: 2, c: 3 }

  const branch = alt.addBranch({
    namespace: 'ToSerialize',
    state,
    responders: {},
  })

  const json = alt.serialize()

  t.true(typeof json === 'string', 'serialize returns a string')
  t.is(JSON.stringify({ ToSerialize: state }), json)
})
