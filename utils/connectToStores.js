'use strict'
const React = require('react')

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
 *        getStores() {
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
 *      static getStores() {
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
function connectToStores (Component) {

  // Check for required static methods.
  if (typeof Component.getStores !== 'function') {
    throw new Error('connectToStores() expects the wrapped component to have a static getStores() method')
  }
  if (typeof Component.getPropsFromStores !== 'function') {
    throw new Error('connectToStores() expects the wrapped component to have a static getPropsFromStores() method')
  }

  // Cache stores.
  const stores = Component.getStores()

  // Wrapper Component.
  const StoreConnection = connectToStores.createClass({

    getInitialState () {
      return Component.getPropsFromStores(this.props)
    },

    componentDidMount () {
      stores.forEach(store => store.listen(this.onChange))
    },

    componentWillUnmount () {
      stores.forEach(store => store.unlisten(this.onChange))
    },

    onChange () {
      this.setState(Component.getPropsFromStores(this.props))
    },

    render () {
      return React.createElement(Component, Object.assign({}, this.props, this.state))
    }

  })

  return StoreConnection
}

/**
 * Expose createClass to facilitate testing.
 */
connectToStores.createClass = React.createClass

module.exports = connectToStores
