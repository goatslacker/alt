import transmitter from 'transmitter'
import Store from './store'
import { isFunction, dispatchIdentity, id } from './utils'

const STORES_REF = id()

class Alt {
  constructor(config) {
    const bus = transmitter()

    Object.assign(this, {
      publish: (action) => {
        if (!action.meta) action.meta = {}
        action.meta.id = id()
        bus.publish(action)
      },
      subscribe: bus.subscribe,
      serialize: JSON.stringify,
      deserialize: JSON.parse,
    }, config)

    // our internal reference to stores
    this[STORES_REF] = []

    this.actions = {}
    this.stores = {}

    this.subscribe(payload => {
      this[STORES_REF].forEach(store => store.dispatch(payload))
      this[STORES_REF].forEach(store => store.emitChange())
    })
  }

  createActions(namespace, actions) {
    const dispatchableActions = Object.keys(actions).reduce((obj, actionName) => {
      const type = `${namespace}/${actionName}`

      const dispatch = payload => this.publish({ type, payload })

      obj[actionName] = (...args) => {
        const payload = actions[actionName](...args)
        if (isFunction(payload)) {
          return payload(dispatch, this)
        } else if (payload !== undefined) {
          dispatch(payload)
        }
        return payload
      }
      Object.assign(obj[actionName], { type, actionName })
      return obj
    }, {})

    return (this.actions[namespace] = dispatchableActions)
  }

  createAsyncActions(namespace, actions) {
    return Object.keys(actions).reduce((obj, actionName) => {
      const type = `${namespace}/${actionName}`

      const dispatch = (payload, opt) => {
        const meta = {}
        if (opt.loading) meta.loading = true
        const action = { type, payload, meta }
        if (opt.error) action.error = true

        this.publish(action)
        return action
      }

      obj[actionName] = (...args) => {
        const payload = actions[actionName](...args)

        dispatch(null, { loading: true })

        return Promise.resolve(payload).then(
          result => dispatch(result, {}),
          error => dispatch(error, { error: true })
        )
      }
      Object.assign(obj[actionName], { type, actionName })
      return obj
    }, {})
  }

  generateActions(namespace, actionNames) {
    const arr = Array.isArray(actionNames) ? actionNames : [actionNames]
    return this.createActions(namespace, arr.reduce((obj, name) => {
      obj[name] = dispatchIdentity
      return obj
    }, {}))
  }

  createStore(displayName, model) {
    const bus = transmitter()

    const runLifecycle = (name, action) => {
      if (!model.lifecycle[name]) return
      model.lifecycle[name].publish({ state: model.state, action })
    }

    // will attempt to dispatch unless an error is encountered
    // it will try to call the lifecycle method for errors if it exists
    const tryDispatching = (dispatch) => {
      model._noChange = false
      try {
        return dispatch()
      } catch (e) {
        if (model.lifecycle.error) {
          runLifecycle('error', e)
        } else {
          throw e
        }
      }
    }

    const dispatch = (action) => {
      // make sure that we don't emit a change unless we've actually attempted
      // to handle a dispatch
      model._noChange = true

      // run the lifecycle methods for before & after the dispatch
      runLifecycle('beforeEach', action)

      // handle the action if we're listening to it directly
      // also handle the 'otherwise' case which acts as a "default"
      // and also support 'reduce' use case which returns the next state and
      // replaces the state
      if (model.dispatchHandlers[action.type]) {
        tryDispatching(() => {
          model.dispatchHandlers[action.type].publish(action.payload, action)
        })
      } else if (model.otherwise) {
        tryDispatching(() => {
          model.otherwise(action.payload, action)
        })
      }
      if (model.reduce) {
        tryDispatching(() => {
          const value = model.reduce(model.state, action)
          if (value !== undefined) model.state = value
        })
      }
      runLifecycle('afterEach', action)

      return model.state
    }

    const emitChange = () => model._noChange || bus.publish(model.state)

    // the internal reference to this store's methods where we can get the
    // state, run lifecycle methods, bootstrap its internal state, and call
    // dispatches
    this[STORES_REF].push({
      displayName,

      setState: nextState => model.state = nextState,

      getState: () => ({ state: model.state }),

      runLifecycle,

      initialState: this.serialize({ state: model.state }),

      // dispatching...
      dispatch,

      // change emitter
      emitChange,
    })

    // the public interface, just getState and subscribe
    return (this.stores[displayName] = {
      displayName,

      dispatch,

      getState: () => model.state,

      subscribe: (f) => {
        const sub = bus.subscribe(f)
        return {
          dispose() {
            runLifecycle('unlisten')
            sub.dispose()
          },
        }
      },

      destroy: () => {
        this[STORES_REF] = this[STORES_REF]
          .filter(store => store.displayName !== displayName)
        delete this.stores[displayName]
      },
    })
  }

  load(snapshot) {
    const obj = typeof snapshot === 'string' ? this.deserialize(snapshot) : snapshot

    this[STORES_REF].forEach((store) => {
      if (obj.hasOwnProperty(store.displayName)) {
        store.setState(obj[store.displayName])
        store.runLifecycle('load')
      }
    })
  }

  save(storeNames) {
    return this.serialize(this[STORES_REF].reduce((obj, store) => {
      if (!storeNames || storeNames.hasOwnProperty(store.displayName)) {
        obj[store.displayName] = store.getState().state
        store.runLifecycle('save')
      }
      return obj
    }, {}))
  }

  flush(storeNames) {
    const snapshot = this.save(storeNames)
    this[STORES_REF].forEach((store) => {
      if (!storeNames || storeNames.hasOwnProperty(store.displayName)) {
        store.setState(this.deserialize(store.initialState).state)
      }
    })
    return snapshot
  }

  static debug(name, alt) {
    const key = 'alt.js.org'
    if (typeof window !== 'undefined') {
      if (!window[key]) window[key] = []
      window[key].push({ name, alt })
    }
    return alt
  }
}

Alt.Store = Store

export default Alt
