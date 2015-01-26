/* istanbul ignore next */
(function() {
  'use strict'

  if (typeof Symbol === 'function') {
    return module.exports = Symbol
  }

  var created = Object.create(null)
  var generateName = function (desc) {
    var postfix = 0
    while (created[desc + (postfix || '')]) {
      ++postfix
    }
    desc += (postfix || '')
    created[desc] = true
    return '@@' + desc
  }

  var def = function (value) {
    return {
      value: value,
      configurable: false,
      writable: false,
      enumerable: false
    }
  }

  var SymbolPolyfill = function (description) {
    if (this instanceof SymbolPolyfill) {
      throw new TypeError('TypeError: Symbol is not a constructor')
    }

    var symbol = Object.create(SymbolPolyfill.prototype)

    description = (description === undefined ? '' : String(description))

    return Object.defineProperties(symbol, {
      __description__: def(description),
      __name__: def(generateName(description))
    })
  }

  Object.defineProperties(SymbolPolyfill, {
    create: def(SymbolPolyfill('create')),
    hasInstance: def(SymbolPolyfill('hasInstance')),
    isConcatSpreadable: def(SymbolPolyfill('isConcatSpreadable')),
    isRegExp: def(SymbolPolyfill('isRegExp')),
    iterator: def(SymbolPolyfill('iterator')),
    toPrimitive: def(SymbolPolyfill('toPrimitive')),
    toStringTag: def(SymbolPolyfill('toStringTag')),
    unscopables: def(SymbolPolyfill('unscopables'))
  })

  Object.defineProperties(SymbolPolyfill.prototype, {
    properToString: def(function () {
      return 'Symbol (' + this.__description__ + ')'
    }),
    toString: def(function () { return this.__name__ })
  })

  Object.defineProperty(
    SymbolPolyfill.prototype,
    SymbolPolyfill.toPrimitive,
    def(function (hint) {
      throw new TypeError("Conversion of symbol objects is not allowed")
    })
  )

  Object.defineProperty(SymbolPolyfill.prototype, SymbolPolyfill.toStringTag, {
    value: 'Symbol',
    configurable: true,
    writable: false,
    enumerable: false
  })

  module.exports = SymbolPolyfill
}())
