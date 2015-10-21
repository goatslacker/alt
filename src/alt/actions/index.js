import * as fn from '../../utils/functions'
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
    this.dispatched = true
    this.alt.dispatch(this.id, data, this.actionDetails)
  }
}

export default function makeAction(alt, namespace, name, implementation, obj) {
  const id = utils.uid(alt._actionsRegistry, `${namespace}.${name}`)
  alt._actionsRegistry[id] = 1

  const data = { id, namespace, name }

  // Wrap the action so we can provide a dispatch method
  const newAction = new AltAction(alt, id, implementation, obj, data)

  const dispatch = (payload) => alt.dispatch(id, payload, data)

  // the action itself
  const action = (...args) => {
    newAction.dispatched = false
    const result = newAction._dispatch(...args)
    // async functions that return promises should not be dispatched
    if (!newAction.dispatched && result !== undefined && !fn.isPromise(result)) {
      if (fn.isFunction(result)) {
        result(dispatch, alt)
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
  action.id = id
  action.data = data

  // ensure each reference is unique in the namespace
  const container = alt.actions[namespace]
  const namespaceId = utils.uid(container, name)
  container[namespaceId] = action

  return action
}
