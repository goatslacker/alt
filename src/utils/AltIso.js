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
      }).catch(
        /* istanbul ignore next */
        (err) => {
          // this is a fail-safe case you should never hit. In case there's an
          // error flushing alt or something blows up then we should render
          // empty markup so that we can bootstrap anyway and render client side.
          return {
            err,
            html: Iso.render()
          }
        }
      )
    } else {
      Iso.bootstrap((state, meta, node) => {
        alt.bootstrap(state)
        new Render(alt).toDOM(Component, props, node, meta)
      })
      return Promise.resolve()
    }
  }
}
