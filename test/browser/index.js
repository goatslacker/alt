const assign = require('object-assign')

const tests = assign(
  {},
  require('../index'),
  require('../listen-to-actions'),
  require('../final-store'),
  require('../recorder'),
  require('../setting-state'),
  require('../stores-get-alt'),
  require('../stores-with-colliding-names'),
  require('../testing-utils'),
  require('../use-event-emitter'),
  require('../store-as-a-module'),
  require('../es3-module-pattern')
)

// This code is directly from mocha/lib/interfaces/exports.js
// with a few modifications
function manualExports(exports, suite) {
  var suites = [suite]

  visit(exports)

  function visit(obj) {
    var suite
    for (var key in obj) {
      if ('function' == typeof obj[key]) {
        var fn = obj[key]
        switch (key) {
          case 'before':
            suites[0].beforeAll(fn)
            break
          case 'after':
            suites[0].afterAll(fn)
            break
          case 'beforeEach':
            suites[0].beforeEach(fn)
            break
          case 'afterEach':
            suites[0].afterEach(fn)
            break
          default:
            suites[0].addTest(new Mocha.Test(key, fn))
        }
      } else {
        var suite = Mocha.Suite.create(suites[0], key)
        suites.unshift(suite)
        visit(obj[key])
        suites.shift()
      }
    }
  }
}

manualExports(tests, mocha.suite)

mocha.setup('exports')
mocha.checkLeaks()
mocha.run()
