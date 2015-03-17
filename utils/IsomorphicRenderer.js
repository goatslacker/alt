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
