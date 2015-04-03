var Immutable = require('immutable')
var Symbol = require('es-symbol')

var IMMUTABLE = Symbol.for('AltImmutableStore')

// babelHelpers
/*eslint-disable */
/* istanbul ignore next */
var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

/* istanbul ignore next */
var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };
/*eslint-enable */


function makeImmutableObject(store) {
  store.state = Immutable.Map(store.state || {})

  store.publicMethods = store.publicMethods || {}

  store.lifecycle = store.lifecycle || {}

  store.lifecycle.serialize = function () {
    return this.getInstance().getState().toJS()
  }

  store.lifecycle.deserialize = function (obj) {
    return Immutable.fromJS(obj)
  }

  store.getImmutableState = function () {
    return this.getInstance().getState()
  }

  return store
}

function makeImmutableClass(StoreClass) {
  function ImmutableClass() {
    _get(Object.getPrototypeOf(ImmutableClass.prototype), 'constructor', this).call(this)
    this.state = Immutable.Map(this)

    this.on('serialize', function () {
      return this.getInstance().getState().toJS()
    })

    this.on('deserialize', function (obj) {
      return Immutable.fromJS(obj)
    })
  }

  _inherits(ImmutableClass, StoreClass)

  ImmutableClass.prototype.getImmutableState = function () {
    return this.getInstance().getState()
  }

  return ImmutableClass
}

function getStoreModel(store) {
  return typeof store === 'function'
    ? makeImmutableClass(store)
    : makeImmutableObject(store)
}

var ImmutableUtil = {
  createStore: function (alt, store, name) {
    store[IMMUTABLE] = true
    return alt.createStore(getStoreModel(store), name)
  }
}

module.exports = ImmutableUtil
