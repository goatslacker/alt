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
    _classCallCheck(this, _class);

    this.selectedData = {};

    this.bindActions(_DebugActions2['default']);
  };

  _createClass(_class, [{
    key: 'selectData',
    value: function selectData(data) {
      this.selectedData = data;
      console.log(data);
    }
  }], [{
    key: 'displayName',
    value: 'ViewerStore',
    enumerable: true
  }, {
    key: 'config',
    value: {
      getState: function getState(state) {
        return {
          selectedData: state.selectedData
        };
      }
    },
    enumerable: true
  }]);

  return _class;
})());
module.exports = exports['default'];