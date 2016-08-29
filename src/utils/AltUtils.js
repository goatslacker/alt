import * as fn from '../functions'

/*eslint-disable*/
const builtIns = Object.getOwnPropertyNames(NoopClass)
const builtInProto = Object.getOwnPropertyNames(NoopClass.prototype)
/*eslint-enable*/

export function getInternalMethods(Obj, isProto) {
  const excluded = isProto ? builtInProto : builtIns
  const obj = isProto ? Obj.prototype : Obj
  return Object.getOwnPropertyNames(obj).reduce((value, m) => {
    if (excluded.indexOf(m) !== -1) {
      return value
    }

    value[m] = obj[m]
    return value
  }, {})
}

export function getPrototypeChain(Obj, methods = {}) {
  return Obj === Function.prototype
    ? methods
    : getPrototypeChain(
        Object.getPrototypeOf(Obj),
        fn.assign(getInternalMethods(Obj, true), methods)
      )
}

export function warn(msg) {
  /* istanbul ignore else */
  /*eslint-disable*/
  if (typeof console !== 'undefined') {
    console.warn(new ReferenceError(msg))
  }
  /*eslint-enable*/
}

export function uid(container, name) {
  let count = 0
  let key = name
  while (Object.hasOwnProperty.call(container, key)) {
    key = name + String(++count)
  }
  return key
}

export function formatAsConstant(name) {
  return name.replace(/[a-z]([A-Z])/g, (i) => {
    return `${i[0]}_${i[1].toLowerCase()}`
  }).toUpperCase()
}

export function dispatchIdentity(x, ...a) {
  if (x === undefined) return null
  return a.length ? [x].concat(a) : x
}

export function fsa(id, type, payload, details) {
  return {
    type,
    payload,
    meta: {
      dispatchId: id,
      ...details,
    },

    id,
    action: type,
    data: payload,
    details,
  }
}

export function dispatch(id, actionObj, payload, alt) {
  const data = actionObj.dispatch(payload)
  if (data === undefined) return null

  const type = actionObj.id
  const namespace = type
  const name = type
  const details = { id: type, namespace, name }

  const dispatchLater = x => alt.dispatch(type, x, details)

  if (fn.isFunction(data)) return data(dispatchLater, alt)

    // XXX standardize this
  return alt.dispatcher.dispatch(fsa(id, type, data, details))
}

/* istanbul ignore next */
function NoopClass() { }
