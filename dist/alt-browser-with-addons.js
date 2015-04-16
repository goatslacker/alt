(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Alt = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

module.exports = require("./components/AltContainer.js");

},{"./components/AltContainer.js":2}],2:[function(require,module,exports){
(function (global){
/**
 * AltContainer.
 *
 * There are many ways to use AltContainer.
 *
 * Using the `stores` prop.
 *
 * <AltContainer stores={{ FooStore: FooStore }}>
 *   children get this.props.FootStore.storeData
 * </AltContainer>
 *
 * You can also pass in functions.
 *
 * <AltContainer stores={{ FooStore: function () { return { storeData: true } } }}>
 *   children get this.props.FootStore.storeData
 * </AltContainer>
 *
 * Using the `store` prop.
 *
 * <AltContainer store={FooStore}>
 *   children get this.props.storeData
 * </AltContainer>
 *
 * Passing in `flux` because you're using alt instances
 *
 * <AltContainer flux={flux}>
 *   children get this.props.flux
 * </AltContainer>
 *
 * Using a custom render function.
 *
 * <AltContainer
 *   render={function (props) {
 *     return <div />;
 *   }}
 * />
 *
 * Full docs available at http://goatslacker.github.io/alt/
 */
"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);
var mixinContainer = require("./mixinContainer");
var assign = require("object-assign");

var cloneWithProps = React.addons.cloneWithProps;

var AltContainer = React.createClass(assign({
  displayName: "AltContainer",

  render: function render() {
    return this.altRender(cloneWithProps);
  }
}, mixinContainer(React)));

module.exports = AltContainer;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./mixinContainer":3,"object-assign":10}],3:[function(require,module,exports){
"use strict";

var Subscribe = require("../mixins/Subscribe");
var assign = require("object-assign");

function getStateFromStore(store, props) {
  return typeof store === "function" ? store(props).value : store.getState();
}

function getStateFromKey(actions, props) {
  return typeof actions === "function" ? actions(props) : actions;
}

function mixinContainer(React) {
  return {
    contextTypes: {
      flux: React.PropTypes.object
    },

    getInitialState: function getInitialState() {
      if (this.props.stores && this.props.store) {
        throw new ReferenceError("Cannot define both store and stores");
      }

      return this.reduceState(this.props);
    },

    componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
      this.destroySubscriptions();
      this.setState(this.reduceState(nextProps));
      this.registerStores(nextProps);
    },

    componentDidMount: function componentDidMount() {
      this.registerStores(this.props);
    },

    componentWillUnmount: function componentWillUnmount() {
      this.destroySubscriptions();
    },

    registerStores: function registerStores(props) {
      Subscribe.create(this);

      if (props.store) {
        this.addSubscription(props.store);
      } else if (props.stores) {
        var stores = props.stores;

        if (Array.isArray(stores)) {
          stores.forEach(function (store) {
            this.addSubscription(store);
          }, this);
        } else {
          Object.keys(stores).forEach(function (formatter) {
            this.addSubscription(stores[formatter]);
          }, this);
        }
      }
    },

    destroySubscriptions: function destroySubscriptions() {
      Subscribe.destroy(this);
    },

    getStateFromStores: function getStateFromStores(props) {
      if (props.store) {
        return getStateFromStore(props.store, props);
      } else if (props.stores) {
        var stores = props.stores;

        // If you pass in an array of stores then we are just listening to them
        // it should be an object then the state is added to the key specified
        if (!Array.isArray(stores)) {
          return Object.keys(stores).reduce((function (obj, key) {
            obj[key] = getStateFromStore(stores[key], props);
            return obj;
          }).bind(this), {});
        }
      } else {
        return {};
      }
    },

    getStateFromActions: function getStateFromActions(props) {
      if (props.actions) {
        return getStateFromKey(props.actions, props);
      } else {
        return {};
      }
    },

    getInjected: function getInjected(props) {
      if (props.inject) {
        return Object.keys(props.inject).reduce(function (obj, key) {
          obj[key] = getStateFromKey(props.inject[key], props);
          return obj;
        }, {});
      } else {
        return {};
      }
    },

    reduceState: function reduceState(props) {
      return assign({}, this.getStateFromStores(props), this.getStateFromActions(props), this.getInjected(props));
    },

    addSubscription: function addSubscription(store) {
      if (typeof store === "function") {
        Subscribe.add(this, store(this.props).store, this.altSetState);
      } else {
        Subscribe.add(this, store, this.altSetState);
      }
    },

    altSetState: function altSetState() {
      this.setState(this.reduceState(this.props));
    },

    getProps: function getProps() {
      var flux = this.props.flux || this.context.flux;
      return assign(flux ? { flux: flux } : {}, this.state);
    },

    shouldComponentUpdate: function shouldComponentUpdate() {
      return this.props.shouldComponentUpdate ? this.props.shouldComponentUpdate(this.getProps()) : true;
    },

    altRender: function altRender(cloneWithProps) {
      // Custom rendering function
      if (typeof this.props.render === "function") {
        return this.props.render(this.getProps());
      } else if (this.props.component) {
        return React.createElement(this.props.component, this.getProps());
      }

      var children = this.props.children;

      // Does not wrap child in a div if we don't have to.
      if (Array.isArray(children)) {
        return React.createElement("div", null, children.map(function (child, i) {
          return cloneWithProps(child, assign({ key: i }, this.getProps()));
        }, this));
      } else if (children) {
        return cloneWithProps(children, this.getProps());
      } else {
        return React.createElement("div", this.getProps());
      }
    }
  };
}

module.exports = mixinContainer;

},{"../mixins/Subscribe":4,"object-assign":10}],4:[function(require,module,exports){
"use strict";
var Symbol = require("es-symbol");
var MIXIN_REGISTRY = Symbol("alt store listeners");

var Subscribe = {
  create: function create(context) {
    context[MIXIN_REGISTRY] = context[MIXIN_REGISTRY] || [];
  },

  add: function add(context, store, handler) {
    context[MIXIN_REGISTRY].push({ store: store, handler: handler });
    store.listen(handler);
  },

  destroy: function destroy(context) {
    context[MIXIN_REGISTRY].forEach(function (x) {
      x.store.unlisten(x.handler);
    });
    context[MIXIN_REGISTRY] = [];
  },

  listeners: function listeners(context) {
    return context[MIXIN_REGISTRY];
  }
};

module.exports = Subscribe;

},{"es-symbol":5}],5:[function(require,module,exports){
"use strict";

var globalSymbolRegistryList = {};

// Aliases & Helpers
var make = Object.create;
var defProps = Object.defineProperties;
var defProp = Object.defineProperty;
var defValue = function (value) {
  var opts = arguments[1] === undefined ? {} : arguments[1];
  return {
    value: value,
    configurable: !!opts.c,
    writable: !!opts.w,
    enumerable: !!opts.e
  };
};
var isSymbol = function (symbol) {
  return symbol && symbol[xSymbol.toStringTag] === "Symbol";
};

var supportsAccessors = undefined;
try {
  var x = defProp({}, "y", { get: function () {
      return 1;
    } });
  supportsAccessors = x.y === 1;
} catch (e) {
  supportsAccessors = false;
}

var id = {};
var uid = function (desc) {
  desc = String(desc);
  var x = "";
  var i = 0;
  while (id[desc + x]) {
    x = i += 1;
  }
  id[desc + x] = 1;

  var tag = "Symbol(" + desc + "" + x + ")";

  /* istanbul ignore else */
  if (supportsAccessors) {
    // Make the symbols hidden to pre-es6 code
    defProp(Object.prototype, tag, {
      get: undefined,
      set: function (value) {
        defProp(this, tag, defValue(value, { c: true, w: true }));
      },
      configurable: true,
      enumerable: false
    });
  }

  return tag;
};

// The base symbol
var SymbolProto = make(null);

// 19.4.1.1
function xSymbol(descString) {
  if (this instanceof xSymbol) {
    throw new TypeError("Symbol is not a constructor");
  }

  descString = descString === undefined ? "" : String(descString);

  var tag = uid(descString);

  /* istanbul ignore next */
  if (!supportsAccessors) {
    return tag;
  }

  return make(SymbolProto, {
    __description__: defValue(descString),
    __tag__: defValue(tag)
  });
}

defProps(xSymbol, {
  // 19.4.2.1
  "for": defValue(function (key) {
    var stringKey = String(key);

    if (globalSymbolRegistryList[stringKey]) {
      return globalSymbolRegistryList[stringKey];
    }

    var symbol = xSymbol(stringKey);
    globalSymbolRegistryList[stringKey] = symbol;

    return symbol;
  }),

  // 19.4.2.5
  keyFor: defValue(function (sym) {
    if (!isSymbol(sym)) {
      throw new TypeError("" + sym + " is not a symbol");
    }

    for (var key in globalSymbolRegistryList) {
      if (globalSymbolRegistryList[key] === sym) {
        return globalSymbolRegistryList[key].__description__;
      }
    }
  })
});

// 6.1.5.1
defProps(xSymbol, {
  hasInstance: defValue(xSymbol("hasInstance")),
  isConcatSpreadable: defValue(xSymbol("isConcatSpreadable")),
  iterator: defValue(xSymbol("iterator")),
  match: defValue(xSymbol("match")),
  replace: defValue(xSymbol("replace")),
  search: defValue(xSymbol("search")),
  species: defValue(xSymbol("species")),
  split: defValue(xSymbol("split")),
  toPrimitive: defValue(xSymbol("toPrimitive")),
  toStringTag: defValue(xSymbol("toStringTag")),
  unscopables: defValue(xSymbol("unscopables"))
});

// 19.4.3
defProps(SymbolProto, {
  constructor: defValue(xSymbol),

  // 19.4.3.2
  toString: defValue(function () {
    return this.__tag__;
  }),

  // 19.4.3.3
  valueOf: defValue(function () {
    return "Symbol(" + this.__description__ + ")";
  })
});

// 19.4.3.5
/* istanbul ignore else */
if (supportsAccessors) {
  defProp(SymbolProto, xSymbol.toStringTag, defValue("Symbol", { c: true }));
}

module.exports = typeof Symbol === "function" ? Symbol : xSymbol;


},{}],6:[function(require,module,exports){
'use strict';

/**
 * Representation of a single EventEmitter function.
 *
 * @param {Function} fn Event handler to be called.
 * @param {Mixed} context Context for function execution.
 * @param {Boolean} once Only emit once
 * @api private
 */
function EE(fn, context, once) {
  this.fn = fn;
  this.context = context;
  this.once = once || false;
}

/**
 * Minimal EventEmitter interface that is molded against the Node.js
 * EventEmitter interface.
 *
 * @constructor
 * @api public
 */
function EventEmitter() { /* Nothing to set */ }

/**
 * Holds the assigned EventEmitters by name.
 *
 * @type {Object}
 * @private
 */
EventEmitter.prototype._events = undefined;

/**
 * Return a list of assigned event listeners.
 *
 * @param {String} event The events that should be listed.
 * @returns {Array}
 * @api public
 */
EventEmitter.prototype.listeners = function listeners(event) {
  if (!this._events || !this._events[event]) return [];
  if (this._events[event].fn) return [this._events[event].fn];

  for (var i = 0, l = this._events[event].length, ee = new Array(l); i < l; i++) {
    ee[i] = this._events[event][i].fn;
  }

  return ee;
};

/**
 * Emit an event to all registered event listeners.
 *
 * @param {String} event The name of the event.
 * @returns {Boolean} Indication if we've emitted an event.
 * @api public
 */
EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
  if (!this._events || !this._events[event]) return false;

  var listeners = this._events[event]
    , len = arguments.length
    , args
    , i;

  if ('function' === typeof listeners.fn) {
    if (listeners.once) this.removeListener(event, listeners.fn, true);

    switch (len) {
      case 1: return listeners.fn.call(listeners.context), true;
      case 2: return listeners.fn.call(listeners.context, a1), true;
      case 3: return listeners.fn.call(listeners.context, a1, a2), true;
      case 4: return listeners.fn.call(listeners.context, a1, a2, a3), true;
      case 5: return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
      case 6: return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
    }

    for (i = 1, args = new Array(len -1); i < len; i++) {
      args[i - 1] = arguments[i];
    }

    listeners.fn.apply(listeners.context, args);
  } else {
    var length = listeners.length
      , j;

    for (i = 0; i < length; i++) {
      if (listeners[i].once) this.removeListener(event, listeners[i].fn, true);

      switch (len) {
        case 1: listeners[i].fn.call(listeners[i].context); break;
        case 2: listeners[i].fn.call(listeners[i].context, a1); break;
        case 3: listeners[i].fn.call(listeners[i].context, a1, a2); break;
        default:
          if (!args) for (j = 1, args = new Array(len -1); j < len; j++) {
            args[j - 1] = arguments[j];
          }

          listeners[i].fn.apply(listeners[i].context, args);
      }
    }
  }

  return true;
};

/**
 * Register a new EventListener for the given event.
 *
 * @param {String} event Name of the event.
 * @param {Functon} fn Callback function.
 * @param {Mixed} context The context of the function.
 * @api public
 */
EventEmitter.prototype.on = function on(event, fn, context) {
  var listener = new EE(fn, context || this);

  if (!this._events) this._events = {};
  if (!this._events[event]) this._events[event] = listener;
  else {
    if (!this._events[event].fn) this._events[event].push(listener);
    else this._events[event] = [
      this._events[event], listener
    ];
  }

  return this;
};

/**
 * Add an EventListener that's only called once.
 *
 * @param {String} event Name of the event.
 * @param {Function} fn Callback function.
 * @param {Mixed} context The context of the function.
 * @api public
 */
EventEmitter.prototype.once = function once(event, fn, context) {
  var listener = new EE(fn, context || this, true);

  if (!this._events) this._events = {};
  if (!this._events[event]) this._events[event] = listener;
  else {
    if (!this._events[event].fn) this._events[event].push(listener);
    else this._events[event] = [
      this._events[event], listener
    ];
  }

  return this;
};

/**
 * Remove event listeners.
 *
 * @param {String} event The event we want to remove.
 * @param {Function} fn The listener that we need to find.
 * @param {Boolean} once Only remove once listeners.
 * @api public
 */
EventEmitter.prototype.removeListener = function removeListener(event, fn, once) {
  if (!this._events || !this._events[event]) return this;

  var listeners = this._events[event]
    , events = [];

  if (fn) {
    if (listeners.fn && (listeners.fn !== fn || (once && !listeners.once))) {
      events.push(listeners);
    }
    if (!listeners.fn) for (var i = 0, length = listeners.length; i < length; i++) {
      if (listeners[i].fn !== fn || (once && !listeners[i].once)) {
        events.push(listeners[i]);
      }
    }
  }

  //
  // Reset the array, or remove it completely if we have no more listeners.
  //
  if (events.length) {
    this._events[event] = events.length === 1 ? events[0] : events;
  } else {
    delete this._events[event];
  }

  return this;
};

/**
 * Remove all listeners or only the listeners for the specified event.
 *
 * @param {String} event The event want to remove all listeners for.
 * @api public
 */
EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
  if (!this._events) return this;

  if (event) delete this._events[event];
  else this._events = {};

  return this;
};

//
// Alias methods names because people roll like that.
//
EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
EventEmitter.prototype.addListener = EventEmitter.prototype.on;

//
// This function doesn't apply anymore.
//
EventEmitter.prototype.setMaxListeners = function setMaxListeners() {
  return this;
};

//
// Expose the module.
//
EventEmitter.EventEmitter = EventEmitter;
EventEmitter.EventEmitter2 = EventEmitter;
EventEmitter.EventEmitter3 = EventEmitter;

//
// Expose the module.
//
module.exports = EventEmitter;

},{}],7:[function(require,module,exports){
/**
 * Copyright (c) 2014, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

module.exports.Dispatcher = require('./lib/Dispatcher')

},{"./lib/Dispatcher":8}],8:[function(require,module,exports){
/*
 * Copyright (c) 2014, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule Dispatcher
 * @typechecks
 */

"use strict";

var invariant = require('./invariant');

var _lastID = 1;
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
 *    CountryStore.dispatchToken = flightDispatcher.register(function(payload) {
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
 *           flightDispatcher.waitFor([CityStore.dispatchToken]);
 *           FlightPriceStore.price =
 *             getFlightPriceStore(CountryStore.country, CityStore.city);
 *           break;
 *
 *         case 'city-update':
 *           FlightPriceStore.price =
 *             FlightPriceStore(CountryStore.country, CityStore.city);
 *           break;
 *     }
 *   });
 *
 * The `country-update` payload will be guaranteed to invoke the stores'
 * registered callbacks in order: `CountryStore`, `CityStore`, then
 * `FlightPriceStore`.
 */

  function Dispatcher() {
    this.$Dispatcher_callbacks = {};
    this.$Dispatcher_isPending = {};
    this.$Dispatcher_isHandled = {};
    this.$Dispatcher_isDispatching = false;
    this.$Dispatcher_pendingPayload = null;
  }

  /**
   * Registers a callback to be invoked with every dispatched payload. Returns
   * a token that can be used with `waitFor()`.
   *
   * @param {function} callback
   * @return {string}
   */
  Dispatcher.prototype.register=function(callback) {
    var id = _prefix + _lastID++;
    this.$Dispatcher_callbacks[id] = callback;
    return id;
  };

  /**
   * Removes a callback based on its token.
   *
   * @param {string} id
   */
  Dispatcher.prototype.unregister=function(id) {
    invariant(
      this.$Dispatcher_callbacks[id],
      'Dispatcher.unregister(...): `%s` does not map to a registered callback.',
      id
    );
    delete this.$Dispatcher_callbacks[id];
  };

  /**
   * Waits for the callbacks specified to be invoked before continuing execution
   * of the current callback. This method should only be used by a callback in
   * response to a dispatched payload.
   *
   * @param {array<string>} ids
   */
  Dispatcher.prototype.waitFor=function(ids) {
    invariant(
      this.$Dispatcher_isDispatching,
      'Dispatcher.waitFor(...): Must be invoked while dispatching.'
    );
    for (var ii = 0; ii < ids.length; ii++) {
      var id = ids[ii];
      if (this.$Dispatcher_isPending[id]) {
        invariant(
          this.$Dispatcher_isHandled[id],
          'Dispatcher.waitFor(...): Circular dependency detected while ' +
          'waiting for `%s`.',
          id
        );
        continue;
      }
      invariant(
        this.$Dispatcher_callbacks[id],
        'Dispatcher.waitFor(...): `%s` does not map to a registered callback.',
        id
      );
      this.$Dispatcher_invokeCallback(id);
    }
  };

  /**
   * Dispatches a payload to all registered callbacks.
   *
   * @param {object} payload
   */
  Dispatcher.prototype.dispatch=function(payload) {
    invariant(
      !this.$Dispatcher_isDispatching,
      'Dispatch.dispatch(...): Cannot dispatch in the middle of a dispatch.'
    );
    this.$Dispatcher_startDispatching(payload);
    try {
      for (var id in this.$Dispatcher_callbacks) {
        if (this.$Dispatcher_isPending[id]) {
          continue;
        }
        this.$Dispatcher_invokeCallback(id);
      }
    } finally {
      this.$Dispatcher_stopDispatching();
    }
  };

  /**
   * Is this Dispatcher currently dispatching.
   *
   * @return {boolean}
   */
  Dispatcher.prototype.isDispatching=function() {
    return this.$Dispatcher_isDispatching;
  };

  /**
   * Call the callback stored with the given id. Also do some internal
   * bookkeeping.
   *
   * @param {string} id
   * @internal
   */
  Dispatcher.prototype.$Dispatcher_invokeCallback=function(id) {
    this.$Dispatcher_isPending[id] = true;
    this.$Dispatcher_callbacks[id](this.$Dispatcher_pendingPayload);
    this.$Dispatcher_isHandled[id] = true;
  };

  /**
   * Set up bookkeeping needed when dispatching.
   *
   * @param {object} payload
   * @internal
   */
  Dispatcher.prototype.$Dispatcher_startDispatching=function(payload) {
    for (var id in this.$Dispatcher_callbacks) {
      this.$Dispatcher_isPending[id] = false;
      this.$Dispatcher_isHandled[id] = false;
    }
    this.$Dispatcher_pendingPayload = payload;
    this.$Dispatcher_isDispatching = true;
  };

  /**
   * Clear bookkeeping used for dispatching.
   *
   * @internal
   */
  Dispatcher.prototype.$Dispatcher_stopDispatching=function() {
    this.$Dispatcher_pendingPayload = null;
    this.$Dispatcher_isDispatching = false;
  };


module.exports = Dispatcher;

},{"./invariant":9}],9:[function(require,module,exports){
/**
 * Copyright (c) 2014, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule invariant
 */

"use strict";

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

var invariant = function(condition, format, a, b, c, d, e, f) {
  if (false) {
    if (format === undefined) {
      throw new Error('invariant requires an error message argument');
    }
  }

  if (!condition) {
    var error;
    if (format === undefined) {
      error = new Error(
        'Minified exception occurred; use the non-minified dev environment ' +
        'for the full error message and additional helpful warnings.'
      );
    } else {
      var args = [a, b, c, d, e, f];
      var argIndex = 0;
      error = new Error(
        'Invariant Violation: ' +
        format.replace(/%s/g, function() { return args[argIndex++]; })
      );
    }

    error.framesToPop = 1; // we don't care about invariant's own frame
    throw error;
  }
};

module.exports = invariant;

},{}],10:[function(require,module,exports){
'use strict';

function ToObject(val) {
	if (val == null) {
		throw new TypeError('Object.assign cannot be called with null or undefined');
	}

	return Object(val);
}

module.exports = Object.assign || function (target, source) {
	var from;
	var keys;
	var to = ToObject(target);

	for (var s = 1; s < arguments.length; s++) {
		from = arguments[s];
		keys = Object.keys(Object(from));

		for (var i = 0; i < keys.length; i++) {
			to[keys[i]] = from[keys[i]];
		}
	}

	return to;
};

},{}],11:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var Alt = _interopRequire(require("./alt"));

