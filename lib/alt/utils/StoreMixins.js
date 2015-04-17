"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _symbolsSymbols = require("../symbols/symbols");

var ACTION_KEY = _symbolsSymbols.ACTION_KEY;
var ALL_LISTENERS = _symbolsSymbols.ALL_LISTENERS;
var LIFECYCLE = _symbolsSymbols.LIFECYCLE;
var LISTENERS = _symbolsSymbols.LISTENERS;
var PUBLIC_METHODS = _symbolsSymbols.PUBLIC_METHODS;
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
    var _this = this;

    Object.keys(methods).forEach(function (methodName) {
      if (typeof methods[methodName] !== "function") {
        throw new TypeError("exportPublicMethods expects a function");
      }

      _this[PUBLIC_METHODS][methodName] = methods[methodName];
    });
  },

  emitChange: function emitChange() {
    this.getInstance().emitChange();
  }
};

exports.StoreMixinEssentials = StoreMixinEssentials;
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
    var _this = this;

    Object.keys(actions).forEach(function (action) {
      var symbol = actions[action];
      var matchFirstCharacter = /./;
      var assumedEventHandler = action.replace(matchFirstCharacter, function (x) {
        return "on" + x[0].toUpperCase();
      });
      var handler = null;

      if (_this[action] && _this[assumedEventHandler]) {
        // If you have both action and onAction
        throw new ReferenceError("You have multiple action handlers bound to an action: " + ("" + action + " and " + assumedEventHandler));
      } else if (_this[action]) {
        // action
        handler = _this[action];
      } else if (_this[assumedEventHandler]) {
        // onAction
        handler = _this[assumedEventHandler];
      }

      if (handler) {
        _this.bindAction(symbol, handler);
      }
    });
  },

  bindListeners: function bindListeners(obj) {
    var _this = this;

    Object.keys(obj).forEach(function (methodName) {
      var symbol = obj[methodName];
      var listener = _this[methodName];

      if (!listener) {
        throw new ReferenceError("" + methodName + " defined but does not exist in " + _this._storeName);
      }

      if (Array.isArray(symbol)) {
        symbol.forEach(function (action) {
          _this.bindAction(action, listener);
        });
      } else {
        _this.bindAction(symbol, listener);
      }
    });
  }

};
exports.StoreMixinListeners = StoreMixinListeners;