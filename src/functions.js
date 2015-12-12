export const isFunction = x => typeof x === 'function'

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
    (Ctor instanceof Ctor || target.type === 'AltStore')
  )
}

export function eachObject(f, o) {
  o.forEach((from) => {
    Object.keys(Object(from)).forEach((key) => {
      f(key, from[key])
    })
  })
}

export function assign(target, ...source) {
  eachObject((key, value) => target[key] = value, source)
  return target
}
