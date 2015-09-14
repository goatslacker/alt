import { assign } from './functions'

/* istanbul ignore next */
function NoopClass() { }
const builtInProto = Object.getOwnPropertyNames(NoopClass.prototype)

function addMeta(description, decoration) {
  description.value.alt = description.value.alt || {}
  assign(description.value.alt, decoration)
  return description
}

export function decorate(context) {
  return (Store) => {
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
      if (meta.actions) {
        bindListeners[name] = meta.actions
      } else if (meta.actionsWithContext) {
        bindListeners[name] = meta.actionsWithContext(context)
      } else if (meta.publicMethod) {
        publicMethods[name] = proto[name]
      }
    })

    Store.config = assign({
      bindListeners,
      publicMethods,
    }, Store.config)

    return Store
  }
}

export function createActions(alt, ...args) {
  return (Actions) => {
    return alt.createActions(Actions, {}, ...args)
  }
}

export function createStore(alt, ...args) {
  return (Store) => {
    return alt.createStore(decorate(alt)(Store), undefined, ...args)
  }
}

export function bind(...actionIds) {
  return (obj, name, description) => {
    return addMeta(description, { actions: actionIds })
  }
}

export function bindWithContext(fn) {
  return (obj, name, description) => {
    return addMeta(description, { actionsWithContext: fn })
  }
}

export function expose(obj, name, description) {
  return addMeta(description, { publicMethod: true })
}

export function datasource(...sources) {
  const source = assign(...sources)
  return (Store) => {
    Store.config = assign({ datasource: source }, Store.config)
    return Store
  }
}
