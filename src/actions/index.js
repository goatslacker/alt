import * as fn from '../functions'
import * as utils from '../utils/AltUtils'
import isPromise from 'is-promise'

export default function makeAction(alt, namespace, name, implementation, obj) {
  const id = utils.uid(alt._actionsRegistry, `${namespace}.${name}`)
  alt._actionsRegistry[id] = 1

  const data = { id, namespace, name }

  const dispatch = (payload) => alt.dispatch(id, payload, data)

  // the action itself
  const action = (...args) => {
    const invocationResult = implementation.apply(obj, args)
    let actionResult = invocationResult

    // async functions that return promises should not be dispatched
    if (invocationResult !== undefined && !isPromise(invocationResult)) {
      if (fn.isFunction(invocationResult)) {
        // inner function result should be returned as an action result
        actionResult = invocationResult(dispatch, alt)
      } else {
        dispatch(invocationResult)
      }
    }

    if (invocationResult === undefined) {
      utils.warn('An action was called but nothing was dispatched')
    }

    return actionResult
  }
  action.defer = (...args) => setTimeout(() => action.apply(null, args))
  action.id = id
  action.data = data

  // ensure each reference is unique in the namespace
  const container = alt.actions[namespace]
  const namespaceId = utils.uid(container, name)
  container[namespaceId] = action

  // generate a constant
  const constant = utils.formatAsConstant(namespaceId)
  container[constant] = id

  return action
}