var ActionListeners = _interopRequire(require("../utils/ActionListeners"));

var AltManager = _interopRequire(require("../utils/AltManager"));

var DispatcherRecorder = _interopRequire(require("../utils/DispatcherRecorder"));

var atomicTransactions = _interopRequire(require("../utils/atomicTransactions"));

var chromeDebug = _interopRequire(require("../utils/chromeDebug"));

var makeFinalStore = _interopRequire(require("../utils/makeFinalStore"));

var withAltContext = _interopRequire(require("../utils/withAltContext"));

var AltContainer = _interopRequire(require("../AltContainer"));

Alt.addons = {
  ActionListeners: ActionListeners,
  AltContainer: AltContainer,
  AltManager: AltManager,
  DispatcherRecorder: DispatcherRecorder,
  atomicTransactions: atomicTransactions,
  chromeDebug: chromeDebug,
  makeFinalStore: makeFinalStore,
  withAltContext: withAltContext
};

module.exports = Alt;

},{"../AltContainer":1,"../utils/ActionListeners":13,"../utils/AltManager":14,"../utils/DispatcherRecorder":15,"../utils/atomicTransactions":16,"../utils/chromeDebug":17,"../utils/makeFinalStore":18,"../utils/withAltContext":19,"./alt":12}],12:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _applyConstructor = function (Constructor, args) { var instance = Object.create(Constructor.prototype); var result = Constructor.apply(instance, args); return result != null && (typeof result == "object" || typeof result == "function") ? result : instance; };

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Dispatcher = require("flux").Dispatcher;

