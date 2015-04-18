"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Immutable = _interopRequire(require("immutable"));

var Symbol = _interopRequire(require("es-symbol"));

var IMMUTABLE_STATE = Symbol();

function makeImmutableObject(Collection, store, iden) {
  store.state = Collection(store.state || {});

  if (iden) {
    store.displayName = iden;
  }

  store.lifecycle = store.lifecycle || {};

  store.lifecycle.serialize = function () {
    return this.getInstance().getState().toJS();
  };

  store.lifecycle.deserialize = function (obj) {
    return Immutable.fromJS(obj);
  };

  return store;
}

function makeImmutableClass(Collection, alt, Store, iden) {
  var ImmutableClass = (function (_Store) {
    function ImmutableClass() {
      _classCallCheck(this, ImmutableClass);

      _get(Object.getPrototypeOf(ImmutableClass.prototype), "constructor", this).call(this);

      this.state = Collection(this.state);

      this.on("serialize", function () {
        return this.getInstance().getState().toJS();
      });

      this.on("deserialize", function (obj) {
        return Immutable.fromJS(obj);
      });
    }

    _inherits(ImmutableClass, _Store);

    return ImmutableClass;
  })(Store);

  ImmutableClass.displayName = iden || Store.name || Store.displayName || "";

  return ImmutableClass;
}

function enhance(alt) {
  var Collection = arguments[1] === undefined ? Immutable.Map : arguments[1];

  var stateKey = alt._stateKey;

  alt.setState = function (currentState, nextState) {
    return nextState;
  };

  alt.getState = function (currentState) {
    return currentState;
  };

  alt.createImmutableStore = function (store, iden) {
    for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
      args[_key - 2] = arguments[_key];
    }

    var StoreModel = typeof store === "function" ? makeImmutableClass(Collection, alt, store, iden) : makeImmutableObject(Collection, store, iden);

    alt._stateKey = "state";
    var store = alt.createStore.apply(alt, [StoreModel, iden].concat(args));
    alt._stateKey = stateKey;
    return store;
  };

  return alt;
}

module.exports = { enhance: enhance };