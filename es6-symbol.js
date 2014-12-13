'use strict'

var created = Object.create(null)
var generateName = (desc) => {
  var postfix = 0
  while (created[desc + (postfix || '')]) {
    ++postfix
  }
  desc += (postfix || '')
  created[desc] = true
  return '@@' + desc
}

var def = (value) => {
  return {
    value,
    configurable: false,
    writable: false,
    enumerable: false
  }
}

var Symbol = function (description) {
  if (this instanceof Symbol) {
    throw new TypeError('TypeError: Symbol is not a constructor')
  }

  var symbol = Object.create(Symbol.prototype)

  description = (description === undefined ? '' : String(description))

  return Object.defineProperties(symbol, {
    __description__: def(description),
    __name__: def(generateName(description))
  })
}

Object.defineProperties(Symbol, {
	create: def(Symbol('create')),
	hasInstance: def(Symbol('hasInstance')),
	isConcatSpreadable: def(Symbol('isConcatSpreadable')),
	isRegExp: def(Symbol('isRegExp')),
	iterator: def(Symbol('iterator')),
	toPrimitive: def(Symbol('toPrimitive')),
	toStringTag: def(Symbol('toStringTag')),
	unscopables: def(Symbol('unscopables'))
})

Object.defineProperties(Symbol.prototype, {
  properToString: def(function () {
    return 'Symbol (' + this.__description__ + ')'
  }),
  toString: def(function () { return this.__name__ })
})

Object.defineProperty(
  Symbol.prototype,
  Symbol.toPrimitive,
  def((hint) => {
		throw new TypeError("Conversion of symbol objects is not allowed")
	})
)

Object.defineProperty(Symbol.prototype, Symbol.toStringTag, {
  value: 'Symbol',
  configurable: true,
  writable: false,
  enumerable: false
})

module.exports = Symbol
