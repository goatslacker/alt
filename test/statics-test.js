import Alt from '../'
import statics from '../utils/statics'
import { Component } from 'react'
import { assert } from 'chai'

const alt = new Alt()

@statics({
  a() { }
})
class Foo extends Component { }

const Bar = statics({ b() { } }, Foo)

export default {
  'statics': {
    'static methods are added to a component'() {
      assert.isFunction(Bar.a, 'works as decorator')
      assert.isFunction(Bar.b, 'works as function')
    }
  },
}
