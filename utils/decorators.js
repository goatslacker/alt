'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.decorate = decorate;
exports.createActions = createActions;
exports.createStore = createStore;
exports.bind = bind;
exports.bindWithContext = bindWithContext;
exports.expose = expose;
exports.datasource = datasource;

var _functions = require('./functions');

/* istanbul ignore next */
function NoopClass() {}
var builtInProto = Object.getOwnPropertyNames(NoopClass.prototype);

function addMeta(description, decoration) {
  description.value.alt = description.value.alt || {};
  (0, _functions.assign)(description.value.alt, decoration);
  return description;
}

function decorate(context) {
  return function (Store) {
    var proto = Store.prototype;
    var publicMethods = {};
    var bindListeners = {};

    Object.getOwnPropertyNames(proto).forEach(function (name) {
      if (builtInProto.indexOf(name) !== -1) return;

      var meta = proto[name].alt;
      if (!meta) {
        return;
      }

      /* istanbul ignore else */
      if (meta.actions) {
        bindListeners[name] = meta.actions;
      } else if (meta.actionsWithContext) {
        bindListeners[name] = meta.actionsWithContext(context);
      } else if (meta.publicMethod) {
        publicMethods[name] = proto[name];
      }
    });

    Store.config = (0, _functions.assign)({
      bindListeners: bindListeners,
      publicMethods: publicMethods
    }, Store.config);

    return Store;
  };
}

function createActions(alt) {
  for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }

  return function (Actions) {
    return alt.createActions.apply(alt, [Actions, {}].concat(args));
  };
}

function createStore(alt) {
  for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
    args[_key2 - 1] = arguments[_key2];
  }

  return function (Store) {
    return alt.createStore.apply(alt, [decorate(alt)(Store), undefined].concat(args));
  };
}

function bind() {
  for (var _len3 = arguments.length, actionIds = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
    actionIds[_key3] = arguments[_key3];
  }

  return function (obj, name, description) {
    return addMeta(description, { actions: actionIds });
  };
}

function bindWithContext(fn) {
  return function (obj, name, description) {
    return addMeta(description, { actionsWithContext: fn });
  };
}

function expose(obj, name, description) {
  return addMeta(description, { publicMethod: true });
}

function datasource() {
  var source = _functions.assign.apply(undefined, arguments);
  return function (Store) {
    Store.config = (0, _functions.assign)({ datasource: source }, Store.config);
    return Store;
  };
}