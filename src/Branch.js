const transmitter = require('transmitter')

const {
  BATCHED_STATE,
  FLUSH_STATE,
  TRANSMITTER,
} = require('./symbols')

const DONT_HANDLE = {}

function notifyActionHandled(branch) {
  branch[TRANSMITTER].publish(branch.state)
}

function setBatchedState(branch) {
  branch.state = Object.assign(...[{}, branch.state].concat(branch[BATCHED_STATE]))
  branch[BATCHED_STATE] = []
}

module.exports = class {
  constructor() {
    this.responders = {}

    this[BATCHED_STATE] = []
    this[FLUSH_STATE] = () => {
      setBatchedState(this)
      notifyActionHandled(this)
    }
    this[TRANSMITTER] = transmitter()
  }

  respondTo(responseMap) {
    Object.keys(responseMap).forEach(responderName => {
      const listOfActionDetails = responseMap[responderName]

      if (Array.isArray(listOfActionDetails)) {
        listOfActionDetails.forEach(actionDetails => (
          this.setActionResponder(actionDetails, () => this[responderName])
        ))
      } else {
        const actionDetails = listOfActionDetails
        this.setActionResponder(actionDetails, () => this[responderName])
      }
    })
  }

  respondToAll(actionDispatchers) {
    Object.keys(actionDispatchers).forEach(key => {
      this.setActionResponder(actionDispatchers[key], name => (
        typeof this[name] === 'function' ? this[name] : DONT_HANDLE
      ))
    })
  }

  respondToAsync(actionDispatcher, asyncStateResponders) {
    const actionResponder = new Function() // eslint-disable-line no-new-func
    actionResponder.async = Object.keys(asyncStateResponders)
    .reduce((pack, key) => (
      Object.assign(pack, {
        [key]: (_, action) => {
          asyncStateResponders[key](action.payload, action)
          return {}
        },
      })
    ), {})
    this.setActionResponder(actionDispatcher, () => actionResponder)
  }

  setActionResponder(actionDispatcher, getResponder) {
    const { actionDetails } = actionDispatcher

    if (typeof actionDetails !== 'object') {
      throw new ReferenceError('Action dispatcher is unknown')
    }

    const { name, type } = actionDetails

    const responder = getResponder(name)
    if (responder === DONT_HANDLE) return

    if (typeof responder !== 'function') {
      throw new ReferenceError(`Action responder does not exist in branch (name "${name}", type "${type}")`)
    }

    if (!this.responders[type]) this.responders[type] = new Set()
    this.responders[type].add(responder)
  }

  mutate(state, nextState) {
    return Object.assign({}, state, nextState)
  }

  setState(overrideState) {
    this[BATCHED_STATE].push(overrideState)
  }
}
