"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _applyConstructor = function (Constructor, args) { var instance = Object.create(Constructor.prototype); var result = Constructor.apply(instance, args); return result != null && (typeof result == "object" || typeof result == "function") ? result : instance; };

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

exports.createStoreFromObject = createStoreFromObject;
exports.createStoreFromClass = createStoreFromClass;
Object.defineProperty(exports, "__esModule", {
  value: true
});

var assign = _interopRequire(require("object-assign"));

var AltStore = _interopRequire(require("../AltStore"));

var _StoreMixins = require("./StoreMixins");

var StoreMixinListeners = _StoreMixins.StoreMixinListeners;
var StoreMixinEssentials = _StoreMixins.StoreMixinEssentials;

var getInternalMethods = _interopRequire(require("./getInternalMethods"));

var _symbolsSymbols = require("../symbols/symbols");

var ALL_LISTENERS = _symbolsSymbols.ALL_LISTENERS;
var LIFECYCLE = _symbolsSymbols.LIFECYCLE;
var LISTENERS = _symbolsSymbols.LISTENERS;
var PUBLIC_METHODS = _symbolsSymbols.PUBLIC_METHODS;
var STATE_CHANGED = _symbolsSymbols.STATE_CHANGED;
var STATE_CONTAINER = _symbolsSymbols.STATE_CONTAINER;

function doSetState(store, storeInstance, nextState) {
  if (!nextState) {
    return;
  }

  if (!store.alt.dispatcher.isDispatching()) {
    throw new Error("You can only use setState while dispatching");
  }

  if (typeof nextState === "function") {
    assign(storeInstance[STATE_CONTAINER], nextState(storeInstance[STATE_CONTAINER]));
  } else {
    assign(storeInstance[STATE_CONTAINER], nextState);
  }

  storeInstance[STATE_CHANGED] = true;
}

function createStoreFromObject(alt, StoreModel, key) {
  var storeInstance = undefined;

  var StoreProto = {};
  StoreProto[ALL_LISTENERS] = [];
  StoreProto[LIFECYCLE] = {};
  StoreProto[LISTENERS] = {};

  assign(StoreProto, {
    _storeName: key,
    alt: alt,
    dispatcher: alt.dispatcher,
    getInstance: function getInstance() {
      return storeInstance;
    },
    setState: function setState(nextState) {
      doSetState(this, storeInstance, nextState);
    }
  }, StoreMixinListeners, StoreMixinEssentials, StoreModel);

  // bind the store listeners
  /* istanbul ignore else */
  if (StoreProto.bindListeners) {
    StoreMixinListeners.bindListeners.call(StoreProto, StoreProto.bindListeners);
  }

  // bind the lifecycle events
  /* istanbul ignore else */
  if (StoreProto.lifecycle) {
    Object.keys(StoreProto.lifecycle).forEach(function (event) {
      StoreMixinListeners.on.call(StoreProto, event, StoreProto.lifecycle[event]);
    });
  }

  // create the instance and assign the public methods to the instance
  storeInstance = assign(new AltStore(alt.dispatcher, StoreProto, StoreProto.state, StoreModel), StoreProto.publicMethods);

  return storeInstance;
}

function createStoreFromClass(alt, StoreModel, key) {
  for (var _len = arguments.length, argsForClass = Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
    argsForClass[_key - 3] = arguments[_key];
  }

  var storeInstance = undefined;

  // Creating a class here so we don't overload the provided store's
  // prototype with the mixin behaviour and I'm extending from StoreModel
  // so we can inherit any extensions from the provided store.

  var Store = (function (_StoreModel) {
    function Store() {
      for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      _classCallCheck(this, Store);

      _get(Object.getPrototypeOf(Store.prototype), "constructor", this).apply(this, args);
    }

    _inherits(Store, _StoreModel);

    return Store;
  })(StoreModel);

  assign(Store.prototype, StoreMixinListeners, StoreMixinEssentials, {
    _storeName: key,
    alt: alt,
    dispatcher: alt.dispatcher,
    getInstance: function getInstance() {
      return storeInstance;
    },
    setState: function setState(nextState) {
      doSetState(this, storeInstance, nextState);
    }
  });

  Store.prototype[ALL_LISTENERS] = [];
  Store.prototype[LIFECYCLE] = {};
  Store.prototype[LISTENERS] = {};
  Store.prototype[PUBLIC_METHODS] = {};

  var store = _applyConstructor(Store, argsForClass);

  storeInstance = assign(new AltStore(alt.dispatcher, store, null, StoreModel), getInternalMethods(StoreModel));

  return storeInstance;
}