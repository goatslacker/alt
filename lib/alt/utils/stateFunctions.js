"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

exports.setAppState = setAppState;
exports.snapshot = snapshot;
exports.saveInitialSnapshot = saveInitialSnapshot;
exports.filterSnapshots = filterSnapshots;
Object.defineProperty(exports, "__esModule", {
  value: true
});

var assign = _interopRequire(require("object-assign"));

var _symbolsSymbols = require("../symbols/symbols");

var INIT_SNAPSHOT = _symbolsSymbols.INIT_SNAPSHOT;
var LAST_SNAPSHOT = _symbolsSymbols.LAST_SNAPSHOT;
var LIFECYCLE = _symbolsSymbols.LIFECYCLE;
var STATE_CONTAINER = _symbolsSymbols.STATE_CONTAINER;

function setAppState(instance, data, onStore) {
  var obj = instance.deserialize(data);
  Object.keys(obj).forEach(function (key) {
    var store = instance.stores[key];
    if (store) {
      if (store[LIFECYCLE].deserialize) {
        obj[key] = store[LIFECYCLE].deserialize(obj[key]) || obj[key];
      }
      assign(store[STATE_CONTAINER], obj[key]);
      onStore(store);
    }
  });
}

function snapshot(instance) {
  for (var _len = arguments.length, storeNames = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    storeNames[_key - 1] = arguments[_key];
  }

  var stores = storeNames.length ? storeNames : Object.keys(instance.stores);
  return stores.reduce(function (obj, key) {
    var store = instance.stores[key];
    if (store[LIFECYCLE].snapshot) {
      store[LIFECYCLE].snapshot();
    }
    var customSnapshot = store[LIFECYCLE].serialize && store[LIFECYCLE].serialize();
    obj[key] = customSnapshot ? customSnapshot : store.getState();
    return obj;
  }, {});
}

function saveInitialSnapshot(instance, key) {
  var state = instance.stores[key][STATE_CONTAINER];
  var initial = instance.deserialize(instance[INIT_SNAPSHOT]);
  initial[key] = state;
  instance[INIT_SNAPSHOT] = instance.serialize(initial);
  instance[LAST_SNAPSHOT] = instance[INIT_SNAPSHOT];
}

function filterSnapshots(instance, serializedSnapshot, storeNames) {
  var stores = instance.deserialize(serializedSnapshot);
  var storesToReset = storeNames.reduce(function (obj, name) {
    if (!stores[name]) {
      throw new ReferenceError("" + name + " is not a valid store");
    }
    obj[name] = stores[name];
    return obj;
  }, {});
  return instance.serialize(storesToReset);
}