'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

exports['default'] = atomic;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _makeFinalStore = require('./makeFinalStore');

var _makeFinalStore2 = _interopRequireDefault(_makeFinalStore);

var _functions = require('./functions');

function makeAtomicClass(alt, StoreModel) {
  var AtomicClass = (function (_StoreModel) {
    function AtomicClass() {
      _classCallCheck(this, AtomicClass);

      _get(Object.getPrototypeOf(AtomicClass.prototype), 'constructor', this).call(this);
      this.on('error', function () {
        return alt.rollback();
      });
    }

    _inherits(AtomicClass, _StoreModel);

    return AtomicClass;
  })(StoreModel);

  AtomicClass.displayName = StoreModel.displayName || StoreModel.name;
  return AtomicClass;
}

function makeAtomicObject(alt, StoreModel) {
  StoreModel.lifecycle = StoreModel.lifecycle || {};
  StoreModel.lifecycle.error = function () {
    alt.rollback();
  };
  return StoreModel;
}

function atomic(alt) {
  var finalStore = (0, _makeFinalStore2['default'])(alt);

  finalStore.listen(function () {
    return alt.takeSnapshot();
  });

  return function (StoreModel) {
    return (0, _functions.isFunction)(StoreModel) ? makeAtomicClass(alt, StoreModel) : makeAtomicObject(alt, StoreModel);
  };
}

module.exports = exports['default'];