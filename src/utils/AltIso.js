import Iso from 'iso'
import * as Render from './Render'

export default {
  define: Render.withData,

  render(alt, Component, props) {
    // recycle state
    alt.recycle()

    if (typeof window === 'undefined') {
      alt.buffer = true
      return Render.toString(Component, props).then((obj) => {
        return {
          html: Iso.render(obj.html, alt.takeSnapshot(), { iso: 1 })
        }
      }).catch((err) => {
        // return the empty markup in html when there's an error
        return {
          err,
          html: Iso.render()
        }
      })
    } else {
      return Promise.resolve(
        Iso.bootstrap((state, meta, node) => {
          alt.bootstrap(state)
          Render.toDOM(Component, props, node, meta.iso)
        })
      )
    }
  }
}
