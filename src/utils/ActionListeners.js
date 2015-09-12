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

function ActionListeners(alt) {
  this.dispatcher = alt.dispatcher
  this.listeners = {}
}

/*
 * addActionListener(symAction: symbol, handler: function): number
 * Adds a listener to a specified action and returns the dispatch token.
 */
ActionListeners.prototype.addActionListener = function addActionListener(symAction, handler) {
  const id = this.dispatcher.register((payload) => {
    /* istanbul ignore else */
    if (symAction === payload.action) {
      handler(payload.data, payload.details)
    }
  })
  this.listeners[id] = true
  return id
}

/*
 * removeActionListener(id: number): undefined
 * Removes the specified dispatch registration.
 */
ActionListeners.prototype.removeActionListener = function removeActionListener(id) {
  delete this.listeners[id]
  this.dispatcher.unregister(id)
}

/**
 * Remove all listeners.
 */
ActionListeners.prototype.removeAllActionListeners = function removeAllActionListeners() {
  Object.keys(this.listeners).forEach(
    this.removeActionListener.bind(this)
  )
  this.listeners = {}
}

export default ActionListeners
