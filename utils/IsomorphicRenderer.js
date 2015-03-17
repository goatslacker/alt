'use strict'
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
module.exports = IsomorphicRenderer

var Iso = require('iso')
var React = require('react')

function IsomorphicRenderer(alt, App) {
  if (typeof window === 'undefined') {
    return function () {
      var app = React.renderToString(React.createElement(App))
      var markup = Iso.render(app, alt.takeSnapshot())
      alt.flush()
      return markup
    }
  } else {
    Iso.bootstrap(function (state, _, node) {
      var app = React.createElement(App)
      alt.bootstrap(state)
      React.render(app, node)
    })
  }
}
