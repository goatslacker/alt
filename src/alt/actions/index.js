//import Symbol from 'es-symbol'

import * as Sym from '../symbols/symbols'
import * as utils from '../utils/AltUtils'

class AltAction {
  constructor(alt, name, action, actions, actionDetails) {
    this[Sym.ACTION_UID] = name
    this[Sym.ACTION_HANDLER] = action.bind(this)
    this.actions = actions
    this.actionDetails = actionDetails
    this.alt = alt
  }

  dispatch(data) {
    this.alt.dispatch(this[Sym.ACTION_UID], data, this.actionDetails)
  }
}

export default function makeAction(alt, namespace, name, implementation, obj) {
  // make sure each Symbol is unique
  const actionId = utils.uid(alt[Sym.ACTIONS_REGISTRY], `${namespace}.${name}`)
  alt[Sym.ACTIONS_REGISTRY][actionId] = 1
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
  const action = newAction[Sym.ACTION_HANDLER]
  action.defer = (...args) => {
    setTimeout(() => {
      newAction[Sym.ACTION_HANDLER].apply(null, args)
    })
  }
  action[Sym.ACTION_KEY] = actionSymbol
  action.data = data

  // ensure each reference is unique in the namespace
  const container = alt.actions[namespace]
  const id = utils.uid(container, name)
  container[id] = action

  return action
}
