export const isFunction = x => typeof x === 'function'

export function isPojo(target) {
  const Ctor = target.constructor

  return (
    !!target
    &&
    typeof target === 'object'
    &&
    Object.prototype.toString.call(target) === '[object Object]'
    &&
    isFunction(Ctor)
    &&
    (Ctor instanceof Ctor || target.type === 'AltStore')
  )
}

export function isPromise(obj) {
  return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function'
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
