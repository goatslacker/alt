(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["Alt"] = factory();
	else
		root["Alt"] = factory();
})(window, function() {
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
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
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
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(1);


/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var flux__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2);
/* harmony import */ var flux__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(flux__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _utils_StateFunctions__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(5);
/* harmony import */ var _functions__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(6);
/* harmony import */ var _store__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(7);
/* harmony import */ var _utils_AltUtils__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(8);
/* harmony import */ var _actions__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(12);
function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _construct(Parent, args, Class) { if (_isNativeReflectConstruct()) { _construct = Reflect.construct; } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/* global window */







var Alt = /*#__PURE__*/function () {
  function Alt() {
    var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Alt);

    this.config = config;
    this.serialize = config.serialize || JSON.stringify;
    this.deserialize = config.deserialize || JSON.parse;
    this.dispatcher = config.dispatcher || new flux__WEBPACK_IMPORTED_MODULE_0__["Dispatcher"]();

    this.batchingFunction = config.batchingFunction || function (callback) {
      return callback();
    };

    this.actions = {
      global: {}
    };
    this.stores = {};
    this.storeTransforms = config.storeTransforms || [];
    this.trapAsync = false;
    this._actionsRegistry = {};
    this._initSnapshot = {};
    this._lastSnapshot = {};
  }

  _createClass(Alt, [{
    key: "dispatch",
    value: function dispatch(action, data, details) {
      var _this = this;

      this.batchingFunction(function () {
        var id = Math.random().toString(18).substr(2, 16); // support straight dispatching of FSA-style actions

        if (action.hasOwnProperty('type') && action.hasOwnProperty('payload')) {
          var fsaDetails = {
            id: action.type,
            namespace: action.type,
            name: action.type
          };
          return _this.dispatcher.dispatch(_utils_AltUtils__WEBPACK_IMPORTED_MODULE_4__["fsa"](id, action.type, action.payload, fsaDetails));
        }

        if (action.id && action.dispatch) {
          return _utils_AltUtils__WEBPACK_IMPORTED_MODULE_4__["dispatch"](id, action, data, _this);
        }

        return _this.dispatcher.dispatch(_utils_AltUtils__WEBPACK_IMPORTED_MODULE_4__["fsa"](id, action, data, details));
      });
    }
  }, {
    key: "createUnsavedStore",
    value: function createUnsavedStore(StoreModel) {
      var key = StoreModel.displayName || '';
      _store__WEBPACK_IMPORTED_MODULE_3__["createStoreConfig"](this.config, StoreModel);
      var Store = _store__WEBPACK_IMPORTED_MODULE_3__["transformStore"](this.storeTransforms, StoreModel);

      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      return _functions__WEBPACK_IMPORTED_MODULE_2__["isFunction"](Store) ? _store__WEBPACK_IMPORTED_MODULE_3__["createStoreFromClass"].apply(_store__WEBPACK_IMPORTED_MODULE_3__, [this, Store, key].concat(args)) : _store__WEBPACK_IMPORTED_MODULE_3__["createStoreFromObject"](this, Store, key);
    }
  }, {
    key: "createStore",
    value: function createStore(StoreModel, iden) {
      var key = iden || StoreModel.displayName || StoreModel.name || '';
      _store__WEBPACK_IMPORTED_MODULE_3__["createStoreConfig"](this.config, StoreModel);
      var Store = _store__WEBPACK_IMPORTED_MODULE_3__["transformStore"](this.storeTransforms, StoreModel);
      /* istanbul ignore next */

      if (false) {}

      if (this.stores[key] || !key) {
        if (this.stores[key]) {
          _utils_AltUtils__WEBPACK_IMPORTED_MODULE_4__["warn"]("A store named ".concat(key, " already exists, double check your store ") + "names or pass in your own custom identifier for each store");
        } else {
          _utils_AltUtils__WEBPACK_IMPORTED_MODULE_4__["warn"]('Store name was not specified');
        }

        key = _utils_AltUtils__WEBPACK_IMPORTED_MODULE_4__["uid"](this.stores, key);
      }

      for (var _len2 = arguments.length, args = new Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
        args[_key2 - 2] = arguments[_key2];
      }

      var storeInstance = _functions__WEBPACK_IMPORTED_MODULE_2__["isFunction"](Store) ? _store__WEBPACK_IMPORTED_MODULE_3__["createStoreFromClass"].apply(_store__WEBPACK_IMPORTED_MODULE_3__, [this, Store, key].concat(args)) : _store__WEBPACK_IMPORTED_MODULE_3__["createStoreFromObject"](this, Store, key);
      this.stores[key] = storeInstance;
      _utils_StateFunctions__WEBPACK_IMPORTED_MODULE_1__["saveInitialSnapshot"](this, key);
      return storeInstance;
    }
  }, {
    key: "generateActions",
    value: function generateActions() {
      var actions = {
        name: 'global'
      };

      for (var _len3 = arguments.length, actionNames = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        actionNames[_key3] = arguments[_key3];
      }

      return this.createActions(actionNames.reduce(function (obj, action) {
        obj[action] = _utils_AltUtils__WEBPACK_IMPORTED_MODULE_4__["dispatchIdentity"];
        return obj;
      }, actions));
    }
  }, {
    key: "createAction",
    value: function createAction(name, implementation, obj) {
      return Object(_actions__WEBPACK_IMPORTED_MODULE_5__["default"])(this, 'global', name, implementation, obj);
    }
  }, {
    key: "createActions",
    value: function createActions(ActionsClass) {
      var _this2 = this;

      var exportObj = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var actions = {};
      var key = _utils_AltUtils__WEBPACK_IMPORTED_MODULE_4__["uid"](this._actionsRegistry, ActionsClass.displayName || ActionsClass.name || 'Unknown');

      if (_functions__WEBPACK_IMPORTED_MODULE_2__["isFunction"](ActionsClass)) {
        _functions__WEBPACK_IMPORTED_MODULE_2__["assign"](actions, _utils_AltUtils__WEBPACK_IMPORTED_MODULE_4__["getPrototypeChain"](ActionsClass));

        var ActionsGenerator = /*#__PURE__*/function (_ActionsClass) {
          _inherits(ActionsGenerator, _ActionsClass);

          var _super = _createSuper(ActionsGenerator);

          function ActionsGenerator() {
            _classCallCheck(this, ActionsGenerator);

            for (var _len5 = arguments.length, args = new Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
              args[_key5] = arguments[_key5];
            }

            return _super.call.apply(_super, [this].concat(args));
          }

          _createClass(ActionsGenerator, [{
            key: "generateActions",
            value: function generateActions() {
              for (var _len6 = arguments.length, actionNames = new Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
                actionNames[_key6] = arguments[_key6];
              }

              actionNames.forEach(function (actionName) {
                actions[actionName] = _utils_AltUtils__WEBPACK_IMPORTED_MODULE_4__["dispatchIdentity"];
              });
            }
          }]);

          return ActionsGenerator;
        }(ActionsClass);

        for (var _len4 = arguments.length, argsForConstructor = new Array(_len4 > 2 ? _len4 - 2 : 0), _key4 = 2; _key4 < _len4; _key4++) {
          argsForConstructor[_key4 - 2] = arguments[_key4];
        }

        _functions__WEBPACK_IMPORTED_MODULE_2__["assign"](actions, _construct(ActionsGenerator, argsForConstructor));
      } else {
        _functions__WEBPACK_IMPORTED_MODULE_2__["assign"](actions, ActionsClass);
      }

      this.actions[key] = this.actions[key] || {};
      _functions__WEBPACK_IMPORTED_MODULE_2__["eachObject"](function (actionName, action) {
        if (!_functions__WEBPACK_IMPORTED_MODULE_2__["isFunction"](action)) {
          exportObj[actionName] = action;
          return;
        } // create the action


        exportObj[actionName] = Object(_actions__WEBPACK_IMPORTED_MODULE_5__["default"])(_this2, key, actionName, action, exportObj); // generate a constant

        var constant = _utils_AltUtils__WEBPACK_IMPORTED_MODULE_4__["formatAsConstant"](actionName);
        exportObj[constant] = exportObj[actionName].id;
      }, [actions]);
      return exportObj;
    }
  }, {
    key: "takeSnapshot",
    value: function takeSnapshot() {
      for (var _len7 = arguments.length, storeNames = new Array(_len7), _key7 = 0; _key7 < _len7; _key7++) {
        storeNames[_key7] = arguments[_key7];
      }

      var state = _utils_StateFunctions__WEBPACK_IMPORTED_MODULE_1__["snapshot"](this, storeNames);
      _functions__WEBPACK_IMPORTED_MODULE_2__["assign"](this._lastSnapshot, state);
      return this.serialize(state);
    }
  }, {
    key: "rollback",
    value: function rollback() {
      _utils_StateFunctions__WEBPACK_IMPORTED_MODULE_1__["setAppState"](this, this.serialize(this._lastSnapshot), function (storeInst) {
        storeInst.lifecycle('rollback');
        storeInst.emitChange();
      });
    }
  }, {
    key: "recycle",
    value: function recycle() {
      for (var _len8 = arguments.length, storeNames = new Array(_len8), _key8 = 0; _key8 < _len8; _key8++) {
        storeNames[_key8] = arguments[_key8];
      }

      var initialSnapshot = storeNames.length ? _utils_StateFunctions__WEBPACK_IMPORTED_MODULE_1__["filterSnapshots"](this, this._initSnapshot, storeNames) : this._initSnapshot;
      _utils_StateFunctions__WEBPACK_IMPORTED_MODULE_1__["setAppState"](this, this.serialize(initialSnapshot), function (storeInst) {
        storeInst.lifecycle('init');
        storeInst.emitChange();
      });
    }
  }, {
    key: "flush",
    value: function flush() {
      var state = this.serialize(_utils_StateFunctions__WEBPACK_IMPORTED_MODULE_1__["snapshot"](this));
      this.recycle();
      return state;
    }
  }, {
    key: "bootstrap",
    value: function bootstrap(data) {
      _utils_StateFunctions__WEBPACK_IMPORTED_MODULE_1__["setAppState"](this, data, function (storeInst, state) {
        storeInst.lifecycle('bootstrap', state);
        storeInst.emitChange();
      });
    }
  }, {
    key: "prepare",
    value: function prepare(storeInst, payload) {
      var data = {};

      if (!storeInst.displayName) {
        throw new ReferenceError('Store provided does not have a name');
      }

      data[storeInst.displayName] = payload;
      return this.serialize(data);
    } // Instance type methods for injecting alt into your application as context

  }, {
    key: "addActions",
    value: function addActions(name, ActionsClass) {
      for (var _len9 = arguments.length, args = new Array(_len9 > 2 ? _len9 - 2 : 0), _key9 = 2; _key9 < _len9; _key9++) {
        args[_key9 - 2] = arguments[_key9];
      }

      this.actions[name] = Array.isArray(ActionsClass) ? this.generateActions.apply(this, ActionsClass) : this.createActions.apply(this, [ActionsClass].concat(args));
    }
  }, {
    key: "addStore",
    value: function addStore(name, StoreModel) {
      for (var _len10 = arguments.length, args = new Array(_len10 > 2 ? _len10 - 2 : 0), _key10 = 2; _key10 < _len10; _key10++) {
        args[_key10 - 2] = arguments[_key10];
      }

      this.createStore.apply(this, [StoreModel, name].concat(args));
    }
  }, {
    key: "getActions",
    value: function getActions(name) {
      return this.actions[name];
    }
  }, {
    key: "getStore",
    value: function getStore(name) {
      return this.stores[name];
    }
  }], [{
    key: "debug",
    value: function debug(name, alt, win) {
      var key = 'alt.js.org';
      var context = win;

      if (!context && typeof window !== 'undefined') {
        context = window;
      }

      if (typeof context !== 'undefined') {
        context[key] = context[key] || [];
        context[key].push({
          name: name,
          alt: alt
        });
      }

      return alt;
    }
  }]);

  return Alt;
}();

/* harmony default export */ __webpack_exports__["default"] = (Alt);

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * Copyright (c) 2014-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

module.exports.Dispatcher = __webpack_require__(3);


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
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

var invariant = __webpack_require__(4);

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
    !this._callbacks[id] ?  true ? invariant(false, 'Dispatcher.unregister(...): `%s` does not map to a registered callback.', id) : undefined : undefined;
    delete this._callbacks[id];
  };

  /**
   * Waits for the callbacks specified to be invoked before continuing execution
   * of the current callback. This method should only be used by a callback in
   * response to a dispatched payload.
   */

  Dispatcher.prototype.waitFor = function waitFor(ids) {
    !this._isDispatching ?  true ? invariant(false, 'Dispatcher.waitFor(...): Must be invoked while dispatching.') : undefined : undefined;
    for (var ii = 0; ii < ids.length; ii++) {
      var id = ids[ii];
      if (this._isPending[id]) {
        !this._isHandled[id] ?  true ? invariant(false, 'Dispatcher.waitFor(...): Circular dependency detected while ' + 'waiting for `%s`.', id) : undefined : undefined;
        continue;
      }
      !this._callbacks[id] ?  true ? invariant(false, 'Dispatcher.waitFor(...): `%s` does not map to a registered callback.', id) : undefined : undefined;
      this._invokeCallback(id);
    }
  };

  /**
   * Dispatches a payload to all registered callbacks.
   */

  Dispatcher.prototype.dispatch = function dispatch(payload) {
    !!this._isDispatching ?  true ? invariant(false, 'Dispatch.dispatch(...): Cannot dispatch in the middle of a dispatch.') : undefined : undefined;
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

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
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
  if (true) {
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

/***/ }),
/* 5 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setAppState", function() { return setAppState; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "snapshot", function() { return snapshot; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "saveInitialSnapshot", function() { return saveInitialSnapshot; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "filterSnapshots", function() { return filterSnapshots; });
/* harmony import */ var _functions__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(6);

function setAppState(instance, data, onStore) {
  var obj = instance.deserialize(data);
  _functions__WEBPACK_IMPORTED_MODULE_0__["eachObject"](function (key, value) {
    var store = instance.stores[key];

    if (store) {
      var config = store.StoreModel.config;
      var state = store.state;
      if (config.onDeserialize) obj[key] = config.onDeserialize(value) || value;

      if (_functions__WEBPACK_IMPORTED_MODULE_0__["isMutableObject"](state)) {
        _functions__WEBPACK_IMPORTED_MODULE_0__["eachObject"](function (k) {
          return delete state[k];
        }, [state]);
        _functions__WEBPACK_IMPORTED_MODULE_0__["assign"](state, obj[key]);
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
    obj[storeName] = customSnapshot ? customSnapshot : store.getState();
    return obj;
  }, {});
}
function saveInitialSnapshot(instance, key) {
  var state = instance.deserialize(instance.serialize(instance.stores[key].state));
  instance._initSnapshot[key] = state;
  instance._lastSnapshot[key] = state;
}
function filterSnapshots(instance, state, stores) {
  return stores.reduce(function (obj, store) {
    var storeName = store.displayName || store;

    if (!state[storeName]) {
      throw new ReferenceError("".concat(storeName, " is not a valid store"));
    }

    obj[storeName] = state[storeName];
    return obj;
  }, {});
}

/***/ }),
/* 6 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isFunction", function() { return isFunction; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isMutableObject", function() { return isMutableObject; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "eachObject", function() { return eachObject; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "assign", function() { return assign; });
var isFunction = function isFunction(x) {
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
  for (var _len = arguments.length, source = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    source[_key - 1] = arguments[_key];
  }

  eachObject(function (key, value) {
    return target[key] = value;
  }, source);
  return target;
}

/***/ }),
/* 7 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createStoreConfig", function() { return createStoreConfig; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "transformStore", function() { return transformStore; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createStoreFromObject", function() { return createStoreFromObject; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createStoreFromClass", function() { return createStoreFromClass; });
/* harmony import */ var _utils_AltUtils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(8);
/* harmony import */ var _functions__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(6);
/* harmony import */ var _AltStore__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(9);
/* harmony import */ var _StoreMixin__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(11);
function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _construct(Parent, args, Class) { if (_isNativeReflectConstruct()) { _construct = Reflect.construct; } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }






