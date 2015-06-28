import Iso from 'iso'
import Render from './Render'

export default {
  define: Render.resolve,
  resolve: Render.resolve,

  render(alt, Component, props) {
    if (typeof window === 'undefined') {
      return new Render(alt).toString(Component, props).then((obj) => {
        return {
          html: Iso.render(obj.html, obj.state, {
            fulfilled: obj.fulfilled
          })
        }
      }).catch((err) => {
        // return the empty markup in html when there's an error
        return {
          err,
          html: Iso.render()
        }
      })
    } else {
      Iso.bootstrap((state, meta, node) => {
        alt.bootstrap(state)
        new Render(alt).toDOM(Component, props, node, meta)
      })
      return Promise.resolve()
    }
  }
}
