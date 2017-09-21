const transmitter = require('transmitter')

const Alt = require('./alt')
const {
  BATCHED_STATE,
  FLUSH_STATE,
  TRANSMITTER,
} = require('./symbols')

function mutate(state, payload) {
  if (state === payload) return state
  Object.keys(state).forEach(key => delete state[key])
  return Object.assign(state, payload)
}

function addCompatBranch(alt, branch, reducer) {
  const branchAccessor = alt.addBranch(branch, () => reducer)

  const publicMethods = branch.publicMethods || {}
  const addonPublicMethods = Object.keys(publicMethods)
  .reduce((methods, methodName) => {
    const method = publicMethods[methodName]
    methods[methodName] = (...args) => (
      method.apply(branchAccessor, args)
    )
    return methods
  }, {})

  const subscriptions = new Map()
  const addonListeners = {
    listen: f => {
      subscriptions.set(f, branch[TRANSMITTER].subscribe(f))
      return () => addonListeners.unlisten(f)
    },
    unlisten: f => {
      branch.emitLifecycleEvent('unlisten')
      const subscription = subscriptions.get(f)
      if (subscription) subscription.dispose()
    },
  }

  return Object.assign(
    branchAccessor,
    addonPublicMethods,
    addonListeners
  )
}

function compatReduxReducer(branch, getContext) {
  return (state, action) => {
    // In development we want to mutate with redux's state so that middleware
    // like the redux devtools works properly. In production we can skip the
    // extra Object.assign calls.
    // istanbul ignore else
    if (process.env.NODE_ENV === 'development') {
      if (state) mutate(branch.state, state)
    }
    if (action.type === '@@alt/load' && action.payload[branch.namespace]) {
      // We mutate here because Alt@0.x kept an outside reference to state.
      mutate(branch.state, action.payload[branch.namespace])
    } else if (branch.responders[action.type]) {
      branch.emitLifecycleEvent('beforeEach', {
        payload: action,
        state: branch.state,
      })
      try {
        branch.responders[action.type].forEach(responder => (
          // getContext is so that it works with really old Alt stores where
          // state is kept as part of instance variables.
          // And so that it works on stores where state is kept inside this.state
          responder.call(getContext(branch), action.payload, action)
        ))
      } catch (error) {
        if (!branch.handlesOwnErrors) {
          throw error
        }

        branch.emitLifecycleEvent('error', {
          error,
          payload: action,
          state: branch.state,
        })
      }
      branch[FLUSH_STATE]()
      branch.emitLifecycleEvent('afterEach', {
        payload: action,
        state: branch.state,
      })
    }
    return branch.state
  }
}

class AltZero extends Alt {
  bootstrap(jsonOrObj) {
    const payload = typeof jsonOrObj === 'string'
      ? JSON.parse(jsonOrObj)
      : jsonOrObj

    return this.load(payload)
  }

  createActions(Actions, exportObj = {}, ...args) {
    const actionsObj = typeof Actions === 'function'
      ? new Actions(...args)
      : Actions
    const namespace = actionsObj.displayName || Actions.name || 'Unknown'

    let properties = Object.getOwnPropertyNames(Actions.prototype || {})
    if (!properties.length && actionsObj) {
      properties = Object.keys(actionsObj)
    }
    properties = properties.filter(name => name !== 'constructor')

    return properties.reduce((actions, name) => {
      const type = `${namespace}/${name}`

      const actionCreator = (...actionArgs) => (
        actionsObj[name].apply(actionCreator, actionArgs)
      )
      actionCreator.actions = actions
      actionCreator.dispatch = payload => {
        const action = { type, payload }
        this.store.dispatch(action)
      }
      actionCreator.actionDetails = { name, type }
      return Object.assign(actions, {
        [name]: actionCreator,
      })
    }, exportObj)
  }

  createStore(Store, namespace, ...args) {
    const branch = AltZero.storeToBranchDefinition(Store, namespace, args)
    return addCompatBranch(this, branch, compatReduxReducer(branch, x => x))
  }

