/**
 * 'Higher Order Component' that controls the props of a wrapped
 * component via stores.
 *
 * Expects the Component to have two static methods:
 *   - getStores(): Should return an array of stores.
 *   - getPropsFromStores(props): Should return the props from the stores.
 *
 * Example using old React.createClass() style:
 *
 *    const MyComponent = React.createClass({
 *      statics: {
 *        getStores(props) {
 *          return [myStore]
 *        },
 *        getPropsFromStores(props) {
 *          return myStore.getState()
 *        }
 *      },
 *      render() {
 *        // Use this.props like normal ...
 *      }
 *    })
 *    MyComponent = connectToStores(MyComponent)
 *
 *
 * Example using ES6 Class:
 *
 *    class MyComponent extends React.Component {
 *      static getStores(props) {
 *        return [myStore]
 *      }
 *      static getPropsFromStores(props) {
 *        return myStore.getState()
 *      }
 *      render() {
 *        // Use this.props like normal ...
 *      }
 *    }
 *    MyComponent = connectToStores(MyComponent)
 *
 * A great explanation of the merits of higher order components can be found at
 * http://bit.ly/1abPkrP
 */

import React from 'react'
import { assign, isFunction } from './functions'

function connectToStores(Spec, Component = Spec) {
  // Check for required static methods.
  if (!isFunction(Spec.getStores)) {
    throw new Error('connectToStores() expects the wrapped component to have a static getStores() method')
  }
  if (!isFunction(Spec.getPropsFromStores)) {
    throw new Error('connectToStores() expects the wrapped component to have a static getPropsFromStores() method')
  }

  const StoreConnection = React.createClass({
    displayName: `Stateful${Component.displayName || Component.name || 'Container'}`,

    getInitialState() {
      return Spec.getPropsFromStores(this.props, this.context)
    },

    componentWillReceiveProps(nextProps) {
      this.setState(Spec.getPropsFromStores(nextProps, this.context))
    },

    componentDidMount() {
      const stores = Spec.getStores(this.props, this.context)
      this.storeListeners = stores.map((store) => {
        return store.listen(this.onChange)
      })
      if (Spec.componentDidConnect) {
        Spec.componentDidConnect(this.props, this.context)
      }
    },

    componentWillUnmount() {
      this.storeListeners.forEach(unlisten => unlisten())
    },

    onChange() {
      this.setState(Spec.getPropsFromStores(this.props, this.context))
    },

    render() {
      return React.createElement(
        Component,
        assign({}, this.props, this.state)
      )
    },
  })
  if (Component.contextTypes) {
    StoreConnection.contextTypes = Component.contextTypes
  }

  return StoreConnection
}

export default connectToStores
