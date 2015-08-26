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

"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
function ActionListeners(alt) {
  this.dispatcher = alt.dispatcher;
  this.listeners = {};
}

/*
 * addActionListener(symAction: symbol, handler: function): number
 * Adds a listener to a specified action and returns the dispatch token.
 */
ActionListeners.prototype.addActionListener = function (symAction, handler) {
  var id = this.dispatcher.register(function (payload) {
    /* istanbul ignore else */
    if (symAction === payload.action) {
      handler(payload.data, payload.details);
    }
  });
  this.listeners[id] = true;
  return id;
};

/*
 * removeActionListener(id: number): undefined
 * Removes the specified dispatch registration.
 */
ActionListeners.prototype.removeActionListener = function (id) {
  delete this.listeners[id];
  this.dispatcher.unregister(id);
};

/**
 * Remove all listeners.
 */
ActionListeners.prototype.removeAllActionListeners = function () {
  Object.keys(this.listeners).forEach(this.removeActionListener.bind(this));
  this.listeners = {};
};

exports["default"] = ActionListeners;
module.exports = exports["default"];