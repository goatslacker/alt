(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["Alt"] = factory();
	else
		root["Alt"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 4);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.isMutableObject = isMutableObject;
exports.eachObject = eachObject;
exports.assign = assign;
var isFunction = exports.isFunction = function isFunction(x) {
    return typeof x === 'function';
};

function isMutableObject(target) {
    var Ctor = target.constructor;

    return !!target && Object.prototype.toString.call(target) === '[object Object]' && isFunction(Ctor) && !Object.isFrozen(target) && (Ctor instanceof Ctor || target.type === 'AltStore');
}

function eachObject(f, o) {
    o.forEach(function (from) {
        Object.keys(Object(from)).forEach(function (key) {
            f(key, from[key]);
        });
    });
}

function assign(target) {
    for (var _len = arguments.length, source = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        source[_key - 1] = arguments[_key];
    }

    eachObject(function (key, value) {
        target[key] = value; //eslint-disable-line
    }, source);
    return target;
}

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.getInternalMethods = getInternalMethods;
exports.getPrototypeChain = getPrototypeChain;
exports.warn = warn;
exports.uid = uid;
exports.formatAsConstant = formatAsConstant;
exports.dispatchIdentity = dispatchIdentity;
exports.fsa = fsa;
exports.dispatch = dispatch;

var _functions = __webpack_require__(0);

var fn = _interopRequireWildcard(_functions);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/*eslint-disable*/
var builtIns = Object.getOwnPropertyNames(NoopClass);
var builtInProto = Object.getOwnPropertyNames(NoopClass.prototype);
/* eslint-enable */

function getInternalMethods(Obj, isProto) {
    var excluded = isProto ? builtInProto : builtIns;
    var obj = isProto ? Obj.prototype : Obj;
    return Object.getOwnPropertyNames(obj).reduce(function (value, m) {
        if (excluded.indexOf(m) !== -1) {
            return value;
        }

        value[m] = obj[m]; //eslint-disable-line
        return value;
    }, {});
}

function getPrototypeChain(Obj) {
    var methods = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    return Obj === Function.prototype ? methods : getPrototypeChain(Object.getPrototypeOf(Obj), fn.assign(getInternalMethods(Obj, true), methods));
}

function warn(msg) {
    /* istanbul ignore else */
    /*eslint-disable*/
    if (typeof console !== 'undefined') {
        console.warn(new ReferenceError(msg));
    }
    /* eslint-enable */
}

function uid(container, name) {
    var count = 0;
    var key = name;
    while (Object.hasOwnProperty.call(container, key)) {
        count += 1;
        key = name + String(count);
    }
    return key;
}

function formatAsConstant(name) {
    return name.replace(/[a-z]([A-Z])/g, function (i) {
        return i[0] + '_' + i[1].toLowerCase();
    }).toUpperCase();
}

function dispatchIdentity(x) {
    if (x === undefined) return null;

    for (var _len = arguments.length, a = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        a[_key - 1] = arguments[_key];
    }

    return a.length ? [x].concat(a) : x;
}

function fsa(id, type, payload, details) {
    return {
        type: type,
        payload: payload,
        meta: _extends({
            dispatchId: id
        }, details),

        id: id,
        action: type,
        data: payload,
        details: details
    };
}

function dispatch(id, actionObj, payload, alt) {
    var data = actionObj.dispatch(payload);
    if (data === undefined) return null;

    var type = actionObj.id;
    var namespace = type;
    var name = type;
    var details = { id: type, namespace: namespace, name: name };

    var dispatchLater = function dispatchLater(x) {
        return alt.dispatch(type, x, details);
    };

    if (fn.isFunction(data)) return data(dispatchLater, alt);

    // XXX standardize this
    return alt.dispatcher.dispatch(fsa(id, type, data, details));
}

/* istanbul ignore next */
function NoopClass() {}

/***/ }),
/* 2 */
/***/ (function(module, exports) {

// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function transmitter() {
  var subscriptions = [];
  var nowDispatching = false;
  var toUnsubscribe = {};

  var unsubscribe = function unsubscribe(onChange) {
    var id = subscriptions.indexOf(onChange);
    if (id < 0) return;
    if (nowDispatching) {
      toUnsubscribe[id] = onChange;
      return;
    }
    subscriptions.splice(id, 1);
  };

  var subscribe = function subscribe(onChange) {
    var id = subscriptions.push(onChange);
    var dispose = function dispose() {
      return unsubscribe(onChange);
    };
    return { dispose: dispose };
  };

  var publish = function publish() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    nowDispatching = true;
    try {
      subscriptions.forEach(function (subscription, id) {
        return toUnsubscribe[id] || subscription.apply(undefined, args);
      });
    } finally {
      nowDispatching = false;
      Object.keys(toUnsubscribe).forEach(function (id) {
        return unsubscribe(toUnsubscribe[id]);
      });
      toUnsubscribe = {};
    }
  };

  return {
    publish: publish,
    subscribe: subscribe,
    $subscriptions: subscriptions
  };
}

