/* istanbul ignore next */
function NoopClass() { }

const builtIns = Object.getOwnPropertyNames(NoopClass)
const builtInProto = Object.getOwnPropertyNames(NoopClass.prototype)

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

export function warn(msg) {
  /* istanbul ignore else */
  if (typeof console !== 'undefined') {
    console.warn(new ReferenceError(msg))
  }
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
  this.dispatch(a.length ? [x].concat(a) : x)
}

export function events() {
  const subscriptions = {}

  const rm = (name, onChange) => {
    const id = subscriptions[name].indexOf(onChange)
    if (id >= 0) subscriptions[name].splice(id, 1)
  }

  return {
    subscribe(name, onChange) {
      subscriptions[name] = subscriptions[name] || []
      const id = subscriptions[name].push(onChange)
      const dispose = () => rm(onChange)
      return { dispose }
    },

    emit(name, state) {
      subscriptions[name].forEach(subscription => subscription(state))
    },

    rm
  }
}