var EventEmitter = _interopRequire(require("eventemitter3"));

var Symbol = _interopRequire(require("es-symbol"));

var assign = _interopRequire(require("object-assign"));

var ACTION_HANDLER = Symbol("action creator handler");
var ACTION_KEY = Symbol("holds the actions uid symbol for listening");
var ACTION_UID = Symbol("the actions uid name");
var ALL_LISTENERS = Symbol("name of listeners");
var EE = Symbol("event emitter instance");
var INIT_SNAPSHOT = Symbol("init snapshot storage");
var LAST_SNAPSHOT = Symbol("last snapshot storage");
var LIFECYCLE = Symbol("store lifecycle listeners");
var LISTENERS = Symbol("stores action listeners storage");
var PUBLIC_METHODS = Symbol("store public method storage");
var STATE_CHANGED = Symbol();
var STATE_CONTAINER = Symbol("the state container");

var GlobalActionsNameRegistry = {};

function warn(msg) {
  /* istanbul ignore else */
  if (typeof console !== "undefined") {
    console.warn(new ReferenceError(msg));
  }
}

function deprecatedBeforeAfterEachWarning() {
  warn("beforeEach/afterEach functions on the store are deprecated " + "use beforeEach/afterEach as a lifecycle method instead");
}

function formatAsConstant(name) {
  return name.replace(/[a-z]([A-Z])/g, function (i) {
    return "" + i[0] + "_" + i[1].toLowerCase();
  }).toUpperCase();
}

