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
  Object.assign.apply(Object, [branch.state].concat(branch[BATCHED_STATE]))
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
      if (Array.isArray(responseMap[responderName])) {
        responseMap[responderName].forEach(actionDispatcher => (
          this.setActionResponder(actionDispatcher, () => this[responderName])
        ))
      } else {
        this.setActionResponder(
          responseMap[responderName],
          () => this[responderName]
        )
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
      throw new Error(`Action dispatcher is unknown`)
    }

    const { name, type } = actionDetails

    const responder = getResponder(name)
    if (responder === DONT_HANDLE) return

    if (typeof responder !== 'function') {
      throw new Error(`Action responder does not exist in branch (name "${name}", type "${type}")`)
    }

    if (!this.responders[type]) this.responders[type] = new Set()
    this.responders[type].add(responder)
  }

  setState(overrideState) {
    this[BATCHED_STATE].push(overrideState)
  }
}
