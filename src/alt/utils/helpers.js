'use strict'

/* istanbul ignore next */
function NoopClass() { }

export const builtIns = Object.getOwnPropertyNames(NoopClass)
export const builtInProto = Object.getOwnPropertyNames(NoopClass.prototype)

export function getInternalMethods(obj, excluded) {
  return Object.getOwnPropertyNames(obj).reduce((value, m) => {
    if (excluded.indexOf(m) !== -1) {
      return value
    }

    value[m] = obj[m]
    return value
  }, {})
}
