"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.map = map;
exports.filter = filter;
exports.reduce = reduce;
exports.flatMap = flatMap;
exports.zipWith = zipWith;
var push = Array.prototype.push;

// Disabling no-shadow so we can sanely curry
/*eslint-disable no-shadow*/

function map(fn, stores) {
  return stores ? stores.map(function (store) {
    return fn(store.state);
  }) : function (stores) {
    return map(fn, stores);
  };
}

function filter(fn, stores) {
  return stores ? stores.filter(function (store) {
    return fn(store.state);
  }) : function (stores) {
    return filter(fn, stores);
  };
}

function reduce(fn, stores) {
  var acc = arguments[2] === undefined ? {} : arguments[2];

  return stores ? stores.reduce(function (acc, store) {
    return fn(acc, store.state);
  }, acc) : function (stores) {
    return reduce(fn, stores);
  };
}

function flatMap(fn, stores) {
  if (!stores) return function (stores) {
    return flatMap(fn, stores);
  };

  return stores.reduce(function (result, store) {
    var value = fn(store.state);
    if (Array.isArray(value)) {
      push.apply(result, value);
    } else {
      result.push(value);
    }
    return result;
  }, []);
}

function zipWith(fn, a, b) {
  if (!a && !b) {
    return function (a, b) {
      return zipWith(fn, a, b);
    };
  }

  var length = Math.min(a.length, b.length);
  var result = Array(length);
  for (var i = 0; i < length; i += 1) {
    result[i] = fn(a[i].state, b[i].state);
  }
  return result;
}