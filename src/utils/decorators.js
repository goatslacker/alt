import { assign } from './functions'

/* istanbul ignore next */
function NoopClass() { }
const builtInProto = Object.getOwnPropertyNames(NoopClass.prototype)

function addMeta(description, decoration) {
  description.value.alt = description.value.alt || {}
  assign(description.value.alt, decoration)
  return description
}

export function createActions(alt, ...args) {
  return function (Actions) {
    return alt.createActions(Actions, {}, ...args)
  }
}

export function createStore(alt, ...args) {
  return function (Store) {
    const proto = Store.prototype
    const publicMethods = {}
    const bindListeners = {}

    Object.getOwnPropertyNames(proto).forEach((name) => {
      if (builtInProto.indexOf(name) !== -1) return

      const meta = proto[name].alt
      if (!meta) {
        return
      }

      /* istanbul ignore else */
      if (meta.action) {
        bindListeners[name] = meta.action
      } else if (meta.publicMethod) {
        publicMethods[name] = proto[name]
      }
    })

    Store.config = assign({
      bindListeners,
      publicMethods
    }, Store.config)

    return alt.createStore(Store, undefined, ...args)
  }
}

export function bind(...actionIds) {
  return (obj, name, description) => {
    return addMeta(description, { action: actionIds })
  }
}

export function expose(obj, name, description) {
  return addMeta(description, { publicMethod: true })
}
