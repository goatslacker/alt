"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var EventEmitter = _interopRequire(require("eventemitter3"));

var assign = _interopRequire(require("object-assign"));

var _utilsWarnings = require("./utils/warnings");

var warn = _utilsWarnings.warn;
var deprecatedBeforeAfterEachWarning = _utilsWarnings.deprecatedBeforeAfterEachWarning;

var _symbolsSymbols = require("./symbols/symbols");

var ALL_LISTENERS = _symbolsSymbols.ALL_LISTENERS;
var EE = _symbolsSymbols.EE;
var LIFECYCLE = _symbolsSymbols.LIFECYCLE;
var LISTENERS = _symbolsSymbols.LISTENERS;
var PUBLIC_METHODS = _symbolsSymbols.PUBLIC_METHODS;
var STATE_CHANGED = _symbolsSymbols.STATE_CHANGED;
var STATE_CONTAINER = _symbolsSymbols.STATE_CONTAINER;

var AltStore = (function () {
  function AltStore(dispatcher, model, state, StoreModel) {
    var _this = this;

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
        model[LIFECYCLE].beforeEach(payload.action.toString(), payload.data, _this[STATE_CONTAINER]);
      } else if (typeof model.beforeEach === "function") {
        deprecatedBeforeAfterEachWarning();
        model.beforeEach(payload.action.toString(), payload.data, _this[STATE_CONTAINER]);
      }

      if (model[LISTENERS][payload.action]) {
        var result = false;

        try {
          result = model[LISTENERS][payload.action](payload.data);
        } catch (e) {
          if (_this[LIFECYCLE].error) {
            _this[LIFECYCLE].error(e, payload.action.toString(), payload.data, _this[STATE_CONTAINER]);
          } else {
            throw e;
          }
        }

        if (result !== false || _this[STATE_CHANGED]) {
          _this.emitChange();
        }

        _this[STATE_CHANGED] = false;
      }

      if (model[LIFECYCLE].afterEach) {
        model[LIFECYCLE].afterEach(payload.action.toString(), payload.data, _this[STATE_CONTAINER]);
      } else if (typeof model.afterEach === "function") {
        deprecatedBeforeAfterEachWarning();
        model.afterEach(payload.action.toString(), payload.data, _this[STATE_CONTAINER]);
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
        var _this = this;

        this[EE].on("change", cb);
        return function () {
          return _this.unlisten(cb);
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

module.exports = AltStore;