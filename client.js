import foo from './foo'
import Iso from 'iso'

Iso.bootstrap((state, meta, node) => {
  foo.client(state, { id: 1 }, node)
})
