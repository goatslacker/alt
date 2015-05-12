import Symbol from 'es-symbol'

import * as Sym from '../symbols/symbols'
import * as utils from '../utils/AltUtils'

class AltAction {
  constructor(alt, id, action, actions, actionDetails) {
    this.id = id
    this._dispatch = action.bind(this)
    this.actions = actions
    this.actionDetails = actionDetails
    this.alt = alt
  }

  dispatch(data) {
    this.alt.dispatch(this.id, data, this.actionDetails)
  }
}

export default function makeAction(alt, namespace, name, implementation, obj) {
  // make sure each Symbol is unique
  const actionId = utils.uid(alt._actionsRegistry, `${namespace}.${name}`)
  alt._actionsRegistry[actionId] = 1
  const actionSymbol = Symbol.for(`alt/${actionId}`)

  const data = {
    namespace,
    name,
    id: actionId,
    symbol: actionSymbol
  }

  // Wrap the action so we can provide a dispatch method
  const newAction = new AltAction(alt, actionSymbol, implementation, obj, data)

  // the action itself
  const action = newAction._dispatch
  action.defer = (...args) => {
    setTimeout(() => {
      newAction._dispatch.apply(null, args)
    })
  }
  action.id = actionSymbol
  action.data = data

  // ensure each reference is unique in the namespace
  const container = alt.actions[namespace]
  const id = utils.uid(container, name)
  container[id] = action

  return action
}
