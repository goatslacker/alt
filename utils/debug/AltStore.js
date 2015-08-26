'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _alt = require('./alt');

var _alt2 = _interopRequireDefault(_alt);

var _DebugActions = require('./DebugActions');

var _DebugActions2 = _interopRequireDefault(_DebugActions);

exports['default'] = _alt2['default'].createStore((function () {
  var _class = function _class() {
    var _this = this;

    _classCallCheck(this, _class);

    this.alt = null;
    this.stores = [];

    this.bindActions(_DebugActions2['default']);

    this.exportPublicMethods({
      alt: function alt() {
        return _this.alt;
      },
      stores: function stores() {
        return _this.stores;
      }
    });
  };

  _createClass(_class, [{
    key: 'setAlt',
    value: function setAlt(altInst) {
      var _this2 = this;

      this.alt = altInst;
      this.stores = Object.keys(this.alt.stores).map(function (name) {
        return _this2.alt.stores[name];
      });
    }
  }], [{
    key: 'displayName',
    value: 'AltStore',
    enumerable: true
  }, {
    key: 'config',
    value: {
      getState: function getState(state) {
        return {
          stores: state.stores
        };
      }
    },
    enumerable: true
  }]);

  return _class;
})());
module.exports = exports['default'];