module.exports = transmitter;

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(5);


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _flux = __webpack_require__(6);

var _StateFunctions = __webpack_require__(9);

var StateFunctions = _interopRequireWildcard(_StateFunctions);

var _functions = __webpack_require__(0);

var fn = _interopRequireWildcard(_functions);

var _store = __webpack_require__(10);

var store = _interopRequireWildcard(_store);

var _AltUtils = __webpack_require__(1);

var utils = _interopRequireWildcard(_AltUtils);

var _actions = __webpack_require__(13);

var _actions2 = _interopRequireDefault(_actions);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } } /* global window */


var Alt = function () {
    function Alt() {
        var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        _classCallCheck(this, Alt);

        this.config = config;
        this.serialize = config.serialize || JSON.stringify;
        this.deserialize = config.deserialize || JSON.parse;
        this.dispatcher = config.dispatcher || new _flux.Dispatcher();
        this.batchingFunction = config.batchingFunction || function (callback) {
            return callback();
        };
        this.actions = { global: {} };
        this.stores = {};
        this.storeTransforms = config.storeTransforms || [];
        this.trapAsync = false;
        this._actionsRegistry = {};
        this._initSnapshot = {};
        this._lastSnapshot = {};
    }

    Alt.prototype.dispatch = function dispatch(action, data, details) {
        var _this = this;

        this.batchingFunction(function () {
            var id = Math.random().toString(18).substr(2, 16);

            // support straight dispatching of FSA-style actions
            if (action.hasOwnProperty('type') && action.hasOwnProperty('payload')) {
                var fsaDetails = {
                    id: action.type,
                    namespace: action.type,
                    name: action.type
                };
                return _this.dispatcher.dispatch(utils.fsa(id, action.type, action.payload, fsaDetails));
            }

            if (action.id && action.dispatch) {
                return utils.dispatch(id, action, data, _this);
            }

            return _this.dispatcher.dispatch(utils.fsa(id, action, data, details));
        });
    };

    Alt.prototype.createUnsavedStore = function createUnsavedStore(StoreModel) {
        var key = StoreModel.displayName || '';
        store.createStoreConfig(this.config, StoreModel);
        var Store = store.transformStore(this.storeTransforms, StoreModel);

        for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            args[_key - 1] = arguments[_key];
        }

        return fn.isFunction(Store) ? store.createStoreFromClass.apply(store, [this, Store, key].concat(args)) : store.createStoreFromObject(this, Store, key);
    };

    Alt.prototype.createStore = function createStore(StoreModel, iden) {
        var key = iden || StoreModel.displayName || StoreModel.name || '';
        store.createStoreConfig(this.config, StoreModel);
        var Store = store.transformStore(this.storeTransforms, StoreModel);

        /* istanbul ignore next */
        if (false) delete this.stores[key];

        if (this.stores[key] || !key) {
            if (this.stores[key]) {
                utils.warn('A store named ' + key + ' already exists, double check your store ' + 'names or pass in your own custom identifier for each store');
            } else {
                utils.warn('Store name was not specified');
            }

            key = utils.uid(this.stores, key);
        }

        for (var _len2 = arguments.length, args = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
            args[_key2 - 2] = arguments[_key2];
        }

        var storeInstance = fn.isFunction(Store) ? store.createStoreFromClass.apply(store, [this, Store, key].concat(args)) : store.createStoreFromObject(this, Store, key);

        this.stores[key] = storeInstance;
        StateFunctions.saveInitialSnapshot(this, key);

        return storeInstance;
    };

    Alt.prototype.generateActions = function generateActions() {
        var actions = { name: 'global' };

        for (var _len3 = arguments.length, actionNames = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
            actionNames[_key3] = arguments[_key3];
        }

        return this.createActions(actionNames.reduce(function (obj, action) {
            obj[action] = utils.dispatchIdentity; //eslint-disable-line
            return obj;
        }, actions));
    };

    Alt.prototype.createAction = function createAction(name, implementation, obj) {
        return (0, _actions2.default)(this, 'global', name, implementation, obj);
    };

    Alt.prototype.createActions = function createActions(ActionsClass) {
        var //eslint-disable-line
        _this3 = this;

        var exportObj = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        var actions = {};
        var key = utils.uid(this._actionsRegistry, ActionsClass.displayName || ActionsClass.name || 'Unknown');

        if (fn.isFunction(ActionsClass)) {
            fn.assign(actions, utils.getPrototypeChain(ActionsClass));

            var ActionsGenerator = function (_ActionsClass) {
                _inherits(ActionsGenerator, _ActionsClass);

                function ActionsGenerator() {
                    _classCallCheck(this, ActionsGenerator);

                    return _possibleConstructorReturn(this, _ActionsClass.apply(this, arguments));
                }

                ActionsGenerator.prototype.generateActions = function generateActions() {
                    for (var _len5 = arguments.length, actionNames = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
                        actionNames[_key5] = arguments[_key5];
                    }

                    //eslint-disable-line
                    actionNames.forEach(function (actionName) {
                        actions[actionName] = utils.dispatchIdentity;
                    });
                };

                return ActionsGenerator;
            }(ActionsClass);

            for (var _len4 = arguments.length, argsForConstructor = Array(_len4 > 2 ? _len4 - 2 : 0), _key4 = 2; _key4 < _len4; _key4++) {
                argsForConstructor[_key4 - 2] = arguments[_key4];
            }

            fn.assign(actions, new (Function.prototype.bind.apply(ActionsGenerator, [null].concat(argsForConstructor)))());
        } else {
            fn.assign(actions, ActionsClass);
        }

        this.actions[key] = this.actions[key] || {};

        fn.eachObject(function (actionName, action) {
            if (!fn.isFunction(action)) {
                exportObj[actionName] = action; //eslint-disable-line
                return;
            }

            // create the action
            exportObj[actionName] = (0, _actions2.default)(_this3, key, actionName, action, exportObj);

            // generate a constant
            var constant = utils.formatAsConstant(actionName);
            exportObj[constant] = exportObj[actionName].id; //eslint-disable-line
        }, [actions]);

        return exportObj;
    };

    Alt.prototype.takeSnapshot = function takeSnapshot() {
        for (var _len6 = arguments.length, storeNames = Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
            storeNames[_key6] = arguments[_key6];
        }

        var state = StateFunctions.snapshot(this, storeNames);
        fn.assign(this._lastSnapshot, state);
        return this.serialize(state);
    };

    Alt.prototype.rollback = function rollback() {
        StateFunctions.setAppState(this, this.serialize(this._lastSnapshot), function (storeInst) {
            storeInst.lifecycle('rollback');
            storeInst.emitChange();
        });
    };

    Alt.prototype.recycle = function recycle() {
        for (var _len7 = arguments.length, storeNames = Array(_len7), _key7 = 0; _key7 < _len7; _key7++) {
            storeNames[_key7] = arguments[_key7];
        }

        var initialSnapshot = storeNames.length ? StateFunctions.filterSnapshots(this, this._initSnapshot, storeNames) : this._initSnapshot;

        StateFunctions.setAppState(this, this.serialize(initialSnapshot), function (storeInst) {
            storeInst.lifecycle('init');
            storeInst.emitChange();
        });
    };

    Alt.prototype.flush = function flush() {
        var state = this.serialize(StateFunctions.snapshot(this));
        this.recycle();
        return state;
    };

    Alt.prototype.bootstrap = function bootstrap(data) {
        StateFunctions.setAppState(this, data, function (storeInst, state) {
            storeInst.lifecycle('bootstrap', state);
            storeInst.emitChange();
        });
    };

    Alt.prototype.prepare = function prepare(storeInst, payload) {
        var data = {};
        if (!storeInst.displayName) {
            throw new ReferenceError('Store provided does not have a name');
        }
        data[storeInst.displayName] = payload;
        return this.serialize(data);
    };

    // Instance type methods for injecting alt into your application as context

    Alt.prototype.addActions = function addActions(name, ActionsClass) {
        for (var _len8 = arguments.length, args = Array(_len8 > 2 ? _len8 - 2 : 0), _key8 = 2; _key8 < _len8; _key8++) {
            args[_key8 - 2] = arguments[_key8];
        }

        this.actions[name] = Array.isArray(ActionsClass) ? this.generateActions.apply(this, ActionsClass) //eslint-disable-line
        : this.createActions.apply(this, [ActionsClass].concat(args));
    };

    Alt.prototype.addStore = function addStore(name, StoreModel) {
        for (var _len9 = arguments.length, args = Array(_len9 > 2 ? _len9 - 2 : 0), _key9 = 2; _key9 < _len9; _key9++) {
            args[_key9 - 2] = arguments[_key9];
        }

        this.createStore.apply(this, [StoreModel, name].concat(args));
    };

    Alt.prototype.getActions = function getActions(name) {
        return this.actions[name];
    };

    Alt.prototype.getStore = function getStore(name) {
        return this.stores[name];
    };

    Alt.debug = function debug(name, alt, win) {
        var key = 'alt.js.org';
        var context = win;
        if (!context && typeof window !== 'undefined') {
            context = window;
        }
        if (typeof context !== 'undefined') {
            context[key] = context[key] || [];
            context[key].push({ name: name, alt: alt });
        }
        return alt;
    };

    return Alt;
}();

