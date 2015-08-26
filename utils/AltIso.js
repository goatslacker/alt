'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _iso = require('iso');

var _iso2 = _interopRequireDefault(_iso);

var _Render = require('./Render');

var Render = _interopRequireWildcard(_Render);

exports['default'] = {
  define: Render.withData,

  render: function render(alt, Component, props) {
    if (typeof window === 'undefined') {
      return Render.toString(alt, Component, props).then(function (obj) {
        return {
          html: _iso2['default'].render(obj.html, obj.state, { iso: 1 })
        };
      })['catch'](function (err) {
        // return the empty markup in html when there's an error
        return {
          err: err,
          html: _iso2['default'].render()
        };
      });
    } else {
      _iso2['default'].bootstrap(function (state, meta, node) {
        alt.bootstrap(state);
        Render.toDOM(Component, props, node, meta.iso);
      });
      return Promise.resolve();
    }
  }
};
module.exports = exports['default'];