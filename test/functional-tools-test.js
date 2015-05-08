import { assert } from 'chai'
import Alt from '../'
import { createStore } from '../utils/decorators'
import { map, filter, reduce, flatMap, zipWith } from '../utils/fp'

const alt = new Alt()

@createStore(alt)
class Store1 {
  constructor() {
    this.a = 1
    this.num = 1
    this.arr = [1, 2, 3]
  }
}

@createStore(alt)
class Store2 {
  constructor() {
    this.b = 2
    this.num = 2
    this.arr = [4, 5, 6]
  }
}

@createStore(alt)
class Store3 {
  constructor() {
    this.c = 3
    this.num = 3
    this.arr = [7, 8, 9]
  }
}

const collection = [Store1, Store2, Store3]

export default {
  'functional tools': {
    'currying'() {
      const filterTwo = filter((state) => state.num !== 2)
      assert.isFunction(filterTwo)
      assert.isArray(filterTwo(collection))

      const mapSquare = map((state) => state.num * state.num)
      assert.isFunction(mapSquare)
      assert.isArray(mapSquare(collection))

      const replaceState = reduce((state, nextState) => nextState)
      assert.isFunction(replaceState)
      assert.isObject(replaceState(collection))

      const flatten = flatMap(state => state.arr)
      assert.isFunction(flatten)
      assert.isArray(flatten(collection))

      const zip = zipWith(state => state)
      assert.isFunction(zip)
      assert.isArray(zip(collection, collection))
    },

    'map'() {
      const value = map((state) => {
        return state.num * 2
      }, collection)

      assert.deepEqual(value, [2, 4, 6])
    },

    'filter'() {
      const value = filter((state) => {
        return state.num === 2
      }, collection)

      assert(value[0] === Store2)
    },

    'reduce'() {
      const value = reduce((n, nextState) => {
        return n + nextState.num
      }, collection, 0)

      assert(value === 6)
    },

    'zipWith'() {
      const value = zipWith((a, b) => {
        return a.arr.concat(b.arr).reduce((n, x) => n + x, 0)
      }, [Store1], [Store2])

      assert(value[0] === 21)
    },

    'flatMap'() {
      const value = flatMap((state) => {
        return state.num === 2
          ? state.num
          : state.arr
      }, collection)
      assert.deepEqual(value, [1, 2, 3, 2, 7, 8, 9])
    },
  }
}