exports.default = Alt;
module.exports = exports['default'];

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * Copyright (c) 2014-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

module.exports.Dispatcher = __webpack_require__(7);


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process) {/**
 * Copyright (c) 2014-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule Dispatcher
 * 
 * @preventMunge
 */



exports.__esModule = true;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var invariant = __webpack_require__(8);

var _prefix = 'ID_';

/**
 * Dispatcher is used to broadcast payloads to registered callbacks. This is
 * different from generic pub-sub systems in two ways:
 *
 *   1) Callbacks are not subscribed to particular events. Every payload is
 *      dispatched to every registered callback.
 *   2) Callbacks can be deferred in whole or part until other callbacks have
 *      been executed.
 *
 * For example, consider this hypothetical flight destination form, which
 * selects a default city when a country is selected:
 *
 *   var flightDispatcher = new Dispatcher();
 *
 *   // Keeps track of which country is selected
 *   var CountryStore = {country: null};
 *
 *   // Keeps track of which city is selected
 *   var CityStore = {city: null};
 *
 *   // Keeps track of the base flight price of the selected city
 *   var FlightPriceStore = {price: null}
 *
 * When a user changes the selected city, we dispatch the payload:
 *
 *   flightDispatcher.dispatch({
 *     actionType: 'city-update',
 *     selectedCity: 'paris'
 *   });
 *
 * This payload is digested by `CityStore`:
 *
 *   flightDispatcher.register(function(payload) {
 *     if (payload.actionType === 'city-update') {
 *       CityStore.city = payload.selectedCity;
 *     }
 *   });
 *
 * When the user selects a country, we dispatch the payload:
 *
 *   flightDispatcher.dispatch({
 *     actionType: 'country-update',
 *     selectedCountry: 'australia'
 *   });
 *
 * This payload is digested by both stores:
 *
 *   CountryStore.dispatchToken = flightDispatcher.register(function(payload) {
 *     if (payload.actionType === 'country-update') {
 *       CountryStore.country = payload.selectedCountry;
 *     }
 *   });
 *
 * When the callback to update `CountryStore` is registered, we save a reference
 * to the returned token. Using this token with `waitFor()`, we can guarantee
 * that `CountryStore` is updated before the callback that updates `CityStore`
 * needs to query its data.
 *
 *   CityStore.dispatchToken = flightDispatcher.register(function(payload) {
 *     if (payload.actionType === 'country-update') {
 *       // `CountryStore.country` may not be updated.
 *       flightDispatcher.waitFor([CountryStore.dispatchToken]);
 *       // `CountryStore.country` is now guaranteed to be updated.
 *
 *       // Select the default city for the new country
 *       CityStore.city = getDefaultCityForCountry(CountryStore.country);
 *     }
 *   });
 *
 * The usage of `waitFor()` can be chained, for example:
 *
 *   FlightPriceStore.dispatchToken =
 *     flightDispatcher.register(function(payload) {
 *       switch (payload.actionType) {
 *         case 'country-update':
 *         case 'city-update':
 *           flightDispatcher.waitFor([CityStore.dispatchToken]);
 *           FlightPriceStore.price =
 *             getFlightPriceStore(CountryStore.country, CityStore.city);
 *           break;
 *     }
 *   });
 *
 * The `country-update` payload will be guaranteed to invoke the stores'
 * registered callbacks in order: `CountryStore`, `CityStore`, then
 * `FlightPriceStore`.
 */

var Dispatcher = (function () {
  function Dispatcher() {
    _classCallCheck(this, Dispatcher);

    this._callbacks = {};
    this._isDispatching = false;
    this._isHandled = {};
    this._isPending = {};
    this._lastID = 1;
  }

  /**
   * Registers a callback to be invoked with every dispatched payload. Returns
   * a token that can be used with `waitFor()`.
   */

  Dispatcher.prototype.register = function register(callback) {
    var id = _prefix + this._lastID++;
    this._callbacks[id] = callback;
    return id;
  };

  /**
   * Removes a callback based on its token.
   */

  Dispatcher.prototype.unregister = function unregister(id) {
    !this._callbacks[id] ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Dispatcher.unregister(...): `%s` does not map to a registered callback.', id) : invariant(false) : undefined;
    delete this._callbacks[id];
  };

  /**
   * Waits for the callbacks specified to be invoked before continuing execution
   * of the current callback. This method should only be used by a callback in
   * response to a dispatched payload.
   */

  Dispatcher.prototype.waitFor = function waitFor(ids) {
    !this._isDispatching ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Dispatcher.waitFor(...): Must be invoked while dispatching.') : invariant(false) : undefined;
    for (var ii = 0; ii < ids.length; ii++) {
      var id = ids[ii];
      if (this._isPending[id]) {
        !this._isHandled[id] ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Dispatcher.waitFor(...): Circular dependency detected while ' + 'waiting for `%s`.', id) : invariant(false) : undefined;
        continue;
      }
      !this._callbacks[id] ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Dispatcher.waitFor(...): `%s` does not map to a registered callback.', id) : invariant(false) : undefined;
      this._invokeCallback(id);
    }
  };

  /**
   * Dispatches a payload to all registered callbacks.
   */

  Dispatcher.prototype.dispatch = function dispatch(payload) {
    !!this._isDispatching ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Dispatch.dispatch(...): Cannot dispatch in the middle of a dispatch.') : invariant(false) : undefined;
    this._startDispatching(payload);
    try {
      for (var id in this._callbacks) {
        if (this._isPending[id]) {
          continue;
        }
        this._invokeCallback(id);
      }
    } finally {
      this._stopDispatching();
    }
  };

  /**
   * Is this Dispatcher currently dispatching.
   */

  Dispatcher.prototype.isDispatching = function isDispatching() {
    return this._isDispatching;
  };

  /**
   * Call the callback stored with the given id. Also do some internal
   * bookkeeping.
   *
   * @internal
   */

  Dispatcher.prototype._invokeCallback = function _invokeCallback(id) {
    this._isPending[id] = true;
    this._callbacks[id](this._pendingPayload);
    this._isHandled[id] = true;
  };

  /**
   * Set up bookkeeping needed when dispatching.
   *
   * @internal
   */

  Dispatcher.prototype._startDispatching = function _startDispatching(payload) {
    for (var id in this._callbacks) {
      this._isPending[id] = false;
      this._isHandled[id] = false;
    }
    this._pendingPayload = payload;
    this._isDispatching = true;
  };

  /**
   * Clear bookkeeping used for dispatching.
   *
   * @internal
   */

  Dispatcher.prototype._stopDispatching = function _stopDispatching() {
    delete this._pendingPayload;
    this._isDispatching = false;
  };

  return Dispatcher;
})();

module.exports = Dispatcher;
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2)))

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process) {/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule invariant
 */



/**
 * Use invariant() to assert state which your program assumes to be true.
 *
 * Provide sprintf-style format (only %s is supported) and arguments
 * to provide information about what broke and what you were
 * expecting.
 *
 * The invariant message will be stripped in production, but the invariant
 * will remain to ensure logic does not differ in production.
 */

var invariant = function (condition, format, a, b, c, d, e, f) {
  if (process.env.NODE_ENV !== 'production') {
    if (format === undefined) {
      throw new Error('invariant requires an error message argument');
    }
  }

  if (!condition) {
    var error;
    if (format === undefined) {
      error = new Error('Minified exception occurred; use the non-minified dev environment ' + 'for the full error message and additional helpful warnings.');
    } else {
      var args = [a, b, c, d, e, f];
      var argIndex = 0;
      error = new Error('Invariant Violation: ' + format.replace(/%s/g, function () {
        return args[argIndex++];
      }));
    }

    error.framesToPop = 1; // we don't care about invariant's own frame
    throw error;
  }
};

module.exports = invariant;
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2)))

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.setAppState = setAppState;
exports.snapshot = snapshot;
exports.saveInitialSnapshot = saveInitialSnapshot;
exports.filterSnapshots = filterSnapshots;