function doSetState(store, storeInstance, state) {
  if (!state) {
    return;
  }

  var config = storeInstance.StoreModel.config;
  var nextState = _functions__WEBPACK_IMPORTED_MODULE_1__["isFunction"](state) ? state(storeInstance.state) : state;
  storeInstance.state = config.setState.call(store, storeInstance.state, nextState);

  if (!store.alt.dispatcher.isDispatching()) {
    store.emitChange();
  }
}

function createPrototype(proto, alt, key, extras) {
  return _functions__WEBPACK_IMPORTED_MODULE_1__["assign"](proto, _StoreMixin__WEBPACK_IMPORTED_MODULE_3__["default"], {
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
  StoreModel.config = _functions__WEBPACK_IMPORTED_MODULE_1__["assign"]({
    getState: function getState(state) {
      if (Array.isArray(state)) {
        return state.slice();
      } else if (_functions__WEBPACK_IMPORTED_MODULE_1__["isMutableObject"](state)) {
        return _functions__WEBPACK_IMPORTED_MODULE_1__["assign"]({}, state);
      }

      return state;
    },
    setState: function setState(currentState, nextState) {
      if (_functions__WEBPACK_IMPORTED_MODULE_1__["isMutableObject"](nextState)) {
        return _functions__WEBPACK_IMPORTED_MODULE_1__["assign"](currentState, nextState);
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
  var storeInstance;
  var StoreProto = createPrototype({}, alt, key, _functions__WEBPACK_IMPORTED_MODULE_1__["assign"]({
    getInstance: function getInstance() {
      return storeInstance;
    },
    setState: function setState(nextState) {
      doSetState(this, storeInstance, nextState);
    }
  }, StoreModel)); // bind the store listeners

  /* istanbul ignore else */

  if (StoreProto.bindListeners) {
    _StoreMixin__WEBPACK_IMPORTED_MODULE_3__["default"].bindListeners.call(StoreProto, StoreProto.bindListeners);
  }
  /* istanbul ignore else */


  if (StoreProto.observe) {
    _StoreMixin__WEBPACK_IMPORTED_MODULE_3__["default"].bindListeners.call(StoreProto, StoreProto.observe(alt));
  } // bind the lifecycle events

  /* istanbul ignore else */


  if (StoreProto.lifecycle) {
    _functions__WEBPACK_IMPORTED_MODULE_1__["eachObject"](function (eventName, event) {
      _StoreMixin__WEBPACK_IMPORTED_MODULE_3__["default"].on.call(StoreProto, eventName, event);
    }, [StoreProto.lifecycle]);
  } // create the instance and fn.assign the public methods to the instance


  storeInstance = _functions__WEBPACK_IMPORTED_MODULE_1__["assign"](new _AltStore__WEBPACK_IMPORTED_MODULE_2__["default"](alt, StoreProto, StoreProto.state !== undefined ? StoreProto.state : {}, StoreModel), StoreProto.publicMethods, {
    displayName: key,
    config: StoreModel.config
  });
  return storeInstance;
}
function createStoreFromClass(alt, StoreModel, key) {
  var storeInstance;
  var config = StoreModel.config; // Creating a class here so we don't overload the provided store's
  // prototype with the mixin behaviour and I'm extending from StoreModel
  // so we can inherit any extensions from the provided store.

  var Store = /*#__PURE__*/function (_StoreModel) {
    _inherits(Store, _StoreModel);

    var _super = _createSuper(Store);

    function Store() {
      _classCallCheck(this, Store);

      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      return _super.call.apply(_super, [this].concat(args));
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

  for (var _len = arguments.length, argsForClass = new Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
    argsForClass[_key - 3] = arguments[_key];
  }

  var store = _construct(Store, argsForClass);
  /* istanbul ignore next */


  if (config.bindListeners) store.bindListeners(config.bindListeners);
  /* istanbul ignore next */

  if (config.datasource) store.registerAsync(config.datasource);
  storeInstance = _functions__WEBPACK_IMPORTED_MODULE_1__["assign"](new _AltStore__WEBPACK_IMPORTED_MODULE_2__["default"](alt, store, store.state !== undefined ? store.state : store, StoreModel), _utils_AltUtils__WEBPACK_IMPORTED_MODULE_0__["getInternalMethods"](StoreModel), config.publicMethods, {
    displayName: key
  });
  return storeInstance;
}

/***/ }),
/* 8 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getInternalMethods", function() { return getInternalMethods; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getPrototypeChain", function() { return getPrototypeChain; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "warn", function() { return warn; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "uid", function() { return uid; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "formatAsConstant", function() { return formatAsConstant; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "dispatchIdentity", function() { return dispatchIdentity; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "fsa", function() { return fsa; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "dispatch", function() { return dispatch; });
/* harmony import */ var _functions__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(6);
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }


/*eslint-disable*/

var builtIns = Object.getOwnPropertyNames(NoopClass);
var builtInProto = Object.getOwnPropertyNames(NoopClass.prototype);
/*eslint-enable*/

function getInternalMethods(Obj, isProto) {
  var excluded = isProto ? builtInProto : builtIns;
  var obj = isProto ? Obj.prototype : Obj;
  return Object.getOwnPropertyNames(obj).reduce(function (value, m) {
    if (excluded.indexOf(m) !== -1) {
      return value;
    }

    value[m] = obj[m];
    return value;
  }, {});
}
function getPrototypeChain(Obj) {
  var methods = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  return Obj === Function.prototype ? methods : getPrototypeChain(Object.getPrototypeOf(Obj), _functions__WEBPACK_IMPORTED_MODULE_0__["assign"](getInternalMethods(Obj, true), methods));
}
function warn(msg) {
  /* istanbul ignore else */

  /*eslint-disable*/
  if (typeof console !== 'undefined') {
    console.warn(new ReferenceError(msg));
  }
  /*eslint-enable*/

}
function uid(container, name) {
  var count = 0;
  var key = name;

  while (Object.hasOwnProperty.call(container, key)) {
    key = name + String(++count);
  }

  return key;
}
function formatAsConstant(name) {
  return name.replace(/[a-z]([A-Z])/g, function (i) {
    return "".concat(i[0], "_").concat(i[1].toLowerCase());
  }).toUpperCase();
}
function dispatchIdentity(x) {
  if (x === undefined) return null;

  for (var _len = arguments.length, a = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    a[_key - 1] = arguments[_key];
  }

  return a.length ? [x].concat(a) : x;
}
function fsa(id, type, payload, details) {
  return {
    type: type,
    payload: payload,
    meta: _objectSpread({
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
  var details = {
    id: type,
    namespace: namespace,
    name: name
  };

  var dispatchLater = function dispatchLater(x) {
    return alt.dispatch(type, x, details);
  };

  if (_functions__WEBPACK_IMPORTED_MODULE_0__["isFunction"](data)) return data(dispatchLater, alt); // XXX standardize this

  return alt.dispatcher.dispatch(fsa(id, type, data, details));
}
/* istanbul ignore next */

function NoopClass() {}

/***/ }),
/* 9 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _functions__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(6);
/* harmony import */ var transmitter__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(10);
/* harmony import */ var transmitter__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(transmitter__WEBPACK_IMPORTED_MODULE_1__);
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }




var AltStore = /*#__PURE__*/function () {
  function AltStore(alt, model, state, StoreModel) {
    var _this = this;

    _classCallCheck(this, AltStore);

    var lifecycleEvents = model.lifecycleEvents;
    this.transmitter = transmitter__WEBPACK_IMPORTED_MODULE_1___default()();

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

    _functions__WEBPACK_IMPORTED_MODULE_0__["assign"](this, model.publicMethods); // Register dispatcher

    this.dispatchToken = alt.dispatcher.register(function (payload) {
      _this.preventDefault = false;

      _this.lifecycle('beforeEach', {
        payload: payload,
        state: _this.state
      });

      var actionHandlers = model.actionListeners[payload.action];

      if (actionHandlers || model.otherwise) {
        var result;

        if (actionHandlers) {
          result = handleDispatch(function () {
            return actionHandlers.filter(Boolean).every(function (handler) {
              return handler.call(model, payload.data, payload.action) !== false;
            });
          }, payload);
        } else {
          result = handleDispatch(function () {
            return model.otherwise(payload.data, payload.action);
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

  _createClass(AltStore, [{
    key: "listen",
    value: function listen(cb) {
      var _this2 = this;

      if (!_functions__WEBPACK_IMPORTED_MODULE_0__["isFunction"](cb)) throw new TypeError('listen expects a function');

      var _this$transmitter$sub = this.transmitter.subscribe(cb),
          dispose = _this$transmitter$sub.dispose;

      this.subscriptions.push({
        cb: cb,
        dispose: dispose
      });
      return function () {
        _this2.lifecycle('unlisten');

        dispose();
      };
    }
  }, {
    key: "unlisten",
    value: function unlisten(cb) {
      this.lifecycle('unlisten');
      this.subscriptions.filter(function (subscription) {
        return subscription.cb === cb;
      }).forEach(function (subscription) {
        return subscription.dispose();
      });
    }
  }, {
    key: "getState",
    value: function getState() {
      return this.StoreModel.config.getState.call(this, this.state);
    }
  }]);

  return AltStore;
}();

/* harmony default export */ __webpack_exports__["default"] = (AltStore);

/***/ }),
/* 10 */
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
/* 11 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var transmitter__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(10);
/* harmony import */ var transmitter__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(transmitter__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _functions__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(6);


var StoreMixin = {
  waitFor: function waitFor() {
    for (var _len = arguments.length, sources = new Array(_len), _key = 0; _key < _len; _key++) {
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
    var asyncMethods = _functions__WEBPACK_IMPORTED_MODULE_1__["isFunction"](asyncDef) ? asyncDef(this.alt) : asyncDef;
    var toExport = Object.keys(asyncMethods).reduce(function (publicMethods, methodName) {
      var desc = asyncMethods[methodName];
      var spec = _functions__WEBPACK_IMPORTED_MODULE_1__["isFunction"](desc) ? desc(_this) : desc;
      var validHandlers = ['success', 'error', 'loading'];
      validHandlers.forEach(function (handler) {
        if (spec[handler] && !spec[handler].id) {
          throw new Error("".concat(handler, " handler must be an action function"));
        }
      });

      publicMethods[methodName] = function () {
        for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          args[_key2] = arguments[_key2];
        }

        var state = _this.getInstance().getState();

        var value = spec.local && spec.local.apply(spec, [state].concat(args));
        var shouldFetch = spec.shouldFetch ? spec.shouldFetch.apply(spec, [state].concat(args))
        /*eslint-disable*/
        : value == null;
        /*eslint-enable*/

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
        }; // if we don't have it in cache then fetch it


        if (shouldFetch) {
          loadCounter += 1;
          /* istanbul ignore else */

          if (spec.loading) spec.loading(intercept(null, spec.loading, args));
          return spec.remote.apply(spec, [state].concat(args)).then(makeActionHandler(spec.success), makeActionHandler(spec.error, 1));
        } // otherwise emit the change now


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

    _functions__WEBPACK_IMPORTED_MODULE_1__["eachObject"](function (methodName, value) {
      if (!_functions__WEBPACK_IMPORTED_MODULE_1__["isFunction"](value)) {
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
    var bus = this.lifecycleEvents[lifecycleEvent] || transmitter__WEBPACK_IMPORTED_MODULE_0___default()();
    this.lifecycleEvents[lifecycleEvent] = bus;
    return bus.subscribe(handler.bind(this));
  },
  bindAction: function bindAction(symbol, handler) {
    if (!symbol) {
      throw new ReferenceError('Invalid action reference passed in');
    }

    if (!_functions__WEBPACK_IMPORTED_MODULE_1__["isFunction"](handler)) {
      throw new TypeError('bindAction expects a function');
    } // You can pass in the constant or the function itself


    var key = symbol.id ? symbol.id : symbol;
    this.actionListeners[key] = this.actionListeners[key] || [];
    this.actionListeners[key].push(handler.bind(this));
    this.boundListeners.push(key);
  },
  bindActions: function bindActions(actions) {
    var _this3 = this;

    _functions__WEBPACK_IMPORTED_MODULE_1__["eachObject"](function (action, symbol) {
      var matchFirstCharacter = /./;
      var assumedEventHandler = action.replace(matchFirstCharacter, function (x) {
        return "on".concat(x[0].toUpperCase());
      });

      if (_this3[action] && _this3[assumedEventHandler]) {
        // If you have both action and onAction
        throw new ReferenceError("You have multiple action handlers bound to an action: " + "".concat(action, " and ").concat(assumedEventHandler));
      }

      var handler = _this3[action] || _this3[assumedEventHandler];

      if (handler) {
        _this3.bindAction(symbol, handler);
      }
    }, [actions]);
  },
  bindListeners: function bindListeners(obj) {
    var _this4 = this;

    _functions__WEBPACK_IMPORTED_MODULE_1__["eachObject"](function (methodName, symbol) {
      var listener = _this4[methodName];

      if (!listener) {
        throw new ReferenceError("".concat(methodName, " defined but does not exist in ").concat(_this4.displayName));
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
/* harmony default export */ __webpack_exports__["default"] = (StoreMixin);

/***/ }),
/* 12 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return makeAction; });
/* harmony import */ var _functions__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(6);
/* harmony import */ var _utils_AltUtils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(8);
/* harmony import */ var is_promise__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(13);
/* harmony import */ var is_promise__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(is_promise__WEBPACK_IMPORTED_MODULE_2__);



function makeAction(alt, namespace, name, implementation, obj) {
  var id = _utils_AltUtils__WEBPACK_IMPORTED_MODULE_1__["uid"](alt._actionsRegistry, "".concat(namespace, ".").concat(name));
  alt._actionsRegistry[id] = 1;
  var data = {
    id: id,
    namespace: namespace,
    name: name
  };

  var dispatch = function dispatch(payload) {
    return alt.dispatch(id, payload, data);
  }; // the action itself


  var action = function action() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var invocationResult = implementation.apply(obj, args);
    var actionResult = invocationResult; // async functions that return promises should not be dispatched

    if (invocationResult !== undefined && !is_promise__WEBPACK_IMPORTED_MODULE_2___default()(invocationResult)) {
      if (_functions__WEBPACK_IMPORTED_MODULE_0__["isFunction"](invocationResult)) {
        // inner function result should be returned as an action result
        actionResult = invocationResult(dispatch, alt);
      } else {
        dispatch(invocationResult);
      }
    }

    if (invocationResult === undefined) {
      _utils_AltUtils__WEBPACK_IMPORTED_MODULE_1__["warn"]('An action was called but nothing was dispatched');
    }

    return actionResult;
  };

  action.defer = function () {
    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    return setTimeout(function () {
      return action.apply(null, args);
    });
  };

  action.id = id;
  action.data = data; // ensure each reference is unique in the namespace

  var container = alt.actions[namespace];
  var namespaceId = _utils_AltUtils__WEBPACK_IMPORTED_MODULE_1__["uid"](container, name);
  container[namespaceId] = action; // generate a constant

  var constant = _utils_AltUtils__WEBPACK_IMPORTED_MODULE_1__["formatAsConstant"](namespaceId);
  container[constant] = id;
  return action;
}

/***/ }),
/* 13 */
/***/ (function(module, exports) {

module.exports = isPromise;

function isPromise(obj) {
  return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function';
}


/***/ })
/******/ ]);
});