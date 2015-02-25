module.exports = makeFinalStore

function FinalStore() {
  this.dispatcher.register(function (payload) {
    var stores = Object.keys(this.alt.stores).reduce(function (arr, store) {
      return arr.push(this.alt.stores[store].dispatchToken), arr
    }.bind(this), [])

    this.waitFor(stores)
    this.getInstance().emitChange()
  }.bind(this))
}

function makeFinalStore(alt) {
  return alt.createStore(FinalStore, 'AltFinalStore', false)
}
