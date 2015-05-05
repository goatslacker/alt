import Symbol from 'es-symbol'

const ID = Symbol()
const FNS = Symbol()

class PromiseDispatcher {
  constructor() {
    this.dispatching = false
    this[ID] = 0
    this[FNS] = {}
  }

  register(promise) {
    const id = `token#${this[ID]++}`
    this[FNS][id] = promise
    return id
  }

  unregister(id) {
    delete this[FNS][id]
  }

  waitFor(context, ids) {
    return new Promise((resolve) => {
      // defer the resolution to make sure all the promises are in context
      setTimeout(() => {
        resolve(Promise.all(ids.map((id) => {
          return context[id]
        })))
      })
    })
  }

  dispatch(payload) {
    this.dispatching = true

    // evaluate all promises
    const promises = Object.keys(this[FNS]).reduce((obj, id) => {
      obj[id] = this[FNS][id](payload, obj)
      return obj
    }, {})

    // aggregate them
    const all = Object.keys(promises).reduce((arr, id) => {
      const value = promises[id]
      return arr.concat(value)
    }, [])

    // dispatch
    return Promise.all(all).then((value) => {
      this.dispatching = false
      return value
    })
  }

  isDispatching() {
    return this.dispatching
  }
}

export default PromiseDispatcher
