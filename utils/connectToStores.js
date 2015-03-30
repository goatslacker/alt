"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

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

var React = _interopRequire(require("react"));

var assign = _interopRequire(require("object-assign"));

function connectToStores(Component) {

  // Check for required static methods.
  if (typeof Component.getStores !== "function") {
    throw new Error("connectToStores() expects the wrapped component to have a static getStores() method");
  }
  if (typeof Component.getPropsFromStores !== "function") {
    throw new Error("connectToStores() expects the wrapped component to have a static getPropsFromStores() method");
  }

  // Cache stores.
  var stores = Component.getStores();

  // Wrapper Component.
  var StoreConnection = React.createClass({
    displayName: "StoreConnection",

    getInitialState: function getInitialState() {
      return Component.getPropsFromStores(this.props);
    },

    componentDidMount: function componentDidMount() {
      var _this = this;

      stores.forEach(function (store) {
        store.listen(_this.onChange);
      });
    },

    componentWillUnmount: function componentWillUnmount() {
      var _this = this;

      stores.forEach(function (store) {
        store.unlisten(_this.onChange);
      });
    },

    onChange: function onChange() {
      this.setState(Component.getPropsFromStores(this.props));
    },

    render: function render() {
      return React.createElement(Component, assign({}, this.props, this.state));
    }
  });

  return StoreConnection;
}

module.exports = connectToStores;