var _functions = __webpack_require__(0);

var fn = _interopRequireWildcard(_functions);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function setAppState(instance, data, onStore) {
    var obj = instance.deserialize(data);
    fn.eachObject(function (key, value) {
        var store = instance.stores[key];
        if (store) {
            var config = store.StoreModel.config;

            var state = store.state;
            if (config.onDeserialize) obj[key] = config.onDeserialize(value) || value;
            if (fn.isMutableObject(state)) {
                fn.eachObject(function (k) {
                    return delete state[k];
                }, [state]);
                fn.assign(state, obj[key]);
            } else {
                store.state = obj[key];
            }
            onStore(store, store.state);
        }
    }, [obj]);
}

function snapshot(instance) {
    var storeNames = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

    var stores = storeNames.length ? storeNames : Object.keys(instance.stores);
    return stores.reduce(function (obj, storeHandle) {
        var storeName = storeHandle.displayName || storeHandle;
        var store = instance.stores[storeName];
        var config = store.StoreModel.config;

        store.lifecycle('snapshot');
        var customSnapshot = config.onSerialize && config.onSerialize(store.state);
        obj[storeName] = customSnapshot || store.getState(); //eslint-disable-line
        return obj;
    }, {});
}

function saveInitialSnapshot(instance, key) {
    var state = instance.deserialize(instance.serialize(instance.stores[key].state));
    instance._initSnapshot[key] = state; //eslint-disable-line
    instance._lastSnapshot[key] = state; //eslint-disable-line
}

