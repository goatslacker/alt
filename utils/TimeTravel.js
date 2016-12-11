'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x4, _x5, _x6) { var _again = true; _function: while (_again) { var object = _x4, property = _x5, receiver = _x6; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x4 = parent; _x5 = property; _x6 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _functions = require('./functions');

var _makeFinalStore = require('./makeFinalStore');

var _makeFinalStore2 = _interopRequireDefault(_makeFinalStore);

function timetravel(alt) {
  var options = arguments[1] === undefined ? {} : arguments[1];

  var history = (0, _functions.assign)({
    max: 300
  }, options);

  var payloadStore = (0, _makeFinalStore2['default'])(alt);
  var payloads = [];
  var current = 0;

  function captureMoment(snapshot) {
    if (payloads.length > history.max - 1) {
      payloads.shift();
    }

    // trash history because an undo has taken place
    if (current < payloads.length) {
      payloads.splice(current + 1, payloads.length);
    }

    current += 1;
    payloads.push(snapshot);
  }

  return function (Store) {
    var TimeTravelStore = (function (_Store) {
      function TimeTravelStore() {
        var _this = this;

        _classCallCheck(this, TimeTravelStore);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        _get(Object.getPrototypeOf(TimeTravelStore.prototype), 'constructor', this).apply(this, args);

        this.on('init', function (_) {
          // capture the initial snapshot
          captureMoment(alt.serialize(_defineProperty({}, _this.displayName, _this)));

          // capture subsequent shots
          payloadStore.listen(function (_) {
            return captureMoment(alt.takeSnapshot(_this.displayName));
          });
        });

        this.exportPublicMethods({
          events: function events() {
            return payloads.slice();
          },

          undo: function undo() {
            var n = arguments[0] === undefined ? 1 : arguments[0];

            var max = payloads.length - 1;
            var index = Math.min(n, max);
            var payload = payloads[max - index];

            current = max - index;

            alt.bootstrap(payload);
          },

          redo: function redo() {
            var n = arguments[0] === undefined ? 1 : arguments[0];

            var max = payloads.length - 1;
            var index = Math.min(current + n, max);
            var payload = payloads[index];

            current = index;

            alt.bootstrap(payload);
          }
        });
      }

      _inherits(TimeTravelStore, _Store);

      _createClass(TimeTravelStore, null, [{
        key: 'displayName',
        value: Store.displayName || Store.name,
        enumerable: true
      }]);

      return TimeTravelStore;
    })(Store);

    return TimeTravelStore;
  };
}

exports['default'] = timetravel;
module.exports = exports['default'];