function uid(container, name) {
  var count = 0;
  var key = name;
  while (Object.hasOwnProperty.call(container, key)) {
    key = name + String(++count);
  }
  return key;
}

function doSetState(store, storeInstance, nextState) {
  if (!nextState) {
    return;
  }

  if (!store.alt.dispatcher.isDispatching()) {
    throw new Error("You can only use setState while dispatching");
  }

  if (typeof nextState === "function") {
    assign(storeInstance[STATE_CONTAINER], nextState(storeInstance[STATE_CONTAINER]));
  } else {
    assign(storeInstance[STATE_CONTAINER], nextState);
  }

  storeInstance[STATE_CHANGED] = true;
}

/* istanbul ignore next */
function NoopClass() {}

var builtIns = Object.getOwnPropertyNames(NoopClass);
var builtInProto = Object.getOwnPropertyNames(NoopClass.prototype);

function getInternalMethods(obj, excluded) {
  return Object.getOwnPropertyNames(obj).reduce(function (value, m) {
    if (excluded.indexOf(m) !== -1) {
      return value;
    }

    value[m] = obj[m];
    return value;
  }, {});
}

var AltStore = (function () {
  function AltStore(dispatcher, model, state, StoreModel) {
    var _this8 = this;

    _classCallCheck(this, AltStore);

    this[EE] = new EventEmitter();
    this[LIFECYCLE] = {};
    this[STATE_CHANGED] = false;
    this[STATE_CONTAINER] = state || model;

    this.boundListeners = model[ALL_LISTENERS];
    this.StoreModel = StoreModel;
    if (typeof this.StoreModel === "object") {
      this.StoreModel.state = assign({}, StoreModel.state);
    }

    assign(this[LIFECYCLE], model[LIFECYCLE]);
    assign(this, model[PUBLIC_METHODS]);

    // Register dispatcher
    this.dispatchToken = dispatcher.register(function (payload) {
      if (model[LIFECYCLE].beforeEach) {
        model[LIFECYCLE].beforeEach(payload.action.toString(), payload.data, _this8[STATE_CONTAINER]);
      } else if (typeof model.beforeEach === "function") {
        deprecatedBeforeAfterEachWarning();
        model.beforeEach(payload.action.toString(), payload.data, _this8[STATE_CONTAINER]);
      }

      if (model[LISTENERS][payload.action]) {
        var result = false;

        try {
          result = model[LISTENERS][payload.action](payload.data);
        } catch (e) {
          if (_this8[LIFECYCLE].error) {
            _this8[LIFECYCLE].error(e, payload.action.toString(), payload.data, _this8[STATE_CONTAINER]);
          } else {
            throw e;
          }
        }

        if (result !== false || _this8[STATE_CHANGED]) {
          _this8.emitChange();
        }

        _this8[STATE_CHANGED] = false;
      }

      if (model[LIFECYCLE].afterEach) {
        model[LIFECYCLE].afterEach(payload.action.toString(), payload.data, _this8[STATE_CONTAINER]);
      } else if (typeof model.afterEach === "function") {
        deprecatedBeforeAfterEachWarning();
        model.afterEach(payload.action.toString(), payload.data, _this8[STATE_CONTAINER]);
      }
    });

    if (this[LIFECYCLE].init) {
      this[LIFECYCLE].init();
    }
  }

  _createClass(AltStore, {
    getEventEmitter: {
      value: function getEventEmitter() {
        return this[EE];
      }
    },
    emitChange: {
      value: function emitChange() {
        this[EE].emit("change", this[STATE_CONTAINER]);
      }
    },
    listen: {
      value: function listen(cb) {
        var _this8 = this;

        this[EE].on("change", cb);
        return function () {
          return _this8.unlisten(cb);
        };
      }
    },
    unlisten: {
      value: function unlisten(cb) {
        if (this[LIFECYCLE].unlisten) {
          this[LIFECYCLE].unlisten();
        }
        this[EE].removeListener("change", cb);
      }
    },
    getState: {
      value: function getState() {
        // Copy over state so it's RO.
        var state = this[STATE_CONTAINER];
        return Object.keys(state).reduce(function (obj, key) {
          obj[key] = state[key];
          return obj;
        }, {});
      }
    }
  });

  return AltStore;
})();

