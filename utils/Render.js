'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

exports.withData = withData;
exports.toDOM = toDOM;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function withData(fetch, MaybeComponent) {
  function bind(Component) {
    return _react2['default'].createClass({
      contextTypes: {
        buffer: _react2['default'].PropTypes.object.isRequired
      },

      childContextTypes: {
        buffer: _react2['default'].PropTypes.object.isRequired
      },

      getChildContext: function getChildContext() {
        return { buffer: this.context.buffer };
      },

      componentWillMount: function componentWillMount() {
        if (!this.context.buffer.locked) {
          this.context.buffer.push(fetch(this.props));
        }
      },

      render: function render() {
        return this.context.buffer.locked ? _react2['default'].createElement(Component, this.props) : null;
      }
    });
  }

  // works as a decorator or as a function
  return MaybeComponent ? bind(MaybeComponent) : function (Component) {
    return bind(Component);
  };
}

function usingDispatchBuffer(buffer, Component) {
  return _react2['default'].createClass({
    childContextTypes: {
      buffer: _react2['default'].PropTypes.object.isRequired
    },

    getChildContext: function getChildContext() {
      return { buffer: buffer };
    },

    render: function render() {
      return _react2['default'].createElement(Component, this.props);
    }
  });
}

var DispatchBuffer = (function () {
  function DispatchBuffer(renderStrategy) {
    _classCallCheck(this, DispatchBuffer);

    this.promisesBuffer = [];
    this.locked = false;
    this.renderStrategy = renderStrategy;
  }

  _createClass(DispatchBuffer, [{
    key: 'push',
    value: function push(v) {
      this.promisesBuffer.push(v);
    }
  }, {
    key: 'fill',
    value: function fill(Element) {
      return this.renderStrategy(Element);
    }
  }, {
    key: 'clear',
    value: function clear() {
      this.promisesBuffer = [];
    }
  }, {
    key: 'flush',
    value: function flush(alt, Element) {
      var _this = this;

      return Promise.all(this.promisesBuffer).then(function (data) {
        // fire off all the actions synchronously
        data.forEach(function (f) {
          if (Array.isArray(f)) {
            f.forEach(function (x) {
              return x();
            });
          } else {
            f();
          }
        });
        _this.locked = true;

        return {
          html: _this.renderStrategy(Element),
          state: alt.flush(),
          element: Element
        };
      })['catch'](function (err) {
        return Promise.reject({
          err: err,
          state: alt.flush(),
          element: Element
        });
      });
    }
  }]);

  return DispatchBuffer;
})();

function renderWithStrategy(strategy) {
  return function (alt, Component, props) {
    alt.trapAsync = true;

    // create a buffer and use context to pass it through to the components
    var buffer = new DispatchBuffer(function (Node) {
      return _react2['default'][strategy](Node);
    });
    var Container = usingDispatchBuffer(buffer, Component);

    // cache the element
    var Element = _react2['default'].createElement(Container, props);

    // render so we kick things off and get the props
    buffer.fill(Element);

    // flush out the results in the buffer synchronously setting the store
    // state and returning the markup
    return buffer.flush(alt, Element);
  };
}

function toDOM(Component, props, documentNode, shouldLock) {
  var buffer = new DispatchBuffer();
  buffer.locked = !!shouldLock;
  var Node = usingDispatchBuffer(buffer, Component);
  var Element = _react2['default'].createElement(Node, props);
  buffer.clear();
  return _react2['default'].render(Element, documentNode);
}

var toStaticMarkup = renderWithStrategy('renderToStaticMarkup');
exports.toStaticMarkup = toStaticMarkup;
var toString = renderWithStrategy('renderToString');
exports.toString = toString;