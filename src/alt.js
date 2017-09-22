const { applyMiddleware, createStore, combineReducers } = require('redux')
const { middleware: reduxPack, handle: handleAsyncState } = require('redux-pack')

const Branch = require('./Branch')
const {
  FLUSH_STATE,
  TRANSMITTER,
} = require('./symbols')

function fsa(type, payload) {
  return { type, payload, meta: {} }
}

function pack(type, packedAction) {
  return {
    type,
    promise: packedAction.promise,
    meta: Object.assign({}, packedAction.meta),
  }
}

const PREVENT_DISPATCH = {}
const ASYNC_DISPATCH = {}

// Is has better here?
function isObject(obj) {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.hasOwnProperty === 'function'
  )
}

function isPack(action) {
  return (
    isObject(action) &&
    action.hasOwnProperty('type') &&
    action.hasOwnProperty('promise') &&
    action.type === ASYNC_DISPATCH
  )
}

function reduxReducer(branch) {
  return (state, action) => {
    if (state) branch.state = state

    if (action.type === '@@alt/load' && action.payload[branch.namespace]) {
      branch.state = action.payload[branch.namespace]
    } else if (branch.responders[action.type]) {
      branch.responders[action.type].forEach(responder => (
        responder.async
          ? handleAsyncState(branch.state, action, responder.async)
          : responder.call(branch, action.payload, action)
      ))
      branch[FLUSH_STATE]()
    } else if (branch.otherwise) {
      branch.otherwise(action)
      branch[FLUSH_STATE]()
    }
    return branch.state
  }
}

function createAD(namespace, name, getPayload, dispatcher) {
  const type = `${namespace}/${name}`

  const actionDispatcher = (...args) => {
    const payload = getPayload(...args)

    if (payload === PREVENT_DISPATCH) {
      return null
    }

    const action = isPack(payload) ? pack(type, payload) : fsa(type, payload)

    dispatcher.dispatch(action)
    return action
  }
  actionDispatcher.actionDetails = { name, type }

  return actionDispatcher
}

function copy(obj) {
  return JSON.parse(JSON.stringify(obj))
}

function emptyReducer() { }

class Alt {
  constructor(middleware = []) {
    const storeEnhancer = applyMiddleware(reduxPack, ...middleware)
    this.branches = {}
    this.initialState = {}
    this.reducers = {}
    this.store = createStore(emptyReducer, {}, storeEnhancer)
  }

  generateActionDispatchers(...actionDispatchers) {
    return actionDispatchers.reduce((obj, name) => (
      Object.assign(obj, {
        [name]: createAD('global', name, x => x, this.store),
      })
    ), {})
  }

  getActionDispatchers(namespace, actionDispatchers) {
    return Object.keys(actionDispatchers).reduce((obj, name) => (
      Object.assign(obj, {
        [name]: createAD(namespace, name, actionDispatchers[name], this.store),
      })
    ), {})
  }

  addBranch(branch, reducer = reduxReducer) {
    const branchKey = branch.namespace
    if (!branchKey) {
      throw new Error('Branch was provided without a namespace')
    }

    if (this.reducers[branchKey]) {
      throw new Error(`A branch with this name already exists (name "${branchKey}")`)
    }

    this.reducers[branchKey] = reducer(branch)
    this.store.replaceReducer(combineReducers(this.reducers))
    this.initialState[branchKey] = copy(branch.state)

    const branchAccessor = {
      getState: () => this.store.getState()[branchKey],
      subscribe: f => branch[TRANSMITTER].subscribe(f),
    }
    this.branches[branchKey] = branchAccessor
    return branchAccessor
  }

  addReducer(reducerName, reducer) {
    this.reducers[reducerName] = reducer
    this.store.replaceReducer(combineReducers(this.reducers))
  }

  getState() {
    return this.store.getState()
  }

  subscribe(f) {
    const dispose = this.store.subscribe(f)
    return { dispose }
  }

  load(payload) {
    this.store.dispatch({
      type: '@@alt/load',
      payload,
    })
  }

  serialize() {
    return JSON.stringify(this.store.getState())
  }

  revert() {
    const state = this.serialize()
    this.store.dispatch({
      type: '@@alt/load',
      payload: this.initialState,
    })
    return state
  }
}

Alt.ASYNC_DISPATCH = ASYNC_DISPATCH
Alt.PREVENT_DISPATCH = PREVENT_DISPATCH

Alt.getActionCreators = function (namespace, actionCreators) {
  return Object.keys(actionCreators).reduce((obj, name) => (
    Object.assign(obj, {
      [name]: createAD(namespace, name, actionCreators[name], {
        dispatch: () => null,
      }),
    })
  ), {})
}

Alt.asyncDispatch = function (promisable, lifecycleCallbacks) {
  return {
    type: Alt.ASYNC_DISPATCH,
    promise: Promise.resolve(promisable),
    meta: lifecycleCallbacks,
  }
}

Alt.Branch = Branch

module.exports = Alt