function filterSnapshots(instance, state, stores) {
    return stores.reduce(function (obj, store) {
        var storeName = store.displayName || store;
        if (!state[storeName]) {
            throw new ReferenceError(storeName + ' is not a valid store');
        }
        obj[storeName] = state[storeName]; //eslint-disable-line
        return obj;
    }, {});
}

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.createStoreConfig = createStoreConfig;
exports.transformStore = transformStore;
exports.createStoreFromObject = createStoreFromObject;
exports.createStoreFromClass = createStoreFromClass;

var _AltUtils = __webpack_require__(1);

var utils = _interopRequireWildcard(_AltUtils);

var _functions = __webpack_require__(0);

var fn = _interopRequireWildcard(_functions);

var _AltStore = __webpack_require__(11);

var _AltStore2 = _interopRequireDefault(_AltStore);

var _StoreMixin = __webpack_require__(12);

var _StoreMixin2 = _interopRequireDefault(_StoreMixin);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function doSetState(store, storeInstance, state) {
    if (!state) {
        return;
    }

    var config = storeInstance.StoreModel.config;


    var nextState = fn.isFunction(state) ? state(storeInstance.state) : state;

    storeInstance.state = config.setState.call( //eslint-disable-line
    store, storeInstance.state, nextState);

    if (!store.alt.dispatcher.isDispatching()) {
        store.emitChange();
    }
}

