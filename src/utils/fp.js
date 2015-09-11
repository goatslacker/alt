const { push } = Array.prototype

// Disabling no-shadow so we can sanely curry
/* eslint-disable no-shadow */
export function map(fn, stores) {
  return stores
    ? stores.map(store => fn(store.state))
    : stores => map(fn, stores)
}

export function filter(fn, stores) {
  return stores
    ? stores.filter(store => fn(store.state))
    : stores => filter(fn, stores)
}

export function reduce(fn, stores, acc = {}) {
  return stores
    ? stores.reduce((acc, store) => fn(acc, store.state), acc)
    : stores => reduce(fn, stores)
}

export function flatMap(fn, stores) {
  if (!stores) return (stores) => flatMap(fn, stores)

  return stores.reduce((result, store) => {
    const value = fn(store.state)
    if (Array.isArray(value)) {
      push.apply(result, value)
    } else {
      result.push(value)
    }
    return result
  }, [])
}

export function zipWith(fn, a, b) {
  if (!a && !b) {
    return (a, b) => zipWith(fn, a, b)
  }

  const length = Math.min(a.length, b.length)
  const result = Array(length)
  for (let i = 0; i < length; i += 1) {
    result[i] = fn(a[i].state, b[i].state)
  }
  return result
}