var ActionCreator = (function () {
  function ActionCreator(alt, name, action, actions) {
    _classCallCheck(this, ActionCreator);

    this[ACTION_UID] = name;
    this[ACTION_HANDLER] = action.bind(this);
    this.actions = actions;
    this.alt = alt;
  }

  _createClass(ActionCreator, {
    dispatch: {
      value: function dispatch(data) {
        this.alt.dispatch(this[ACTION_UID], data);
      }
    }
  });

  return ActionCreator;
})();

var StoreMixinListeners = {
  on: function on(lifecycleEvent, handler) {
    this[LIFECYCLE][lifecycleEvent] = handler.bind(this);
  },

  bindAction: function bindAction(symbol, handler) {
    if (!symbol) {
      throw new ReferenceError("Invalid action reference passed in");
    }
    if (typeof handler !== "function") {
      throw new TypeError("bindAction expects a function");
    }

    if (handler.length > 1) {
      throw new TypeError("Action handler in store " + this._storeName + " for " + ("" + (symbol[ACTION_KEY] || symbol).toString() + " was defined with 2 ") + "parameters. Only a single parameter is passed through the " + "dispatcher, did you mean to pass in an Object instead?");
    }

    // You can pass in the constant or the function itself
    var key = symbol[ACTION_KEY] ? symbol[ACTION_KEY] : symbol;
    this[LISTENERS][key] = handler.bind(this);
    this[ALL_LISTENERS].push(Symbol.keyFor(key));
  },

  bindActions: function bindActions(actions) {
    var _this8 = this;

    Object.keys(actions).forEach(function (action) {
      var symbol = actions[action];
      var matchFirstCharacter = /./;
      var assumedEventHandler = action.replace(matchFirstCharacter, function (x) {
        return "on" + x[0].toUpperCase();
      });
      var handler = null;

      if (_this8[action] && _this8[assumedEventHandler]) {
        // If you have both action and onAction
        throw new ReferenceError("You have multiple action handlers bound to an action: " + ("" + action + " and " + assumedEventHandler));
      } else if (_this8[action]) {
        // action
        handler = _this8[action];
      } else if (_this8[assumedEventHandler]) {
        // onAction
        handler = _this8[assumedEventHandler];
      }

      if (handler) {
        _this8.bindAction(symbol, handler);
      }
    });
  },

  bindListeners: function bindListeners(obj) {
    var _this8 = this;

    Object.keys(obj).forEach(function (methodName) {
      var symbol = obj[methodName];
      var listener = _this8[methodName];

      if (!listener) {
        throw new ReferenceError("" + methodName + " defined but does not exist in " + _this8._storeName);
      }

      if (Array.isArray(symbol)) {
        symbol.forEach(function (action) {
          _this8.bindAction(action, listener);
        });
      } else {
        _this8.bindAction(symbol, listener);
      }
    });
  }

};

var StoreMixinEssentials = {
  waitFor: function waitFor(sources) {
    if (!sources) {
      throw new ReferenceError("Dispatch tokens not provided");
    }

    if (arguments.length === 1) {
      sources = Array.isArray(sources) ? sources : [sources];
    } else {
      sources = Array.prototype.slice.call(arguments);
    }

    var tokens = sources.map(function (source) {
      return source.dispatchToken || source;
    });

    this.dispatcher.waitFor(tokens);
  },

  exportPublicMethods: function exportPublicMethods(methods) {
    var _this8 = this;

    Object.keys(methods).forEach(function (methodName) {
      if (typeof methods[methodName] !== "function") {
        throw new TypeError("exportPublicMethods expects a function");
      }

      _this8[PUBLIC_METHODS][methodName] = methods[methodName];
    });
  },

  emitChange: function emitChange() {
    this.getInstance().emitChange();
  }
};

function setAppState(instance, data, onStore) {
  var obj = instance.deserialize(data);
  Object.keys(obj).forEach(function (key) {
    var store = instance.stores[key];
    if (store) {
      if (store[LIFECYCLE].deserialize) {
        obj[key] = store[LIFECYCLE].deserialize(obj[key]) || obj[key];
      }
      assign(store[STATE_CONTAINER], obj[key]);
      onStore(store);
    }
  });
}

function snapshot(instance) {
  for (var _len = arguments.length, storeNames = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    storeNames[_key - 1] = arguments[_key];
  }

  var stores = storeNames.length ? storeNames : Object.keys(instance.stores);
  return stores.reduce(function (obj, key) {
    var store = instance.stores[key];
    if (store[LIFECYCLE].snapshot) {
      store[LIFECYCLE].snapshot();
    }
    var customSnapshot = store[LIFECYCLE].serialize && store[LIFECYCLE].serialize();
    obj[key] = customSnapshot ? customSnapshot : store.getState();
    return obj;
  }, {});
}

