'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

exports['default'] = makeAction;

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _utilsFunctions = require('../../utils/functions');

var fn = _interopRequireWildcard(_utilsFunctions);

var _utilsAltUtils = require('../utils/AltUtils');

var utils = _interopRequireWildcard(_utilsAltUtils);

var AltAction = (function () {
  function AltAction(alt, id, action, actions, actionDetails) {
    _classCallCheck(this, AltAction);

    this.id = id;
    this._dispatch = action.bind(this);
    this.actions = actions;
    this.actionDetails = actionDetails;
    this.alt = alt;
  }

  _createClass(AltAction, [{
    key: 'dispatch',
    value: function dispatch(data) {
      this.dispatched = true;
      this.alt.dispatch(this.id, data, this.actionDetails);
    }
  }]);

  return AltAction;
})();

function makeAction(alt, namespace, name, implementation, obj) {
  var id = utils.uid(alt._actionsRegistry, namespace + '.' + name);
  alt._actionsRegistry[id] = 1;

  var data = { id: id, namespace: namespace, name: name };

  // Wrap the action so we can provide a dispatch method
  var newAction = new AltAction(alt, id, implementation, obj, data);

  var dispatch = function dispatch(payload) {
    return alt.dispatch(id, payload, data);
  };

  // the action itself
  var action = function action() {
    newAction.dispatched = false;
    var result = newAction._dispatch.apply(newAction, arguments);
    // async functions that return promises should not be dispatched
    if (!newAction.dispatched && result !== undefined && !fn.isPromise(result)) {
      if (fn.isFunction(result)) {
        result(dispatch);
      } else {
        dispatch(result);
      }
    }
    return result;
  };
  action.defer = function () {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    setTimeout(function () {
      newAction._dispatch.apply(null, args);
    });
  };
  action.id = id;
  action.data = data;

  // ensure each reference is unique in the namespace
  var container = alt.actions[namespace];
  var namespaceId = utils.uid(container, name);
  container[namespaceId] = action;

  return action;
}

module.exports = exports['default'];