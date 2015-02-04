"use strict";

var _slice = Array.prototype.slice;
"use strict";

var Dispatcher = require("flux").Dispatcher;
var EventEmitter = require("eventemitter3");
var Symbol = require("es-symbol");
var assign = require("object-assign");

var now = Date.now();
var VariableSymbol = function (desc) {
  return Symbol("" + now + "" + desc);
};

var ACTION_DISPATCHER = Symbol("action dispatcher storage");
var ACTION_HANDLER = Symbol("action creator handler");
var ACTION_KEY = Symbol("holds the actions uid symbol for listening");
var ACTION_UID = Symbol("the actions uid name");
var EE = Symbol("event emitter instance");
var INIT_SNAPSHOT = Symbol("init snapshot storage");
var LAST_SNAPSHOT = Symbol("last snapshot storage");
var LISTENERS = Symbol("stores action listeners storage");
var STATE_CONTAINER = VariableSymbol("the state container");
var STORE_BOOTSTRAP = Symbol("event handler onBootstrap");
var STORE_SNAPSHOT = Symbol("event handler onTakeSnapshot");

var formatAsConstant = function (name) {
  return name.replace(/[a-z]([A-Z])/g, function (i) {
    return "" + i[0] + "_" + i[1].toLowerCase();
  }).toUpperCase();
};

/* istanbul ignore next */
function NoopClass() {}

var builtIns = Object.getOwnPropertyNames(NoopClass);
var builtInProto = Object.getOwnPropertyNames(NoopClass.prototype);

var getInternalMethods = function (obj, excluded) {
  return Object.getOwnPropertyNames(obj).reduce(function (value, m) {
    if (excluded.indexOf(m) !== -1) {
      return value;
    }

    value[m] = obj[m];
    return value;
  }, {});
};

var AltStore = (function () {
  var AltStore = function AltStore(dispatcher, state) {
    var _this = this;
    this[STATE_CONTAINER] = state;
    this[EE] = new EventEmitter();
    if (state.onBootstrap) {
      this[STORE_BOOTSTRAP] = state.onBootstrap.bind(state);
    }
    if (state.onTakeSnapshot) {
      this[STORE_SNAPSHOT] = state.onTakeSnapshot.bind(state);
    }

    // Register dispatcher
    this.dispatchToken = dispatcher.register(function (payload) {
      if (state[LISTENERS][payload.action]) {
        var result = state[LISTENERS][payload.action](payload.data);
        result !== false && _this.emitChange();
      }
    });
  };

  AltStore.prototype.emitChange = function () {
    this[EE].emit("change", this[STATE_CONTAINER]);
  };

  AltStore.prototype.listen = function (cb) {
    this[EE].on("change", cb);
  };

  AltStore.prototype.unlisten = function (cb) {
    this[EE].removeListener("change", cb);
  };

  AltStore.prototype.getState = function () {
    // Copy over state so it's RO.
    return assign({}, this[STATE_CONTAINER]);
  };

  return AltStore;
})();

var ActionCreator = (function () {
  var ActionCreator = function ActionCreator(dispatcher, name, action, actions) {
    this[ACTION_DISPATCHER] = dispatcher;
    this[ACTION_UID] = name;
    this[ACTION_HANDLER] = action.bind(this);
    this.actions = actions;
  };

  ActionCreator.prototype.dispatch = function (data) {
    this[ACTION_DISPATCHER].dispatch({
      action: this[ACTION_UID],
      data: data
    });
  };

  return ActionCreator;
})();

var StoreMixin = {
  bindAction: function (symbol, handler) {
    if (!symbol) {
      throw new ReferenceError("Invalid action reference passed in");
    }
    if (typeof handler !== "function") {
      throw new TypeError("bindAction expects a function");
    }

    if (handler.length > 1) {
      throw new TypeError("Action handler in store " + this._storeName + " for " + ("" + (symbol[ACTION_KEY] || symbol) + " was defined with 2 parameters. ") + "Only a single parameter is passed through the dispatcher, did you " + "mean to pass in an Object instead?");
    }

    // You can pass in the constant or the function itself
    if (symbol[ACTION_KEY]) {
      this[LISTENERS][symbol[ACTION_KEY]] = handler.bind(this);
    } else {
      this[LISTENERS][symbol] = handler.bind(this);
    }
  },

  bindActions: function (actions) {
    var _this2 = this;
    Object.keys(actions).forEach(function (action) {
      var symbol = actions[action];
      var matchFirstCharacter = /./;
      var assumedEventHandler = action.replace(matchFirstCharacter, function (x) {
        return "on" + x[0].toUpperCase();
      });
      var handler = null;

      if (_this2[action] && _this2[assumedEventHandler]) {
        // If you have both action and onAction
        throw new ReferenceError("You have multiple action handlers bound to an action: " + ("" + action + " and " + assumedEventHandler));
      } else if (_this2[action]) {
        // action
        handler = _this2[action];
      } else if (_this2[assumedEventHandler]) {
        // onAction
        handler = _this2[assumedEventHandler];
      }

      if (handler) {
        _this2.bindAction(symbol, handler);
      }
    });
  },

  waitFor: function (tokens) {
    if (!tokens) {
      throw new ReferenceError("Dispatch tokens not provided");
    }
    tokens = Array.isArray(tokens) ? tokens : [tokens];
    this.dispatcher.waitFor(tokens);
  }
};

