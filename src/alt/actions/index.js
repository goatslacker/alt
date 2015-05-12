import Symbol from 'es-symbol'

import * as fn from '../../utils/functions'
import * as Sym from '../symbols/symbols'
import * as utils from '../utils/AltUtils'

class AltAction {
  constructor(alt, id, action, actions, actionDetails) {
    this.id = id
    this._dispatch = action.bind(this)
    this.actions = actions
    this.actionDetails = actionDetails
    this.alt = alt
    this.dispatched = false
  }

  dispatch(data) {
    this.dispatched = true
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

  const dispatch = (payload) => alt.dispatch(actionSymbol, payload, data)

  // the action itself
  const action = (...args) => {
    newAction.dispatched = false
    const result = newAction._dispatch(...args)
    if (!newAction.dispatched) {
      if (fn.isFunction(result)) {
        result(dispatch)
      } else {
        dispatch(result)
      }
    }
    return result
  }
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
