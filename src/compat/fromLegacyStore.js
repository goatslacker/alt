import Store from '../store'

const storeValues = {
  dispatchHandlers: {},
  boundListeners: [],
  lifecycle: {},
  _noChange: false,
  state: {},
}

function getNextState(store) {
  return Object.keys(store).reduce((nextState, key) => {
    if (!storeValues.hasOwnProperty(key)) {
      nextState[key] = store[key]
    }
    return nextState
  }, {})
}

export default function fromLegacyStore(LegacyStore) {
  const values = new Store()

  function BackwardCompatibleStore() {
    Object.keys(values).forEach(key => this[key] = values[key])
    LegacyStore.call(this)
    this.state = getNextState(this)
  }
  BackwardCompatibleStore.prototype = Object.create(LegacyStore.prototype)
  Object.assign(BackwardCompatibleStore.prototype, Store.prototype)
  BackwardCompatibleStore.prototype.constructor = LegacyStore

  // allow state changes in lifecycle methods
  BackwardCompatibleStore.prototype.on = function on(eventName, callback) {
    Store.prototype.on.call(this, eventName, (update) => {
      callback(update.state, update.action)
      this.state = getNextState(this)
    })
  }

  // wrap each method so we can pull state from `this`
  const newProto = Object.keys(LegacyStore.prototype).reduce((obj, key) => {
    obj[key] = function actionHandler() {
      const context = Object.assign({}, this, this.state)
      const res = LegacyStore.prototype[key].apply(context, arguments)
      this.state = getNextState(context)
      return res
    }
    return obj
  }, {})

  Object.assign(BackwardCompatibleStore.prototype, newProto)

  return new BackwardCompatibleStore()
}
