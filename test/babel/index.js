(function (global) {
  const babelHelpers = global.babelHelpers = {} //eslint-disable-line

  babelHelpers.jsx = (function () {
    const REACT_ELEMENT_TYPE = typeof Symbol === 'function' && Symbol.for && Symbol.for('react.element') || 0xeac7 //eslint-disable-line
    return function createRawReactElement(type, props, key, children) {
      const defaultProps = type && type.defaultProps
      const childrenLength = arguments.length - 3

      if (!props && childrenLength !== 0) {
        props = {}
      }

      if (props && defaultProps) {
        for (const propName in defaultProps) {
          if (props[propName] === void 0) { //eslint-disable-line
            props[propName] = defaultProps[propName]
          }
        }
      } else if (!props) {
        props = defaultProps || {}
      }

      if (childrenLength === 1) {
        props.children = children
      } else if (childrenLength > 1) {
        const childArray = Array(childrenLength)

        for (let i = 0; i < childrenLength; i++) {
          childArray[i] = arguments[i + 3]
        }

        props.children = childArray
      }

      return {
        $$typeof: REACT_ELEMENT_TYPE,
        type,
        key: key === undefined ? null : `${key}`,
        ref: null,
        props,
        _owner: null
      }
    }
  }())

  babelHelpers.asyncToGenerator = function (fn) {
    return function () {
      const gen = fn.apply(this, arguments)
      return new Promise(((resolve, reject) => {
        function step(key, arg) {
          let info = null
          let value = null
          try {
            info = gen[key](arg)
            value = info.value
          } catch (error) {
            reject(error)
            return
          }

          if (info.done) {
            resolve(value)
          } else {
            Promise.resolve(value).then((promiseValue) => {
              step('next', promiseValue)
            }, (err) => {
              step('throw', err)
            })
          }
        }
        step('next')
      }))
    }
  }

  babelHelpers.classCallCheck = function (instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError('Cannot call a class as a function')
    }
  }

  babelHelpers.createClass = (function () {
    function defineProperties(target, props) {
      for (let i = 0; i < props.length; i++) {
        const descriptor = props[i]
        descriptor.enumerable = descriptor.enumerable || false
        descriptor.configurable = true
        if ('value' in descriptor) descriptor.writable = true
        Object.defineProperty(target, descriptor.key, descriptor)
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps)
      if (staticProps) defineProperties(Constructor, staticProps)
      return Constructor
    }
  }())

  babelHelpers.defineEnumerableProperties = function (obj, descs) {
    for (const key in descs) {
      if (!descs.hasOwnProperty(key)) continue
      const desc = descs[key]
      desc.configurable = desc.enumerable = true //eslint-disable-line
      if ('value' in desc) desc.writable = true
      Object.defineProperty(obj, key, desc)
    }

    return obj
  }

  babelHelpers.defaults = function (obj, defaults) {
    const keys = Object.getOwnPropertyNames(defaults)

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      const value = Object.getOwnPropertyDescriptor(defaults, key)

      if (value && value.configurable && obj[key] === undefined) {
        Object.defineProperty(obj, key, value)
      }
    }

    return obj
  }

  babelHelpers.defineProperty = function (obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value,
        enumerable: true,
        configurable: true,
        writable: true
      })
    } else {
      obj[key] = value
    }

    return obj
  }

  babelHelpers.extends = Object.assign || function (target) {
    for (let i = 1; i < arguments.length; i++) {
      const source = arguments[i]

      for (const key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key]
        }
      }
    }

    return target
  }

  babelHelpers.get = function get(object, property, receiver) {
    if (object === null) object = Function.prototype
    const desc = Object.getOwnPropertyDescriptor(object, property)

    if (desc === undefined) {
      const parent = Object.getPrototypeOf(object)

      if (parent === null) {
        return undefined
      }
      return get(parent, property, receiver)
    } else if ('value' in desc) {
      return desc.value
    }
    const getter = desc.get

    if (getter === undefined) {
      return undefined
    }

    return getter.call(receiver)
  }

  babelHelpers.inherits = function (subClass, superClass) {
    if (typeof superClass !== 'function' && superClass !== null) {
      throw new TypeError(`Super expression must either be null or a function, not ${typeof superClass}`)
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    })
    if (superClass) {
        if (Object.setPrototypeOf) {
            Object.setPrototypeOf(subClass, superClass)
        } else {
            subClass.__proto__ = superClass
        }
  }

  babelHelpers.instanceof = function (left, right) {
    if (right != null && typeof Symbol !== 'undefined' && right[Symbol.hasInstance]) {
      return right[Symbol.hasInstance](left)
    }
    return left instanceof right
  }

  babelHelpers.interopRequireDefault = function (obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    }
  }

  babelHelpers.interopRequireWildcard = function (obj) {
    if (obj && obj.__esModule) {
      return obj
    }
    const newObj = {}

    if (obj != null) {
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]
      }
    }

    newObj.default = obj
    return newObj
  }

  babelHelpers.newArrowCheck = function (innerThis, boundThis) {
    if (innerThis !== boundThis) {
      throw new TypeError('Cannot instantiate an arrow function')
    }
  }

  babelHelpers.objectDestructuringEmpty = function (obj) {
    if (obj == null) throw new TypeError('Cannot destructure undefined')
  }

  babelHelpers.objectWithoutProperties = function (obj, keys) {
    const target = {}

    for (const i in obj) {
      if (keys.indexOf(i) >= 0) continue
      if (!Object.prototype.hasOwnProperty.call(obj, i)) continue
      target[i] = obj[i]
    }

    return target
  }

  babelHelpers.possibleConstructorReturn = function (self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called")
    }

    return call && (typeof call === 'object' || typeof call === 'function') ? call : self
  }

  babelHelpers.selfGlobal = typeof global === 'undefined' ? self : global

  babelHelpers.set = function set(object, property, value, receiver) {
    const desc = Object.getOwnPropertyDescriptor(object, property)

    if (desc === undefined) {
      const parent = Object.getPrototypeOf(object)

      if (parent !== null) {
        set(parent, property, value, receiver)
      }
    } else if ('value' in desc && desc.writable) {
      desc.value = value
    } else {
      const setter = desc.set

      if (setter !== undefined) {
        setter.call(receiver, value)
      }
    }

    return value
  }

  babelHelpers.slicedToArray = (function () {
    function sliceIterator(arr, i) {
      const _arr = []
      let _n = true
      let _d = false
      let _e

      try {
        for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
          _arr.push(_s.value)

          if (i && _arr.length === i) break
        }
      } catch (err) {
        _d = true
        _e = err
      } finally {
        try {
          if (!_n && _i.return) _i.return()
        } finally {
          if (_d) throw _e
        }
      }

      return _arr
    }

    return function (arr, i) {
      if (Array.isArray(arr)) {
        return arr
      } else if (Symbol.iterator in Object(arr)) {
        return sliceIterator(arr, i)
      }
      throw new TypeError('Invalid attempt to destructure non-iterable instance')
    }
  }())

  babelHelpers.slicedToArrayLoose = function (arr, i) {
    if (Array.isArray(arr)) {
      return arr
    } else if (Symbol.iterator in Object(arr)) {
      const _arr = []

      for (var _iterator = arr[Symbol.iterator](), _step; !(_step = _iterator.next()).done;) {
        _arr.push(_step.value)

        if (i && _arr.length === i) break
      }

      return _arr
    }
    throw new TypeError('Invalid attempt to destructure non-iterable instance')
  }

  babelHelpers.taggedTemplateLiteral = function (strings, raw) {
    return Object.freeze(Object.defineProperties(strings, {
      raw: {
        value: Object.freeze(raw)
      }
    }))
  }

  babelHelpers.taggedTemplateLiteralLoose = function (strings, raw) {
    strings.raw = raw
    return strings
  }

  babelHelpers.temporalRef = function (val, name, undef) {
    if (val === undef) {
      throw new ReferenceError(`${name} is not defined - temporal dead zone`)
    } else {
      return val
    }
  }

  babelHelpers.temporalUndefined = {}

  babelHelpers.toArray = function (arr) {
    return Array.isArray(arr) ? arr : Array.from(arr)
  }

  babelHelpers.toConsumableArray = function (arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]

      return arr2
    }
    return Array.from(arr)
  }
}(typeof global === 'undefined' ? self : global)) //eslint-disable-line