function saveInitialSnapshot(instance, key) {
  var state = instance.stores[key][STATE_CONTAINER];
  var initial = instance.deserialize(instance[INIT_SNAPSHOT]);
  initial[key] = state;
  instance[INIT_SNAPSHOT] = instance.serialize(initial);
  instance[LAST_SNAPSHOT] = instance[INIT_SNAPSHOT];
}

function filterSnapshotOfStores(instance, serializedSnapshot, storeNames) {
  var stores = instance.deserialize(serializedSnapshot);
  var storesToReset = storeNames.reduce(function (obj, name) {
    if (!stores[name]) {
      throw new ReferenceError("" + name + " is not a valid store");
    }
    obj[name] = stores[name];
    return obj;
  }, {});
  return instance.serialize(storesToReset);
}

function createStoreFromObject(alt, StoreModel, key) {
  var storeInstance = undefined;

  var StoreProto = {};
  StoreProto[ALL_LISTENERS] = [];
  StoreProto[LIFECYCLE] = {};
  StoreProto[LISTENERS] = {};

  assign(StoreProto, {
    _storeName: key,
    alt: alt,
    dispatcher: alt.dispatcher,
    getInstance: function getInstance() {
      return storeInstance;
    },
    setState: function setState(nextState) {
      doSetState(this, storeInstance, nextState);
    }
  }, StoreMixinListeners, StoreMixinEssentials, StoreModel);

  // bind the store listeners
  /* istanbul ignore else */
  if (StoreProto.bindListeners) {
    StoreMixinListeners.bindListeners.call(StoreProto, StoreProto.bindListeners);
  }

  // bind the lifecycle events
  /* istanbul ignore else */
  if (StoreProto.lifecycle) {
    Object.keys(StoreProto.lifecycle).forEach(function (event) {
      StoreMixinListeners.on.call(StoreProto, event, StoreProto.lifecycle[event]);
    });
  }

  // create the instance and assign the public methods to the instance
  storeInstance = assign(new AltStore(alt.dispatcher, StoreProto, StoreProto.state, StoreModel), StoreProto.publicMethods);

  return storeInstance;
}

function createStoreFromClass(alt, StoreModel, key) {
  for (var _len = arguments.length, argsForConstructor = Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
    argsForConstructor[_key - 3] = arguments[_key];
  }

  var storeInstance = undefined;

  // Creating a class here so we don't overload the provided store's
  // prototype with the mixin behaviour and I'm extending from StoreModel
  // so we can inherit any extensions from the provided store.

  var Store = (function (_StoreModel) {
    function Store() {
      for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      _classCallCheck(this, Store);

      _get(Object.getPrototypeOf(Store.prototype), "constructor", this).apply(this, args);
    }

    _inherits(Store, _StoreModel);

    return Store;
  })(StoreModel);

  assign(Store.prototype, StoreMixinListeners, StoreMixinEssentials, {
    _storeName: key,
    alt: alt,
    dispatcher: alt.dispatcher,
    getInstance: function getInstance() {
      return storeInstance;
    },
    setState: function setState(nextState) {
      doSetState(this, storeInstance, nextState);
    }
  });

  Store.prototype[ALL_LISTENERS] = [];
  Store.prototype[LIFECYCLE] = {};
  Store.prototype[LISTENERS] = {};
  Store.prototype[PUBLIC_METHODS] = {};

  var store = _applyConstructor(Store, argsForConstructor);

  storeInstance = assign(new AltStore(alt.dispatcher, store, null, StoreModel), getInternalMethods(StoreModel, builtIns));

  return storeInstance;
}

