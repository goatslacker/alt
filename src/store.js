import transmitter from 'transmitter'
import { isMutableObject } from './utils'

function bindActions(store, type, name) {
  const matchFirstCharacter = /./
  const assumedEventHandler = name.replace(matchFirstCharacter, (x) => {
    return `on${x[0].toUpperCase()}`
  })

  if (store[name] && store[assumedEventHandler]) {
    // If you have both action and onAction
    throw new ReferenceError(
      `You have multiple handlers bound to an action: ` +
      `${name} and ${assumedEventHandler}`
    )
  }

  const handler = store[name] || store[assumedEventHandler]
  if (handler) {
    store.bindAction(type, (payload, action) => {
      if (store[name]) {
        store[name](payload, action)
      } else if (store[assumedEventHandler]) {
        store[assumedEventHandler](payload, action)
      }
    })
  }
}

class Store {
  constructor() {
    this.dispatchHandlers = {}
    this.boundListeners = []
    this.lifecycle = {}
    this._noChange = false
  }

  bindActions(actions) {
    Object.keys(actions).forEach(name => bindActions(this, actions[name].type, name))
  }

  bindAction(name, handler) {
    const type = name.type ? name.type : name

    if (!this.dispatchHandlers[type]) {
      this.dispatchHandlers[type] = transmitter()
    }

    this.dispatchHandlers[type].subscribe(handler)
    this.boundListeners.push(type)
  }

  bindListeners(actions) {
    Object.keys(actions).forEach((name) => {
      if (!this[name]) {
        throw new ReferenceError(
          `${name} defined but does not exist in self`
        )
      }

      const value = actions[name]
      const handler = payload => this[name](payload)

      if (Array.isArray(value)) {
        value.forEach(action => this.bindAction(action, handler))
      } else {
        this.bindAction(value, handler)
      }
    })
  }

  on(eventName, callback) {
    if (!this.lifecycle[eventName]) this.lifecycle[eventName] = transmitter()
    this.lifecycle[eventName].subscribe(callback)
  }

  setState(nextState) {
    if (isMutableObject(this.state)) {
      this.state = Object.assign({}, this.state, nextState)
    } else {
      this.state = nextState
    }
  }

  preventDefault() {
    this._noChange = true
  }
}

export default Store
