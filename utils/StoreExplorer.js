'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _debugAltStore = require('./debug/AltStore');

var _debugAltStore2 = _interopRequireDefault(_debugAltStore);

var _debugDebugActions = require('./debug/DebugActions');

var _debugDebugActions2 = _interopRequireDefault(_debugDebugActions);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _connectToStores = require('./connectToStores');

var _connectToStores2 = _interopRequireDefault(_connectToStores);

var StoreExplorer = (function (_React$Component) {
  function StoreExplorer() {
    _classCallCheck(this, StoreExplorer);

    _get(Object.getPrototypeOf(StoreExplorer.prototype), 'constructor', this).call(this);

    this.selectStore = this.selectStore.bind(this);
  }

  _inherits(StoreExplorer, _React$Component);

  _createClass(StoreExplorer, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      _debugDebugActions2['default'].setAlt(this.props.alt);
    }
  }, {
    key: 'selectStore',
    value: function selectStore(ev) {
      var data = ev.target.dataset;
      var store = this.props.alt.stores[data.name];
      if (store) _debugDebugActions2['default'].selectData(store.getState());
    }
  }, {
    key: 'render',
    value: function render() {
      var _this = this;

      return _react2['default'].createElement(
        'div',
        null,
        _react2['default'].createElement(
          'h3',
          null,
          'Stores'
        ),
        _react2['default'].createElement(
          'ul',
          null,
          this.props.stores.map(function (store) {
            return _react2['default'].createElement(
              'li',
              {
                key: store.displayName,
                onClick: _this.selectStore,
                'data-name': store.displayName,
                style: { cursor: 'pointer' }
              },
              store.displayName
            );
          })
        )
      );
    }
  }]);

  return StoreExplorer;
})(_react2['default'].Component);

exports['default'] = (0, _connectToStores2['default'])({
  getPropsFromStores: function getPropsFromStores() {
    return {
      stores: _debugAltStore2['default'].stores()
    };
  },

  getStores: function getStores() {
    return [_debugAltStore2['default']];
  }
}, StoreExplorer);
module.exports = exports['default'];