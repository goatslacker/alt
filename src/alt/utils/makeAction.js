import * as Sym from '../symbols/symbols'
import Symbol from 'es-symbol'
import AltAction from '../AltAction'
import { uid } from './AltUtils'

const { ACTION_KEY, ACTION_HANDLER, ACTIONS_REGISTRY } = Sym

export default function makeAction(alt, namespace, name, implementation, obj) {
  // make sure each Symbol is unique
  const actionId = uid(alt[ACTIONS_REGISTRY], `${namespace}.${name}`)
  alt[ACTIONS_REGISTRY][actionId] = 1
  const actionSymbol = Symbol.for(`alt/${actionId}`)

  // Wrap the action so we can provide a dispatch method
  const newAction = new AltAction(alt, actionSymbol, implementation, obj)

  // the action itself
  const action = newAction[ACTION_HANDLER]
  action.defer = (...args) => {
    setTimeout(() => {
      newAction[ACTION_HANDLER].apply(null, args)
    })
  }
  action[ACTION_KEY] = actionSymbol

  // ensure each reference is unique in the namespace
  const container = alt.actions[namespace]
  const id = uid(container, name)
  container[id] = action

  return action
}
