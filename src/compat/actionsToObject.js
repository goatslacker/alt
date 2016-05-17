function NoopClass() { }
const builtInProto = Object.getOwnPropertyNames(NoopClass.prototype)

function getInternalMethods(Obj) {
  const obj = Obj.prototype
  return Object.getOwnPropertyNames(obj).reduce((value, m) => {
    if (builtInProto.indexOf(m) !== -1) {
      return value
    }

    value[m] = obj[m]
    return value
  }, {})
}

function getPrototypeChain(Obj, methods) {
  return Obj === Function.prototype
    ? methods
    : getPrototypeChain(
        Object.getPrototypeOf(Obj),
        Object.assign(getInternalMethods(Obj), methods)
      )
}

export default function actionsToObject(X) {
  const x = new X()
  return Object.assign(getPrototypeChain(X, {}), x)
}