var Alt = (function () {
  function Alt() {
    var config = arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, Alt);

    this.serialize = config.serialize || JSON.stringify;
    this.deserialize = config.deserialize || JSON.parse;
    this.dispatcher = config.dispatcher || new Dispatcher();
    this.actions = {};
    this.stores = {};
    this[LAST_SNAPSHOT] = this[INIT_SNAPSHOT] = "{}";
  }

  _createClass(Alt, {
    dispatch: {
      value: function dispatch(action, data) {
        this.dispatcher.dispatch({ action: action, data: data });
      }
    },
    createUnsavedStore: {
      value: function createUnsavedStore(StoreModel) {
        for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          args[_key - 1] = arguments[_key];
        }

        var key = StoreModel.displayName || "";
        return typeof StoreModel === "object" ? createStoreFromObject(this, StoreModel, key) : createStoreFromClass.apply(undefined, [this, StoreModel, key].concat(args));
      }
    },
    createStore: {
      value: function createStore(StoreModel, iden) {
        for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
          args[_key - 2] = arguments[_key];
        }

        var key = iden || StoreModel.name || StoreModel.displayName || "";

        if (this.stores[key] || !key) {
          if (this.stores[key]) {
            warn("A store named " + key + " already exists, double check your store " + "names or pass in your own custom identifier for each store");
          } else {
            warn("Store name was not specified");
          }

          key = uid(this.stores, key);
        }

        var storeInstance = typeof StoreModel === "object" ? createStoreFromObject(this, StoreModel, key) : createStoreFromClass.apply(undefined, [this, StoreModel, key].concat(args));

        this.stores[key] = storeInstance;
        saveInitialSnapshot(this, key);

        return storeInstance;
      }
    },
    generateActions: {
      value: function generateActions() {
        for (var _len = arguments.length, actionNames = Array(_len), _key = 0; _key < _len; _key++) {
          actionNames[_key] = arguments[_key];
        }

        return this.createActions(function () {
          this.generateActions.apply(this, actionNames);
        });
      }
    },
    createAction: {
      value: function createAction(name, implementation, obj) {
        var actionId = uid(GlobalActionsNameRegistry, name);
        GlobalActionsNameRegistry[actionId] = 1;
        var actionName = Symbol["for"](actionId);

        // Wrap the action so we can provide a dispatch method
        var newAction = new ActionCreator(this, actionName, implementation, obj);

        var action = newAction[ACTION_HANDLER];
        action.defer = function () {
          for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }

          setTimeout(function () {
            newAction[ACTION_HANDLER].apply(null, args);
          });
        };
        action[ACTION_KEY] = actionName;
        return action;
      }
    },
    createActions: {
      value: function createActions(ActionsClass) {
        var _this8 = this;

        for (var _len = arguments.length, argsForConstructor = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
          argsForConstructor[_key - 2] = arguments[_key];
        }

        var exportObj = arguments[1] === undefined ? {} : arguments[1];

        var actions = {};
        var key = ActionsClass.name || ActionsClass.displayName || "";

        if (typeof ActionsClass === "function") {
          (function () {
            assign(actions, getInternalMethods(ActionsClass.prototype, builtInProto));

            var ActionsGenerator = (function (_ActionsClass) {
              function ActionsGenerator() {
                for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                  args[_key2] = arguments[_key2];
                }

                _classCallCheck(this, ActionsGenerator);

                _get(Object.getPrototypeOf(ActionsGenerator.prototype), "constructor", this).apply(this, args);
              }

              _inherits(ActionsGenerator, _ActionsClass);

              _createClass(ActionsGenerator, {
                generateActions: {
                  value: function generateActions() {
                    for (var _len2 = arguments.length, actionNames = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                      actionNames[_key2] = arguments[_key2];
                    }

                    actionNames.forEach(function (actionName) {
                      // This is a function so we can later bind this to ActionCreator
                      actions[actionName] = function (x) {
                        for (var _len3 = arguments.length, a = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
                          a[_key3 - 1] = arguments[_key3];
                        }

                        this.dispatch(a.length ? [x].concat(a) : x);
                      };
                    });
                  }
                }
              });

              return ActionsGenerator;
            })(ActionsClass);

            assign(actions, _applyConstructor(ActionsGenerator, argsForConstructor));
          })();
        } else {
          assign(actions, ActionsClass);
        }

        return Object.keys(actions).reduce(function (obj, action) {
          obj[action] = _this8.createAction("" + key + "#" + action, actions[action], obj);
          var constant = formatAsConstant(action);
          obj[constant] = obj[action][ACTION_KEY];
          return obj;
        }, exportObj);
      }
    },
    takeSnapshot: {
      value: function takeSnapshot() {
        for (var _len = arguments.length, storeNames = Array(_len), _key = 0; _key < _len; _key++) {
          storeNames[_key] = arguments[_key];
        }

        var state = snapshot.apply(undefined, [this].concat(storeNames));
        this[LAST_SNAPSHOT] = this.serialize(assign(this.deserialize(this[LAST_SNAPSHOT]), state));
        return this.serialize(state);
      }
    },
    rollback: {
      value: function rollback() {
        setAppState(this, this[LAST_SNAPSHOT], function (store) {
          if (store[LIFECYCLE].rollback) {
            store[LIFECYCLE].rollback();
          }
          store.emitChange();
        });
      }
    },
    recycle: {
      value: function recycle() {
        for (var _len = arguments.length, storeNames = Array(_len), _key = 0; _key < _len; _key++) {
          storeNames[_key] = arguments[_key];
        }

        var initialSnapshot = storeNames.length ? filterSnapshotOfStores(this, this[INIT_SNAPSHOT], storeNames) : this[INIT_SNAPSHOT];

        setAppState(this, initialSnapshot, function (store) {
          if (store[LIFECYCLE].init) {
            store[LIFECYCLE].init();
          }
          store.emitChange();
        });
      }
    },
    flush: {
      value: function flush() {
        var state = this.serialize(snapshot(this));
        this.recycle();
        return state;
      }
    },
    bootstrap: {
      value: function bootstrap(data) {
        setAppState(this, data, function (store) {
          if (store[LIFECYCLE].bootstrap) {
            store[LIFECYCLE].bootstrap();
          }
          store.emitChange();
        });
      }
    },
    addActions: {

      // Instance type methods for injecting alt into your application as context

      value: function addActions(name, ActionsClass) {
        for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
          args[_key - 2] = arguments[_key];
        }

        this.actions[name] = Array.isArray(ActionsClass) ? this.generateActions.apply(this, ActionsClass) : this.createActions.apply(this, [ActionsClass].concat(args));
      }
    },
    addStore: {
      value: function addStore(name, StoreModel) {
        for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
          args[_key - 2] = arguments[_key];
        }

        this.createStore.apply(this, [StoreModel, name].concat(args));
      }
    },
    getActions: {
      value: function getActions(name) {
        return this.actions[name];
      }
    },
    getStore: {
      value: function getStore(name) {
        return this.stores[name];
      }
    }
  });

  return Alt;
})();