function createPrototype(proto, alt, key, extras) {
    return fn.assign(proto, _StoreMixin2.default, {
        displayName: key,
        alt: alt,
        dispatcher: alt.dispatcher,
        preventDefault: function preventDefault() {
            this.getInstance().preventDefault = true;
        },

        boundListeners: [],
        lifecycleEvents: {},
        actionListeners: {},
        publicMethods: {},
        handlesOwnErrors: false
    }, extras);
}

function createStoreConfig(globalConfig, StoreModel) {
    StoreModel.config = fn.assign({
        //eslint-disable-line
        getState: function getState(state) {
            if (Array.isArray(state)) {
                return state.slice();
            } else if (fn.isMutableObject(state)) {
                return fn.assign({}, state);
            }
            return state;
        },
        setState: function setState(currentState, nextState) {
            if (fn.isMutableObject(nextState)) {
                return fn.assign(currentState, nextState);
            }
            return nextState;
        }
    }, globalConfig, StoreModel.config);
}

function transformStore(transforms, StoreModel) {
    return transforms.reduce(function (Store, transform) {
        return transform(Store);
    }, StoreModel);
}

function createStoreFromObject(alt, StoreModel, key) {
    var storeInstance = void 0;

    var StoreProto = createPrototype({}, alt, key, fn.assign({
        getInstance: function getInstance() {
            return storeInstance;
        },
        setState: function setState(nextState) {
            doSetState(this, storeInstance, nextState);
        }
    }, StoreModel));

    // bind the store listeners
    /* istanbul ignore else */
    if (StoreProto.bindListeners) {
        _StoreMixin2.default.bindListeners.call(StoreProto, StoreProto.bindListeners);
    }
    /* istanbul ignore else */
    if (StoreProto.observe) {
        _StoreMixin2.default.bindListeners.call(StoreProto, StoreProto.observe(alt));
    }

    // bind the lifecycle events
    /* istanbul ignore else */
    if (StoreProto.lifecycle) {
        fn.eachObject(function (eventName, event) {
            _StoreMixin2.default.on.call(StoreProto, eventName, event);
        }, [StoreProto.lifecycle]);
    }

    // create the instance and fn.assign the public methods to the instance
    storeInstance = fn.assign(new _AltStore2.default(alt, StoreProto, StoreProto.state !== undefined ? StoreProto.state : {}, StoreModel), StoreProto.publicMethods, {
        displayName: key,
        config: StoreModel.config
    });

    return storeInstance;
}

function createStoreFromClass(alt, StoreModel, key) {
    var storeInstance = void 0;
    var config = StoreModel.config;

    // Creating a class here so we don't overload the provided store's
    // prototype with the mixin behaviour and I'm extending from StoreModel
    // so we can inherit any extensions from the provided store.

    var Store = function (_StoreModel) {
        _inherits(Store, _StoreModel);

        function Store() {
            _classCallCheck(this, Store);

            return _possibleConstructorReturn(this, _StoreModel.apply(this, arguments));
        }

        return Store;
    }(StoreModel);

    createPrototype(Store.prototype, alt, key, {
        type: 'AltStore',
        getInstance: function getInstance() {
            return storeInstance;
        },
        setState: function setState(nextState) {
            doSetState(this, storeInstance, nextState);
        }
    });

    for (var _len = arguments.length, argsForClass = Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
        argsForClass[_key - 3] = arguments[_key];
    }

    var store = new (Function.prototype.bind.apply(Store, [null].concat(argsForClass)))();

    /* istanbul ignore next */
    if (config.bindListeners) store.bindListeners(config.bindListeners);
    /* istanbul ignore next */
    if (config.datasource) store.registerAsync(config.datasource);

    storeInstance = fn.assign(new _AltStore2.default(alt, store, store.state !== undefined ? store.state : store, StoreModel), utils.getInternalMethods(StoreModel), config.publicMethods, { displayName: key });

    return storeInstance;
}

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _transmitter = __webpack_require__(3);

var _transmitter2 = _interopRequireDefault(_transmitter);

var _functions = __webpack_require__(0);