var bootstrap = function (instance, data) {
  var obj = JSON.parse(data);
  Object.keys(obj).forEach(function (key) {
    assign(instance.stores[key][STATE_CONTAINER], obj[key]);
    if (instance.stores[key][STORE_BOOTSTRAP]) {
      instance.stores[key][STORE_BOOTSTRAP]();
    }
  });
};

var snapshot = function (instance) {
  return JSON.stringify(Object.keys(instance.stores).reduce(function (obj, key) {
    if (instance.stores[key][STORE_SNAPSHOT]) {
      instance.stores[key][STORE_SNAPSHOT]();
    }
    obj[key] = instance.stores[key].getState();
    return obj;
  }, {}));
};

var saveInitialSnapshot = function (instance, key) {
  var state = instance.stores[key][STATE_CONTAINER];
  var initial = JSON.parse(instance[INIT_SNAPSHOT]);
  initial[key] = state;
  instance[INIT_SNAPSHOT] = JSON.stringify(initial);
};

var filterSnapshotOfStores = function (snapshot, storeNames) {
  var stores = JSON.parse(snapshot);
  var storesToReset = storeNames.reduce(function (obj, name) {
    if (!stores[name]) {
      throw new ReferenceError("" + name + " is not a valid store");
    }
    obj[name] = stores[name];
    return obj;
  }, {});
  return JSON.stringify(storesToReset);
};

var Alt = (function () {
  var Alt = function Alt() {
    this.dispatcher = new Dispatcher();
    this.stores = {};
    this[LAST_SNAPSHOT] = null;
    this[INIT_SNAPSHOT] = "{}";
  };

  Alt.prototype.createStore = function (StoreModel, iden) {
    var _this3 = this;
    var key = iden || StoreModel.displayName || StoreModel.name;
    // Creating a class here so we don't overload the provided store's
    // prototype with the mixin behaviour and I'm extending from StoreModel
    // so we can inherit any extensions from the provided store.
    function Store() {
      StoreModel.call(this);
    }
    Store.prototype = StoreModel.prototype;
    Store.prototype[LISTENERS] = {};
    assign(Store.prototype, StoreMixin, {
      _storeName: key,
      dispatcher: this.dispatcher,
      getInstance: function () {
        return _this3.stores[key];
      }
    });

    var store = new Store();

    if (this.stores[key]) {
      throw new ReferenceError("A store named " + key + " already exists, double check your store names or pass in\nyour own custom identifier for each store");
    }

    this.stores[key] = assign(new AltStore(this.dispatcher, store), getInternalMethods(StoreModel, builtIns));

    saveInitialSnapshot(this, key);

    return this.stores[key];
  };

  Alt.prototype.createActions = function (ActionsClass, exportObj) {
    var _this4 = this;
    if (exportObj === undefined) exportObj = {};
    var key = ActionsClass.displayName || ActionsClass.name;
    var actions = assign({}, getInternalMethods(ActionsClass.prototype, builtInProto));

    function ActionsGenerator() {
      ActionsClass.call(this);
    }
    ActionsGenerator.prototype = ActionsClass.prototype;
    ActionsGenerator.prototype.generateActions = function () {
      var actionNames = _slice.call(arguments);

      actionNames.forEach(function (actionName) {
        // This is a function so we can later bind this to ActionCreator
        actions[actionName] = function (x) {
          var a = _slice.call(arguments, 1);

          this.dispatch(a.length ? [x].concat(a) : x);
        };
      });
    };

    new ActionsGenerator();

    return Object.keys(actions).reduce(function (obj, action) {
      var constant = formatAsConstant(action);
      var actionName = Symbol("action " + key + ".prototype." + action);

      // Wrap the action so we can provide a dispatch method
      var newAction = new ActionCreator(_this4.dispatcher, actionName, actions[action], obj);

      // Set all the properties on action
      obj[action] = newAction[ACTION_HANDLER];
      obj[action].defer = function (x) {
        return setTimeout(function () {
          return newAction[ACTION_HANDLER](x);
        });
      };
      obj[action][ACTION_KEY] = actionName;
      obj[constant] = actionName;

      return obj;
    }, exportObj);
  };

  Alt.prototype.takeSnapshot = function () {
    var state = snapshot(this);
    this[LAST_SNAPSHOT] = state;
    return state;
  };

  Alt.prototype.rollback = function () {
    bootstrap(this, this[LAST_SNAPSHOT]);
  };

  Alt.prototype.recycle = function () {
    var storeNames = _slice.call(arguments);

    var _snapshot = storeNames.length ? filterSnapshotOfStores(this[INIT_SNAPSHOT], storeNames) : this[INIT_SNAPSHOT];

    bootstrap(this, _snapshot);
  };

  Alt.prototype.flush = function () {
    var state = snapshot(this);
    this.recycle();
    return state;
  };

  Alt.prototype.bootstrap = function (data) {
    bootstrap(this, data);
    if (typeof window !== "undefined") {
      this.bootstrap = function () {
        throw new ReferenceError("Stores have already been bootstrapped");
      };
    }
  };

  return Alt;
})();

module.exports = Alt;

