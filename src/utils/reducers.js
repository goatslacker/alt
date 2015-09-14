import { assign } from './functions'

function getId(x) {
  return x.id || x
}

/* istanbul ignore next */
function shallowEqual(a, b) {
  if (typeof a !== 'object' || typeof b !== 'object') return a === b
  if (a === b) return true
  if (!a || !b) return false
  for (const k in a) {
    if (a.hasOwnProperty(k) && (!b.hasOwnProperty(k) || a[k] !== b[k])) {
      return false
    }
  }
  for (const k in b) {
    if (b.hasOwnProperty(k) && !a.hasOwnProperty(k)) {
      return false
    }
  }
  return true
}

export function combine(...restReducers) {
  const reducers = assign.apply(null, [{}].concat(restReducers))
  return function combinedReducer(state, payload) {
    const newState = reducers.hasOwnProperty(payload.action)
      ? reducers[payload.action](state, payload.data)
      : state

    if (shallowEqual(state, newState)) this.preventDefault()

    return newState
  }
}

export function reduceWith(actions, reduce) {
  return actions.reduce((total, action) => {
    total[getId(action)] = reduce
    return total
  }, {})
}
