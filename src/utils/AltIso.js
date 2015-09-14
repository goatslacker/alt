import Iso from 'iso'
import * as Render from './Render'

export default {
  define: Render.withData,

  render(alt, Component, props) {
    if (typeof window === 'undefined') {
      return Render.toString(alt, Component, props).then((obj) => {
        return {
          html: Iso.render(obj.html, obj.state, { iso: 1 }),
        }
      }).catch((err) => {
        // return the empty markup in html when there's an error
        return {
          err,
          html: Iso.render(),
        }
      })
    }

    Iso.bootstrap((state, meta, node) => {
      alt.bootstrap(state)
      Render.toDOM(Component, props, node, meta.iso)
    })
    return Promise.resolve()
  },
}
