/**
 * makeFinalStore(alt: AltInstance): AltStore
 *
 * > Creates a `FinalStore` which is a store like any other except that it
 * waits for all other stores in your alt instance to emit a change before it
 * emits a change itself.
 *
 * Want to know when a particular dispatch has completed? This is the util
 * you want.
 *
 * Good for: taking a snapshot and persisting it somewhere, saving data from
 * a set of stores, syncing data, etc.
 *
 * Usage:
 *
 * ```js
 * var FinalStore = makeFinalStore(alt);
 *
 * FinalStore.listen(function () {
 *   // all stores have now changed
 * });
 * ```
 */

function FinalStore() {
  this.dispatcher.register((payload) => {
    const stores = Object.keys(this.alt.stores).reduce((arr, store) => {
      arr.push(this.alt.stores[store].dispatchToken)
      return arr
    }, [])

    this.waitFor(stores)
    this.setState({ payload: payload })
    this.emitChange()
  })
}

export default function makeFinalStore(alt) {
  return alt.FinalStore
    ? alt.FinalStore
    : (alt.FinalStore = alt.createUnsavedStore(FinalStore))
}
