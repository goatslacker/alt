var makeFinalStore = require('./makeFinalStore')

function atomicTransactions(alt) {
  var finalStore = makeFinalStore(alt)

  finalStore.listen(function () {
    alt.takeSnapshot()
  })

  return function (store) {
    store.failedDispatch = function () {
      alt.rollback()
    }

    return store
  }
}

module.exports = atomicTransactions
