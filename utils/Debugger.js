/*eslint-disable */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _debugDebugActions = require('./debug/DebugActions');

var _debugDebugActions2 = _interopRequireDefault(_debugDebugActions);

var _DispatcherDebugger = require('./DispatcherDebugger');

var _DispatcherDebugger2 = _interopRequireDefault(_DispatcherDebugger);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _StoreExplorer = require('./StoreExplorer');

var _StoreExplorer2 = _interopRequireDefault(_StoreExplorer);

var Debugger = (function (_React$Component) {
  function Debugger() {
    _classCallCheck(this, Debugger);

    _get(Object.getPrototypeOf(Debugger.prototype), 'constructor', this).apply(this, arguments);
  }

  _inherits(Debugger, _React$Component);

  _createClass(Debugger, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      _debugDebugActions2['default'].setAlt(this.props.alt);
    }
  }, {
    key: 'renderInspectorWindow',
    value: function renderInspectorWindow() {
      return this.props.inspector ? _react2['default'].createElement(this.props.inspector, null) : null;
    }
  }, {
    key: 'render',
    value: function render() {
      return _react2['default'].createElement(
        'div',
        null,
        _react2['default'].createElement(
          'h1',
          null,
          'Debug'
        ),
        _react2['default'].createElement(_DispatcherDebugger2['default'], { alt: this.props.alt }),
        _react2['default'].createElement(_StoreExplorer2['default'], { alt: this.props.alt }),
        this.renderInspectorWindow()
      );
    }
  }]);

  return Debugger;
})(_react2['default'].Component);

exports['default'] = Debugger;
module.exports = exports['default'];