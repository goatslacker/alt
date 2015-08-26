'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = withAltContext;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function withAltContext(flux) {
  return function (Component) {
    return _react2['default'].createClass({
      childContextTypes: {
        flux: _react2['default'].PropTypes.object
      },

      getChildContext: function getChildContext() {
        return { flux: flux };
      },

      render: function render() {
        return _react2['default'].createElement(Component, this.props);
      }
    });
  };
}

module.exports = exports['default'];