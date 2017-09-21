const test = require('ava')

const Alt = require('../src/alt')

test('Alt.getActionCreators', t => {
  const ac = Alt.getActionCreators('email', {
    get: id => id,
    send: () => 9001,
  })

  t.is(typeof ac.send, 'function')
  t.deepEqual(ac.send(), {
    type: 'email/send',
    payload: 9001,
    meta: {},
  })

  t.is(typeof ac.get, 'function')
  t.deepEqual(ac.get('1dc40f'), {
    type: 'email/get',
    payload: '1dc40f',
    meta: {},
  })
})
