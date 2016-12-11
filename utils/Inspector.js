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

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _debugViewerStore = require('./debug/ViewerStore');

var _debugViewerStore2 = _interopRequireDefault(_debugViewerStore);

var _connectToStores = require('./connectToStores');

var _connectToStores2 = _interopRequireDefault(_connectToStores);

var Styles = {
  root: {
    font: '14px/1.4 Consolas, monospace'
  },

  line: {
    cursor: 'pointer',
    paddingLeft: '1em'
  },

  key: {
    color: '#656865'
  },

  string: {
    color: '#87af5f',
    cursor: 'text',
    marginLeft: '0.1em'
  },

  boolean: {
    color: '#f55e5f',
    cursor: 'text',
    marginLeft: '0.1em'
  },

  number: {
    color: '#57b3df',
    cursor: 'text',
    marginLeft: '0.1em'
  },

  helper: {
    color: '#b0b0b0',
    marginLeft: '0.1em'
  }
};

var Leaf = (function (_React$Component) {
  function Leaf(props) {
    _classCallCheck(this, Leaf);

    _get(Object.getPrototypeOf(Leaf.prototype), 'constructor', this).call(this, props);

    this.state = {
      hidden: this.props.hidden
    };

    this.toggle = this._toggle.bind(this);
  }

  _inherits(Leaf, _React$Component);

  _createClass(Leaf, [{
    key: 'renderValue',
    value: function renderValue() {
      var _this = this;

      if (typeof this.props.data === 'object' && this.props.data) {
        if (this.state.hidden) {
          return null;
        }

        return Object.keys(this.props.data).map(function (node, i) {
          return _react2['default'].createElement(Leaf, {
            key: i,
            label: node,
            data: _this.props.data[node],
            level: _this.props.level + 1,
            hidden: _this.props.level > 0
          });
        });
      } else {
        var jstype = typeof this.props.data;

        return _react2['default'].createElement(
          'span',
          { style: Styles[jstype] },
          String(this.props.data)
        );
      }
    }
  }, {
    key: 'renderPluralCount',
    value: function renderPluralCount(n) {
      return n === 0 ? '' : n === 1 ? '1 item' : n + ' items';
    }
  }, {
    key: 'renderLabel',
    value: function renderLabel() {
      var label = this.props.label || 'dispatch';

      var jstype = typeof this.props.data;

      var type = jstype !== 'object' ? '' : Array.isArray(this.props.data) ? '[]' : '{}';

      var length = jstype === 'object' && this.props.data != null ? Object.keys(this.props.data).length : 0;

      return _react2['default'].createElement(
        'span',
        null,
        _react2['default'].createElement(
          'span',
          { style: Styles.key },
          label,
          ':'
        ),
        _react2['default'].createElement(
          'span',
          { style: Styles.helper },
          type,
          ' ',
          this.renderPluralCount(length)
        )
      );
    }
  }, {
    key: '_toggle',
    value: function _toggle() {
      this.setState({
        hidden: !this.state.hidden
      });
    }
  }, {
    key: 'render',
    value: function render() {
      return _react2['default'].createElement(
        'div',
        { style: Styles.line },
        _react2['default'].createElement(
          'span',
          { onClick: this.toggle },
          this.renderLabel()
        ),
        this.renderValue()
      );
    }
  }]);

  return Leaf;
})(_react2['default'].Component);

Leaf.defaultProps = { hidden: true };

var Inspector = (function (_React$Component2) {
  function Inspector() {
    _classCallCheck(this, Inspector);

    _get(Object.getPrototypeOf(Inspector.prototype), 'constructor', this).call(this);
  }

  _inherits(Inspector, _React$Component2);

  _createClass(Inspector, [{
    key: 'render',
    value: function render() {
      return _react2['default'].createElement(
        'div',
        { styles: Styles.root },
        _react2['default'].createElement(Leaf, { data: this.props.selectedData, hidden: false, level: 0 })
      );
    }
  }]);

  return Inspector;
})(_react2['default'].Component);

exports['default'] = (0, _connectToStores2['default'])({
  getPropsFromStores: function getPropsFromStores() {
    return _debugViewerStore2['default'].getState();
  },

  getStores: function getStores() {
    return [_debugViewerStore2['default']];
  }
}, Inspector);
module.exports = exports['default'];