var fn = _interopRequireWildcard(_functions);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AltStore = function () {
    function AltStore(alt, model, state, StoreModel) {
        var _this = this;

        _classCallCheck(this, AltStore);

        var lifecycleEvents = model.lifecycleEvents;
        this.transmitter = (0, _transmitter2.default)();
        this.lifecycle = function (event, x) {
            if (lifecycleEvents[event]) lifecycleEvents[event].publish(x);
        };
        this.state = state;

        this.alt = alt;
        this.preventDefault = false;
        this.displayName = model.displayName;
        this.boundListeners = model.boundListeners;
        this.StoreModel = StoreModel;
        this.reduce = model.reduce || function (x) {
            return x;
        };
        this.subscriptions = [];

        var output = model.output || function (x) {
            return x;
        };

        this.emitChange = function () {
            return _this.transmitter.publish(output(_this.state));
        };

        var handleDispatch = function handleDispatch(f, payload) {
            try {
                return f();
            } catch (e) {
                if (model.handlesOwnErrors) {
                    _this.lifecycle('error', {
                        error: e,
                        payload: payload,
                        state: _this.state
                    });
                    return false;
                }

                throw e;
            }
        };

        fn.assign(this, model.publicMethods);

        // Register dispatcher
        this.dispatchToken = alt.dispatcher.register(function (payload) {
            _this.preventDefault = false;

            _this.lifecycle('beforeEach', {
                payload: payload,
                state: _this.state
            });

            var actionHandlers = model.actionListeners[payload.action];

            if (actionHandlers || model.otherwise) {
                var result = void 0;

                if (actionHandlers) {
                    result = handleDispatch(function () {
                        return actionHandlers.filter(Boolean).every(function (handler) {
                            return handler.call(model, payload.data, payload.action) !== false;
                        });
                    }, payload);
                } else {
                    result = handleDispatch(function () {
                        model.otherwise(payload.data, payload.action);
                    }, payload);
                }
                if (result !== false && !_this.preventDefault) _this.emitChange();
            }

            if (model.reduce) {
                handleDispatch(function () {
                    var value = model.reduce(_this.state, payload);
                    if (value !== undefined) _this.state = value;
                }, payload);
                if (!_this.preventDefault) _this.emitChange();
            }

            _this.lifecycle('afterEach', {
                payload: payload,
                state: _this.state
            });
        });

        this.lifecycle('init');
    }

    AltStore.prototype.listen = function listen(cb) {
        var _this2 = this;

        if (!fn.isFunction(cb)) throw new TypeError('listen expects a function');

        var _transmitter$subscrib = this.transmitter.subscribe(cb),
            dispose = _transmitter$subscrib.dispose;

        this.subscriptions.push({ cb: cb, dispose: dispose });
        return function () {
            _this2.lifecycle('unlisten');
            dispose();
        };
    };

    AltStore.prototype.unlisten = function unlisten(cb) {
        this.lifecycle('unlisten');
        this.subscriptions.filter(function (subscription) {
            return subscription.cb === cb;
        }).forEach(function (subscription) {
            return subscription.dispose();
        });
    };

    AltStore.prototype.getState = function getState() {
        return this.StoreModel.config.getState.call(this, this.state);
    };

    return AltStore;
}();

exports.default = AltStore;
module.exports = exports['default'];

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _transmitter = __webpack_require__(3);

var _transmitter2 = _interopRequireDefault(_transmitter);

var _functions = __webpack_require__(0);

