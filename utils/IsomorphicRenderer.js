/**
 * IsomorphicRenderer(alt: AltInstance, App: ReactElement): mixed
 *
 * > The glue that it takes to render a react element isomorphically
 *
 * ** This util depends on iso and react **
 *
 * Usage:
 *
 * ```js
 * var IsomorphicRenderer = require('alt/utils/IsomorphicRenderer');
 * var React = require('react');
 * var Alt = require('alt');
 * var alt = new Alt();
 *
 * var App = React.createClass({
 *   render() {
 *     return (
 *       <div>Hello World</div>
 *     );
 *   }
 * });
 *
 * module.exports = IsomorphicRenderer(alt, App);
 * ```
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = IsomorphicRenderer;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _iso = require('iso');

var _iso2 = _interopRequireDefault(_iso);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function IsomorphicRenderer(alt, App) {
  /*eslint-disable */
  if (typeof window === 'undefined') {
    /*eslint-enable */
    return function () {
      var app = _react2['default'].renderToString(_react2['default'].createElement(App));
      var markup = _iso2['default'].render(app, alt.takeSnapshot());
      alt.flush();
      return markup;
    };
  } else {
    _iso2['default'].bootstrap(function (state, _, node) {
      var app = _react2['default'].createElement(App);
      alt.bootstrap(state);
      _react2['default'].render(app, node);
    });
  }
}

module.exports = exports['default'];