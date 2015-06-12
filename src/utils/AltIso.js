import Iso from 'iso'
import * as Render from './Render'

export default {
  define: Render.withData,

  render(alt, Component, props) {
    // recycle state
    alt.recycle()

    if (typeof window === 'undefined') {
      return Render.toString(Component, props).then((obj) => {
        return {
          html: Iso.render(obj.html, alt.takeSnapshot())
        }
      }).catch((err) => {
        return {
          err,
          html: Iso.render()
        }
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