var fn = _interopRequireWildcard(_functions);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var StoreMixin = {
    waitFor: function waitFor() {
        for (var _len = arguments.length, sources = Array(_len), _key = 0; _key < _len; _key++) {
            sources[_key] = arguments[_key];
        }

        if (!sources.length) {
            throw new ReferenceError('Dispatch tokens not provided');
        }

        var sourcesArray = sources;
        if (sources.length === 1) {
            sourcesArray = Array.isArray(sources[0]) ? sources[0] : sources;
        }

        var tokens = sourcesArray.map(function (source) {
            return source.dispatchToken || source;
        });

        this.dispatcher.waitFor(tokens);
    },
    exportAsync: function exportAsync(asyncMethods) {
        this.registerAsync(asyncMethods);
    },
    registerAsync: function registerAsync(asyncDef) {
        var _this = this;

        var loadCounter = 0;

        var asyncMethods = fn.isFunction(asyncDef) ? asyncDef(this.alt) : asyncDef;

        var toExport = Object.keys(asyncMethods).reduce(function (publicMethods, methodName) {
            var desc = asyncMethods[methodName];
            var spec = fn.isFunction(desc) ? desc(_this) : desc;

            var validHandlers = ['success', 'error', 'loading'];
            validHandlers.forEach(function (handler) {
                if (spec[handler] && !spec[handler].id) {
                    throw new Error(handler + ' handler must be an action function');
                }
            });

            publicMethods[methodName] = function () {
                for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                    args[_key2] = arguments[_key2];
                }

                //eslint-disable-line
                var state = _this.getInstance().getState();
                var value = spec.local && spec.local.apply(spec, [state].concat(args));
                var shouldFetch = spec.shouldFetch ? spec.shouldFetch.apply(spec, [state].concat(args))
                /*eslint-disable*/
                : value == null;
                /* eslint-enable */
                var intercept = spec.interceptResponse || function (x) {
                    return x;
                };
                var makeActionHandler = function makeActionHandler(action, isError) {
                    return function (x) {
                        var fire = function fire() {
                            loadCounter -= 1;
                            action(intercept(x, action, args));
                            if (isError) throw x;
                            return x;
                        };
                        return _this.alt.trapAsync ? function () {
                            return fire();
                        } : fire();
                    };
                };

                // if we don't have it in cache then fetch it
                if (shouldFetch) {
                    loadCounter += 1;
                    /* istanbul ignore else */
                    if (spec.loading) spec.loading(intercept(null, spec.loading, args));
                    return spec.remote.apply(spec, [state].concat(args)).then(makeActionHandler(spec.success), makeActionHandler(spec.error, 1));
                }

                // otherwise emit the change now
                _this.emitChange();
                return value;
            };

            return publicMethods;
        }, {});

        this.exportPublicMethods(toExport);
        this.exportPublicMethods({
            isLoading: function isLoading() {
                return loadCounter > 0;
            }
        });
    },
    exportPublicMethods: function exportPublicMethods(methods) {
        var _this2 = this;

        fn.eachObject(function (methodName, value) {
            if (!fn.isFunction(value)) {
                throw new TypeError('exportPublicMethods expects a function');
            }

            _this2.publicMethods[methodName] = value;
        }, [methods]);
    },
    emitChange: function emitChange() {
        this.getInstance().emitChange();
    },
    on: function on(lifecycleEvent, handler) {
        if (lifecycleEvent === 'error') this.handlesOwnErrors = true;
        var bus = this.lifecycleEvents[lifecycleEvent] || (0, _transmitter2.default)();
        this.lifecycleEvents[lifecycleEvent] = bus;
        return bus.subscribe(handler.bind(this));
    },
    bindAction: function bindAction(symbol, handler) {
        if (!symbol) {
            throw new ReferenceError('Invalid action reference passed in');
        }
        if (!fn.isFunction(handler)) {
            throw new TypeError('bindAction expects a function');
        }

        // You can pass in the constant or the function itself
        var key = symbol.id ? symbol.id : symbol;
        this.actionListeners[key] = this.actionListeners[key] || [];
        this.actionListeners[key].push(handler.bind(this));
        this.boundListeners.push(key);
    },
    bindActions: function bindActions(actions) {
        var _this3 = this;

        fn.eachObject(function (action, symbol) {
            var matchFirstCharacter = /./;
            var assumedEventHandler = action.replace(matchFirstCharacter, function (x) {
                return 'on' + x[0].toUpperCase();
            });

            if (_this3[action] && _this3[assumedEventHandler]) {
                // If you have both action and onAction
                throw new ReferenceError('You have multiple action handlers bound to an action: ' + (action + ' and ' + assumedEventHandler));
            }

            var handler = _this3[action] || _this3[assumedEventHandler];
            if (handler) {
                _this3.bindAction(symbol, handler);
            }
        }, [actions]);
    },
    bindListeners: function bindListeners(obj) {
        var _this4 = this;

        fn.eachObject(function (methodName, symbol) {
            var listener = _this4[methodName];

            if (!listener) {
                throw new ReferenceError(methodName + ' defined but does not exist in ' + _this4.displayName);
            }

            if (Array.isArray(symbol)) {
                symbol.forEach(function (action) {
                    _this4.bindAction(action, listener);
                });
            } else {
                _this4.bindAction(symbol, listener);
            }
        }, [obj]);
    }
};

exports.default = StoreMixin;
module.exports = exports['default'];

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = makeAction;

var _isPromise = __webpack_require__(14);

var _isPromise2 = _interopRequireDefault(_isPromise);

var _functions = __webpack_require__(0);

var fn = _interopRequireWildcard(_functions);

var _AltUtils = __webpack_require__(1);

var utils = _interopRequireWildcard(_AltUtils);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function makeAction(alt, namespace, name, implementation, obj) {
    var id = utils.uid(alt._actionsRegistry, namespace + '.' + name);
    alt._actionsRegistry[id] = 1; //eslint-disable-line

    var data = { id: id, namespace: namespace, name: name };

    var dispatch = function dispatch(payload) {
        return alt.dispatch(id, payload, data);
    };

    // the action itself
    var action = function action() {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        var invocationResult = implementation.apply(obj, args);
        var actionResult = invocationResult;

        // async functions that return promises should not be dispatched
        if (invocationResult !== undefined && !(0, _isPromise2.default)(invocationResult)) {
            if (fn.isFunction(invocationResult)) {
                // inner function result should be returned as an action result
                actionResult = invocationResult(dispatch, alt);
            } else {
                dispatch(invocationResult);
            }
        }

        if (invocationResult === undefined) {
            utils.warn('An action was called but nothing was dispatched');
        }

        return actionResult;
    };
    action.defer = function () {
        for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
        }

        return setTimeout(function () {
            return action.apply(undefined, args);
        });
    };
    action.id = id;
    action.data = data;

    // ensure each reference is unique in the namespace
    var container = alt.actions[namespace];
    var namespaceId = utils.uid(container, name);
    container[namespaceId] = action;

    // generate a constant
    var constant = utils.formatAsConstant(namespaceId);
    container[constant] = id;

    return action;
}
module.exports = exports['default'];

/***/ }),
/* 14 */
/***/ (function(module, exports) {

module.exports = isPromise;

function isPromise(obj) {
  return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function';
}


/***/ })
/******/ ]);
});