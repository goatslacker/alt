'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.combine = combine;
exports.reduceWith = reduceWith;

var _functions = require('./functions');

function getId(x) {
  return x.id || x;
}

/* istanbul ignore next */
function shallowEqual(a, b) {
  if (typeof a !== 'object' || typeof b !== 'object') return a === b;
  if (a === b) return true;
  if (!a || !b) return false;
  for (var k in a) {
    if (a.hasOwnProperty(k) && (!b.hasOwnProperty(k) || a[k] !== b[k])) {
      return false;
    }
  }
  for (var k in b) {
    if (b.hasOwnProperty(k) && !a.hasOwnProperty(k)) {
      return false;
    }
  }
  return true;
}

function combine() {
  for (var _len = arguments.length, restReducers = Array(_len), _key = 0; _key < _len; _key++) {
    restReducers[_key] = arguments[_key];
  }

  var reducers = _functions.assign.apply(null, [{}].concat(restReducers));
  return function (state, payload) {
    var newState = reducers.hasOwnProperty(payload.action) ? reducers[payload.action](state, payload.data) : state;

    if (shallowEqual(state, newState)) this.preventDefault();

    return newState;
  };
}

function reduceWith(actions, reduce) {
  return actions.reduce(function (total, action) {
    total[getId(action)] = reduce;
    return total;
  }, {});
}