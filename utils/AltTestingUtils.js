'use strict';

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _functions = require('./functions');

var noop = function noop() {};

var AltTestingUtils = {
  createStoreSpy: function createStoreSpy(alt) {
    return {
      displayName: 'ALT_TEST_STORE',
      alt: alt,
      bindAction: noop,
      bindActions: noop,
      bindListeners: noop,
      dispatcher: alt.dispatcher,
      emitChange: noop,
      exportAsync: noop,
      exportPublicMethods: noop,
      getInstance: noop,
      on: noop,
      registerAsync: noop,
      setState: noop,
      waitFor: noop
    };
  },

  makeStoreTestable: function makeStoreTestable(alt, UnwrappedStore) {
    var StorePrototype = AltTestingUtils.createStoreSpy(alt);

    var DerivedStore = (function (_UnwrappedStore) {
      function DerivedStore() {
        _classCallCheck(this, DerivedStore);

        _get(Object.getPrototypeOf(DerivedStore.prototype), 'constructor', this).call(this);
      }

      _inherits(DerivedStore, _UnwrappedStore);

      return DerivedStore;
    })(UnwrappedStore);

    (0, _functions.assign)(DerivedStore.prototype, StorePrototype);
    return new DerivedStore();
  },

  mockGetState: function mockGetState() {
    var state = arguments[0] === undefined ? {} : arguments[0];

    return {
      getState: function getState() {
        return state;
      }
    };
  }
};

module.exports = AltTestingUtils;