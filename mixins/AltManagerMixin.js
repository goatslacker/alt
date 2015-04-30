'use strict'
/**
 * This mixin lets you setup your listeners for a single store/action for
 * that uses AltManager.js, it will re-attach listeners when the props.alt
 * changes. It requires an alt instance as props.alt to be passed. For exmaple:
 *
 * <FooComponent alt={manager.get('MyAltInstName')} />
 *
 * Your component will have access to this.action and this.store which contains
 * the dyanmically available Alt action instance and Alt store instance.
 *
 * Usage:
 *
 * mixins: [AltManagerMixin],
 *
 * statics: {
 *   registerStore: FooStore,
 *   registerAction: FooAction,
 * },
 *
 *
 * onNewAlt(newState, newProps) {
 *   // Do whatever you want here. This is an optional callback you can have
 *   // inside your component if it needs to handle certain actions if a new
 *   // Alt instance was created.
 * }
 *
 */
var AltManagerMixin = {

  action: null,
  store: null,

  componentWillMount: function() {
    // we need to init the store and actions during creation
    this.initProps(this.props)
  },

  componentWillReceiveProps: function(newProps) {
    // unlisten from old alt store if change of alt
    if (this.props.alt !== newProps.alt) {
      this.store.unlisten(this.listenState)
      // init the new props
      this.initProps(newProps)
    } else {
      // we always need to set the new state if the props changed
      this.setState(this.store.getState())
    }
  },

  listenState: function(data) {
    // we make this a method here so we can pass it to unlisten
    this.setState(data)
  },

  initProps: function(props) {
    var Store = this.constructor.registerStore
    var Action = this.constructor.registerAction
    if (!Store) {
      throw new ReferenceError('registerStore has not been defined')
    }

    if (!Action) {
      throw new ReferenceError('registerAction has not been is defined')
    }

    var storeName = Store.name
    var actionName = Action.name

    this.action = props.alt.getActions(actionName)
    this.store = props.alt.getStore(storeName)

    if (!this.action) {
      props.alt.addActions(actionName, Action)
      this.action = props.alt.getActions(actionName)
      this.store = props.alt.createStore(Store, null, props.alt)
      if (this.onNewAlt) {
        this.onNewAlt(this.store.getState(), props)
      }
    }

    this.setState(this.store.getState())
    this.store.listen(this.listenState)
  },

  componentWillUnmount: function() {
    this.store.unlisten(this.listenState)
  }
}

module.exports = AltManagerMixin
