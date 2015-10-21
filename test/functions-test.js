import { assert } from 'chai'
import * as fn from '../lib/functions'
import Alt from '../dist/alt-with-runtime'

const alt = new Alt()

export default {
  'test the functions.js isPojo()': {
    'can import lib/functions'() {
      assert.ok(fn)
      assert.ok(fn.isPojo)
      assert(typeof fn.isPojo === 'function', 'isPojo is imported')
    },

    'isPojo works on regular objects'() {
      const obj = {}
      const obj2 = {foo: 'bar'}

      assert(fn.isPojo(obj) === true, 'regular object should pass')
      assert(fn.isPojo(obj2) === true, 'regular object with fields should pass')
    },

    'isPojo fails on non-objects'() {
      assert(fn.isPojo(false) === false, 'boolean should fail')
      assert(fn.isPojo(1) === false, 'integer should fail')
      assert(fn.isPojo(new Date()) === false, 'date should fail')
    },

    'isPojo works on unfrozen objects'() {
      const obj = {}
      Object.freeze(obj)

      assert(fn.isPojo(obj) === false, 'frozen objects should fail')
    },
  },

  'can bootstrap a store with/without frozen state': {
    'normal store state can be bootstrapped'() {
      class NonFrozenStore {
        constructor() {
          this.state = {
            foo: 'bar',
          }

          assert(this.state.foo === 'bar', 'State is initialized')
        }
      }

      alt.createStore(NonFrozenStore, 'NonFrozenStore', alt)
      alt.bootstrap('{"NonFrozenStore": {"foo":"bar2"}}')

      const myStore = alt.getStore('NonFrozenStore')
      assert(myStore.getState().foo === 'bar2', 'State was bootstrapped with updated bar')
    },

    'frozen store state can be bootstrapped'() {
      class FrozenStateStore {
        constructor() {
          this.config = {
            onDeserialize: (data) => {
              Object.freeze(data)
              return data
            },
          }

          this.state = {
            foo: 'bar',
          }

          Object.freeze(this.state)

          assert(this.state.foo === 'bar', 'State is initialized')
        }
      }

      alt.createStore(FrozenStateStore, 'FrozenStateStore', alt)
      alt.bootstrap('{"FrozenStateStore": {"foo":"bar2"}}')

      const myStore = alt.getStore('FrozenStateStore')
      assert(myStore.getState().foo === 'bar2', 'State was bootstrapped with updated bar')
    },
  },
}
