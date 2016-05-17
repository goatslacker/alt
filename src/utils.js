export function isFunction(t) {
  return (typeof t)[0] === 'f'
}

export function isMutableObject(target) {
  const Ctor = target.constructor

  return (
    !!target
    &&
    Object.prototype.toString.call(target) === '[object Object]'
    &&
    isFunction(Ctor)
    &&
    !Object.isFrozen(target)
    &&
    Ctor instanceof Ctor
  )
}

export function dispatchIdentity(x) {
  if (arguments.length > 1) return Array.from(arguments)
  return x === undefined ? null : x
}

export function id() {
  return Math.random().toString(18).substr(2, 16)
}
