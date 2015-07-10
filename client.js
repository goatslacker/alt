import foo from './foo'
import Iso from 'iso'

Iso.bootstrap((state, meta, node) => {
  console.log(meta)
  foo.client(state, meta.props, node, meta.buffer)
})
