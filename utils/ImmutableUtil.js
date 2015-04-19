"use strict";

var Immutable = babelHelpers.interopRequire(require("immutable"));

function makeImmutableObject(store, iden) {
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

function makeImmutableClass(alt, Store, iden) {
  var ImmutableClass = (function (_Store) {
    function ImmutableClass() {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      babelHelpers.classCallCheck(this, ImmutableClass);

      babelHelpers.get(Object.getPrototypeOf(ImmutableClass.prototype), "constructor", this).apply(this, args);

      this.on("serialize", function () {
        return this.getInstance().getState().toJS();
      });

      this.on("deserialize", function (obj) {
        return Immutable.fromJS(obj);
      });
    }

    babelHelpers.inherits(ImmutableClass, _Store);
    return ImmutableClass;
  })(Store);

  ImmutableClass.displayName = iden || Store.displayName || "";

  return ImmutableClass;
}

function enhance(alt) {
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

    var StoreModel = typeof store === "function" ? makeImmutableClass(alt, store, iden) : makeImmutableObject(store, iden);

    alt._stateKey = "state";
    var store = alt.createStore.apply(alt, [StoreModel, iden].concat(args));
    alt._stateKey = stateKey;
    return store;
  };

  return alt;
}

module.exports = { enhance: enhance };