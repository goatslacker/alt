import { assert } from 'chai'
import * as fn from '../lib/utils'
import Alt from '../'

const alt = new Alt()

export default {
  'test the functions.js isMutableObject()': {
    'can import lib/functions'() {
      assert.ok(fn)
      assert.ok(fn.isMutableObject)
      assert(typeof fn.isMutableObject === 'function', 'isMutableObject is imported')
    },

    'isMutableObject works on regular objects'() {
      const obj = {}
      const obj2 = {foo: 'bar'}

      assert(fn.isMutableObject(obj) === true, 'regular object should pass')
      assert(fn.isMutableObject(obj2) === true, 'regular object with fields should pass')
    },

    'isMutableObject fails on non-objects'() {
      assert(fn.isMutableObject(false) === false, 'boolean should fail')
      assert(fn.isMutableObject(1) === false, 'integer should fail')
      assert(fn.isMutableObject(new Date()) === false, 'date should fail')
    },

    'isMutableObject works on frozen objects'() {
      const obj = {}
      Object.freeze(obj)

      assert(fn.isMutableObject(obj) === false, 'frozen objects should fail')
    },
  },

  'can bootstrap a store with/without frozen state': {
    'normal store state can be bootstrapped'() {
      class NonFrozenStore extends Alt.Store {
        constructor() {
          super()
          this.state = {
            foo: 'bar',
          }

          assert(this.state.foo === 'bar', 'State is initialized')
        }
      }

      alt.createStore('NonFrozenStore', new NonFrozenStore())
      alt.load('{"NonFrozenStore": {"foo":"bar2"}}')

      const myStore = alt.stores.NonFrozenStore
      assert(myStore.getState().foo === 'bar2', 'State was bootstrapped with updated bar')
    },

    'frozen store state can be bootstrapped'() {
      class FrozenStateStore extends Alt.Store {
        constructor() {
          super()

          this.state = {
            foo: 'bar',
          }

          Object.freeze(this.state)

          assert(this.state.foo === 'bar', 'State is initialized')
        }
      }

      alt.createStore('FrozenStateStore', new FrozenStateStore())
      alt.load('{"FrozenStateStore": {"foo":"bar2"}}')

      const myStore = alt.stores.FrozenStateStore
      assert(myStore.getState().foo === 'bar2', 'State was bootstrapped with updated bar')
    },
  },
}
