const test = require('ava')

const Alt = require('../src/alt')

test(t => {
  const alt = new Alt()

  const branch = alt.addBranch({
    namespace: 'RevertMe',
    state: { x: 11 },
    responders: {},
  })

  t.is(branch.getState().x, 11)

  alt.load({
    RevertMe: { x: 34 }
  })

  t.is(branch.getState().x, 34)

  alt.revert()

  t.is(branch.getState().x, 11)
})