  createAwfulStore(Store, namespace, ...args) {
    const branch = AltZero.storeToBranchDefinition(Store, namespace, args)
    return addCompatBranch(
      this,
      branch,
      compatReduxReducer(branch, x => x.state)
    )
  }

  flush() {
    return this.revert()
  }

  generateActions(...actions) {
    return this.generateActionDispatchers(...actions)
  }

  takeSnapshot() {
    return this.serialize()
  }
}

// Compatibility add-on
AltZero.Store = class extends Alt.Branch {
  constructor() {
    super()
    this.lifecycleEvents = {}
  }

  bindAction(symbol, handler) {
    this.setActionResponder(symbol, () => handler)
  }

  bindActions(actions) {
    this.respondToAll(actions)
  }

  bindListeners(listenerObject) {
    this.respondTo(listenerObject)
  }

  emitChange() {
    this[FLUSH_STATE]()
  }

  emitLifecycleEvent(eventName, eventArgs) {
    const bus = this.lifecycleEvents[eventName]
    if (bus) bus.publish(eventArgs)
  }

  exportAsync(asyncMethods) {
    this.registerAsync(asyncMethods)
  }

  exportPublicMethods(publicMethodsObject) {
    if (!this.publicMethods) this.publicMethods = {}
    Object.assign(this.publicMethods, publicMethodsObject)
  }

  on(lifecycleEvent, handler) {
    if (lifecycleEvent === 'error') this.handlesOwnErrors = true
    const bus = this.lifecycleEvents[lifecycleEvent] || transmitter()
    this.lifecycleEvents[lifecycleEvent] = bus
    return bus.subscribe(handler.bind(this))
  }

  registerAsync(asyncDef) {
    let loadCounter = 0

    const asyncMethods = asyncDef

    const toExport = Object.keys(asyncMethods).reduce((publicMethods, methodName) => {
      const desc = asyncMethods[methodName]
      const spec = desc(this)

      const validHandlers = ['success', 'error', 'loading']
      validHandlers.forEach((handler) => {
        if (spec[handler] && !spec[handler].actionDetails) {
          throw new Error(`${handler} handler must be an action function`)
        }
      })

      publicMethods[methodName] = (...args) => {
        const state = this.state
        const value = spec.local && spec.local(state, ...args)
        const shouldFetch = spec.shouldFetch
          ? spec.shouldFetch(state, ...args)
          : value === null || value === undefined

        const intercept = spec.interceptResponse || (x => x)

        const makeActionHandler = (action, isError) => {
          return (x) => {
            const fire = () => {
              loadCounter -= 1
              action(intercept(x, action, args))
              if (isError) throw x
              return x
            }
            return fire()
          }
        }

        // if we don't have it in cache then fetch it
        if (shouldFetch) {
          loadCounter += 1
          /* istanbul ignore else */
          if (spec.loading) spec.loading(intercept(null, spec.loading, args))
          return spec.remote(state, ...args).then(
            makeActionHandler(spec.success),
            makeActionHandler(spec.error, 1)
          )
        }

        // otherwise emit the change now
        this.emitChange()
        return value
      }

      return publicMethods
    }, {})

    this.exportPublicMethods(toExport)
    this.exportPublicMethods({
      isLoading: () => loadCounter > 0,
    })
  }
}

const storeProperties = new Set([
  'namespace',
  'lifecycleEvents',
  'publicMethods',
  'responders',
  BATCHED_STATE,
  FLUSH_STATE,
  TRANSMITTER,
])

// Remove the store's properties because for AwfulStore the instance's
// variables are used as part of state.
function filterState(state) {
  return Object.keys(state).reduce((finalState, key) => {
    if (storeProperties.has(key)) {
      return finalState
    }
    return Object.assign(finalState, {
      [key]: state[key],
    })
  }, {})
}

// Converts an Alt 0.x's store instance to an Alt2 branch definition
AltZero.storeToBranchDefinition = (Store, namespace, args) => {
  const store = new Store(...args)
  store.namespace = namespace
  store.state = store.state || filterState(store)
  store.emitLifecycleEvent('init')
  return store
}

module.exports = AltZero
