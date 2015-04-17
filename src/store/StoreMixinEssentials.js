'use strict'

import {PUBLIC_METHODS} from '../../src/shared/symbols'

const StoreMixinEssentials = {
  waitFor(sources) {
    if (!sources) {
      throw new ReferenceError('Dispatch tokens not provided')
    }

    if (arguments.length === 1) {
      sources = Array.isArray(sources) ? sources : [sources]
    } else {
      sources = Array.prototype.slice.call(arguments)
    }

    let tokens = sources.map((source) => {
      return source.dispatchToken || source
    })

    this.dispatcher.waitFor(tokens)
  },

  exportPublicMethods(methods) {
    Object.keys(methods).forEach((methodName) => {
      if (typeof methods[methodName] !== 'function') {
        throw new TypeError('exportPublicMethods expects a function')
      }

      this[PUBLIC_METHODS][methodName] = methods[methodName]
    })
  },

  emitChange() {
    this.getInstance().emitChange()
  }
}

export default StoreMixinEssentials