module.exports = Alt;

},{"es-symbol":5,"eventemitter3":6,"flux":7,"object-assign":10}],13:[function(require,module,exports){
"use strict";
/**
 * ActionListeners(alt: AltInstance): ActionListenersInstance
 *
 * > Globally listen to individual actions
 *
 * If you need to listen to an action but don't want the weight of a store
 * then this util is what you can use.
 *
 * Usage:
 *
 * ```js
 * var actionListener = new ActionListeners(alt);
 *
 * actionListener.addActionListener(Action.ACTION_NAME, function (data) {
 *   // do something with data
 * })
 * ```
 */
module.exports = ActionListeners;

var Symbol = require("es-symbol");
var ALT_LISTENERS = Symbol("global dispatcher listeners");

function ActionListeners(alt) {
  this.dispatcher = alt.dispatcher;
  this[ALT_LISTENERS] = {};
}

/*
 * addActionListener(symAction: symbol, handler: function): number
 * Adds a listener to a specified action and returns the dispatch token.
 */
ActionListeners.prototype.addActionListener = function (symAction, handler) {
  var id = this.dispatcher.register(function (payload) {
    /* istanbul ignore else */
    if (symAction === payload.action) {
      handler(payload.data);
    }
  });
  this[ALT_LISTENERS][id] = true;
  return id;
};

/*
 * removeActionListener(id: number): undefined
 * Removes the specified dispatch registration.
 */
ActionListeners.prototype.removeActionListener = function (id) {
  delete this[ALT_LISTENERS][id];
  this.dispatcher.unregister(id);
};

/**
 * Remove all listeners.
 */
ActionListeners.prototype.removeAllActionListeners = function () {
  Object.keys(this[ALT_LISTENERS]).forEach(this.removeActionListener.bind(this));
  this[ALT_LISTENERS] = {};
};

},{"es-symbol":5}],14:[function(require,module,exports){
/**
 * AltManager(Alt: AltClass): undefined
 *
 * > AltManager Util
 *
 * AltManager util allows for a developer to create multiple alt instances in
 * their app. This is useful for building apps that encapsulates an alt instance
 * inside of a outer parent. Popular examples include HipMunk flight search or
 * Google Spreadsheets's multiple sheet tabs. This also allows for caching of
 * client side instance if you need to store a new copy of an alt for each
 * action.
 *
 * Usage:
 *
 * ```js
 * var Alt = require('alt'); // Alt class, not alt instance
 * var altManager = new AltManager(Alt);
 *
 * var altInstance = altManager.create('uniqueKeyName');
 * altInstance.createAction(SomeAction);
 * var someOtherOtherAlt = altManager.create('anotherKeyName');
 * altManager.delete('uniqueKeyName');
 *
 * ```
 */

"use strict";

function AltManager(Alt) {
  this.Alt = Alt;
  this.alts = {};
}

AltManager.prototype.create = function (altKey) {
  if (this.get(altKey)) {
    throw new ReferenceError("Alt key " + altKey + " already exists");
  }

  if (typeof altKey !== "string") {
    throw new TypeError("altKey must be a string");
  }

  this.alts[altKey] = new this.Alt();
  return this.alts[altKey];
};

AltManager.prototype.get = function (altKey) {
  return this.alts[altKey];
};

// returns all alt instances
AltManager.prototype.all = function () {
  return this.alts;
};

AltManager.prototype.findWhere = function (regex) {
  var results = {};
  for (var i in this.alts) {
    if (regex.exec(i) === null) {
      continue;
    }

    results[i] = this.alts[i];
  }

  return results;
};

AltManager.prototype["delete"] = function (altKey) {
  if (!this.get(altKey)) {
    return false;
  }

  delete this.alts[altKey];
  return true;
};

AltManager.prototype.getOrCreate = function (altKey) {
  var alt = this.get(altKey);
  if (alt) {
    return alt;
  }

  return this.create(altKey);
};

module.exports = AltManager;

},{}],15:[function(require,module,exports){
"use strict";
/**
 * DispatcherRecorder(alt: AltInstance): DispatcherInstance
 *
 * > Record and replay your actions at any point in time.
 *
 * This util allows you to record a set of dispatches which you can later
 * replay at your convenience.
 *
 * Good for: Debugging, repeating, logging.
 *
 * Usage:
 *
 * ```js
 * var recorder = new DispatcherRecorder(alt);
 *
 * // start recording
 * recorder.record();
 *
 * // call a series of actions
 *
 * // stop recording
 * recorder.stop();
 *
 * // replay the events that took place
 * recorder.replay();
 * ```
 */
module.exports = DispatcherRecorder;

var Symbol = require("es-symbol");

function DispatcherRecorder(alt) {
  this.alt = alt;
  this.events = [];
  this.dispatchToken = null;
}

/**
 * If recording started you get true, otherwise false since there's a recording
 * in progress.
 * record(): boolean
 */
DispatcherRecorder.prototype.record = function () {
  if (this.dispatchToken) {
    return false;
  }

  this.dispatchToken = this.alt.dispatcher.register((function (payload) {
    this.events.push(payload);
  }).bind(this));

  return true;
};

/**
 * Stops the recording in progress.
 * stop(): undefined
 */
DispatcherRecorder.prototype.stop = function () {
  this.alt.dispatcher.unregister(this.dispatchToken);
  this.dispatchToken = null;
};

/**
 * Clear all events from memory.
 * clear(): undefined
 */
DispatcherRecorder.prototype.clear = function () {
  this.events = [];
};

/**
 * (As|S)ynchronously replay all events that were recorded.
 * replay(replayTime: ?number, done: ?function): undefined
 */
DispatcherRecorder.prototype.replay = function (replayTime, done) {
  var alt = this.alt;

  if (replayTime === void 0) {
    this.events.forEach(function (payload) {
      alt.dispatch(payload.action, payload.data);
    });
  }

  var onNext = function onNext(payload, nextAction) {
    return function () {
      setTimeout(function () {
        alt.dispatch(payload.action, payload.data);
        nextAction();
      }, replayTime);
    };
  };

  var next = done || function () {};
  var i = this.events.length - 1;
  while (i >= 0) {
    var event = this.events[i];
    next = onNext(event, next);
    i -= 1;
  }

  next();
};

/**
 * Serialize all the events so you can pass them around or load them into
 * a separate recorder.
 * serializeEvents(): string
 */
DispatcherRecorder.prototype.serializeEvents = function () {
  var events = this.events.map(function (event) {
    return {
      action: Symbol.keyFor(event.action),
      data: event.data
    };
  });
  return JSON.stringify(events);
};

/**
 * Load serialized events into the recorder and overwrite the current events
 * loadEvents(events: string): undefined
 */
DispatcherRecorder.prototype.loadEvents = function (events) {
  var parsedEvents = JSON.parse(events);
  this.events = parsedEvents.map(function (event) {
    return {
      action: Symbol["for"](event.action),
      data: event.data
    };
  });
};

},{"es-symbol":5}],16:[function(require,module,exports){
"use strict";

var makeFinalStore = require("./makeFinalStore");

// babelHelpers
/*eslint-disable */
/* istanbul ignore next */
var _inherits = function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) subClass.__proto__ = superClass;
};
/*eslint-enable */

function makeAtomicClass(alt, StoreModel) {
  function AtomicClass() {
    StoreModel.call(this);

    this.on("error", function () {
      alt.rollback();
    });
  }
  _inherits(AtomicClass, StoreModel);
  AtomicClass.displayName = StoreModel.displayName || StoreModel.name || "AtomicClass";
  return AtomicClass;
}

function makeAtomicObject(alt, StoreModel) {
  StoreModel.lifecycle = StoreModel.lifecycle || {};
  StoreModel.lifecycle.error = function () {
    alt.rollback();
  };
  return StoreModel;
}

function atomicTransactions(alt) {
  var finalStore = makeFinalStore(alt);

  finalStore.listen(function () {
    alt.takeSnapshot();
  });

  return function (StoreModel) {
    return typeof StoreModel === "function" ? makeAtomicClass(alt, StoreModel) : makeAtomicObject(alt, StoreModel);
  };
}

module.exports = atomicTransactions;

},{"./makeFinalStore":18}],17:[function(require,module,exports){
/*global window*/
"use strict";

function chromeDebug(alt) {
  window["goatslacker.github.io/alt/"] = alt;
}

module.exports = chromeDebug;

},{}],18:[function(require,module,exports){
"use strict";
/**
 * makeFinalStore(alt: AltInstance): AltStore
 *
 * > Creates a `FinalStore` which is a store like any other except that it
 * waits for all other stores in your alt instance to emit a change before it
 * emits a change itself.
 *
 * Want to know when a particular dispatch has completed? This is the util
 * you want.
 *
 * Good for: taking a snapshot and persisting it somewhere, saving data from
 * a set of stores, syncing data, etc.
 *
 * Usage:
 *
 * ```js
 * var FinalStore = makeFinalStore(alt);
 *
 * FinalStore.listen(function () {
 *   // all stores have now changed
 * });
 * ```
 */
module.exports = makeFinalStore;

function FinalStore() {
  this.dispatcher.register((function (payload) {
    var stores = Object.keys(this.alt.stores).reduce((function (arr, store) {
      return (arr.push(this.alt.stores[store].dispatchToken), arr);
    }).bind(this), []);

    this.waitFor(stores);
    this.setState({ payload: payload });
    this.emitChange();
  }).bind(this));
}

function makeFinalStore(alt) {
  return alt.createUnsavedStore(FinalStore);
}

},{}],19:[function(require,module,exports){
(function (global){
"use strict";

var React = (typeof window !== "undefined" ? window.React : typeof global !== "undefined" ? global.React : null);

function withAltContext(flux, Component) {
  return React.createClass({
    childContextTypes: {
      flux: React.PropTypes.object
    },

    getChildContext: function getChildContext() {
      return { flux: flux };
    },

    render: function render() {
      return React.createElement(Component, this.props);
    }
  });
}

module.exports = withAltContext;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},[11])(11)
});