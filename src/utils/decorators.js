export function createActions(alt) {
  return function (Actions, ...args) {
    return alt.createActions(Actions, {}, ...args)
  }
}

export function createStore(alt) {
  return function (Store, ...args) {
    return alt.createStore(Store, undefined, ...args)
  }
}
