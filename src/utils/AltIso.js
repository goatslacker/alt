import Iso from 'iso'
import * as Render from './Render'

export default {
  define: Render.withData,

  render(alt, Component, props) {
    // recycle state
    alt.recycle()

    if (typeof window === 'undefined') {
      return Render.toString(Component, props).then((markup) => {
        return Iso.render(markup, alt.takeSnapshot())
      })
    } else {
      return Promise.resolve(
        Iso.bootstrap((state, _, node) => {
          alt.bootstrap(state)
          Render.toDOM(Component, props, node)
        })
      )
    }
  }
}
