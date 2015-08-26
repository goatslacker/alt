/*eslint-disable */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _fixedDataTable = require('fixed-data-table');

var _makeFinalStore = require('./makeFinalStore');

var _makeFinalStore2 = _interopRequireDefault(_makeFinalStore);

var _connectToStores = require('./connectToStores');

var _connectToStores2 = _interopRequireDefault(_connectToStores);

var _debugFixedDataTableCss = require('./debug/FixedDataTableCss');

var _debugFixedDataTableCss2 = _interopRequireDefault(_debugFixedDataTableCss);

var _debugDebugActions = require('./debug/DebugActions');

var _debugDebugActions2 = _interopRequireDefault(_debugDebugActions);

var _debugDispatcherStore = require('./debug/DispatcherStore');

var _debugDispatcherStore2 = _interopRequireDefault(_debugDispatcherStore);

var DispatcherDebugger = (function (_React$Component) {
  function DispatcherDebugger() {
    _classCallCheck(this, DispatcherDebugger);

    _get(Object.getPrototypeOf(DispatcherDebugger.prototype), 'constructor', this).call(this);

    this.getDispatch = this.getDispatch.bind(this);
    this.renderName = this.renderName.bind(this);
    this.renderReplay = this.renderReplay.bind(this);
    this.renderRevert = this.renderRevert.bind(this);
    this.view = this.view.bind(this);
  }

  _inherits(DispatcherDebugger, _React$Component);

  _createClass(DispatcherDebugger, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var finalStore = (0, _makeFinalStore2['default'])(this.props.alt);
      finalStore.listen(function (state) {
        return _debugDebugActions2['default'].addDispatch(state.payload);
      });
      _debugDebugActions2['default'].setAlt(this.props.alt);
    }
  }, {
    key: 'clear',
    value: function clear() {
      _debugDebugActions2['default'].clear();
    }
  }, {
    key: 'getDispatch',
    value: function getDispatch(idx) {
      var dispatch = this.props.dispatches[idx];
      return {
        id: dispatch.id,
        action: dispatch.action,
        data: dispatch.data,
        details: dispatch.details,
        recorded: dispatch.recorded,
        dispatchedStores: dispatch.dispatchedStores,
        mtime: this.props.mtime
      };
    }
  }, {
    key: 'loadRecording',
    value: function loadRecording() {
      var json = prompt('Give me a serialized recording');
      if (json) _debugDebugActions2['default'].loadRecording(json);
    }
  }, {
    key: 'revert',
    value: function revert(ev) {
      var data = ev.target.dataset;
      _debugDebugActions2['default'].revert(data.dispatchId);
    }
  }, {
    key: 'saveRecording',
    value: function saveRecording() {
      _debugDebugActions2['default'].saveRecording();
    }
  }, {
    key: 'startReplay',
    value: function startReplay() {
      _debugDebugActions2['default'].startReplay();
      _debugDebugActions2['default'].replay();
    }
  }, {
    key: 'stopReplay',
    value: function stopReplay() {
      _debugDebugActions2['default'].stopReplay();
    }
  }, {
    key: 'toggleLogDispatches',
    value: function toggleLogDispatches() {
      _debugDebugActions2['default'].toggleLogDispatches();
    }
  }, {
    key: 'togglePauseReplay',
    value: function togglePauseReplay() {
      _debugDebugActions2['default'].togglePauseReplay();
    }
  }, {
    key: 'toggleRecording',
    value: function toggleRecording() {
      _debugDebugActions2['default'].toggleRecording();
    }
  }, {
    key: 'view',
    value: function view(ev) {
      var data = ev.target.dataset;
      var dispatch = this.props.dispatches[data.index];
      _debugDebugActions2['default'].selectData(dispatch);
    }
  }, {
    key: 'renderName',
    value: function renderName(name, _, dispatch, idx) {
      return _react2['default'].createElement(
        'div',
        {
          'data-index': idx,
          onClick: this.view,
          style: { cursor: 'pointer' }
        },
        name
      );
    }
  }, {
    key: 'renderReplay',
    value: function renderReplay() {
      if (this.props.inReplayMode) {
        return _react2['default'].createElement(
          'span',
          null,
          _react2['default'].createElement(
            'span',
            { onClick: this.togglePauseReplay },
            this.props.isReplaying ? 'Pause Replay' : 'Resume Replay'
          ),
          ' | ',
          _react2['default'].createElement(
            'span',
            { onClick: this.stopReplay },
            'Stop Replay'
          )
        );
      }

      return _react2['default'].createElement(
        'span',
        { onClick: this.startReplay },
        'Start Replay'
      );
    }
  }, {
    key: 'renderRevert',
    value: function renderRevert(a, b, dispatch) {
      return _react2['default'].createElement(
        'div',
        null,
        _react2['default'].createElement(
          'span',
          {
            'data-dispatch-id': dispatch.id,
            onClick: this.revert,
            style: { cursor: 'pointer' }
          },
          'Revert'
        ),
        _react2['default'].createElement('span', { dangerouslySetInnerHTML: {
            __html: this.props.currentStateId === dispatch.id ? '&#10003;' : ''
          } })
      );
    }
  }, {
    key: 'render',
    value: function render() {
      return _react2['default'].createElement(
        'div',
        null,
        _react2['default'].createElement(
          'h3',
          null,
          'Dispatches'
        ),
        _react2['default'].createElement(_debugFixedDataTableCss2['default'], null),
        _react2['default'].createElement(
          'div',
          null,
          _react2['default'].createElement(
            'span',
            { onClick: this.toggleRecording },
            this.props.isRecording ? 'Stop Recording' : 'Record'
          ),
          ' | ',
          _react2['default'].createElement(
            'span',
            { onClick: this.clear },
            'Clear'
          ),
          ' | ',
          _react2['default'].createElement(
            'span',
            { onClick: this.saveRecording },
            'Save'
          ),
          ' | ',
          _react2['default'].createElement(
            'span',
            { onClick: this.loadRecording },
            'Load'
          ),
          ' | ',
          this.renderReplay()
        ),
        _react2['default'].createElement(
          _fixedDataTable.Table,
          {
            headerHeight: 30,
            height: 480,
            rowGetter: this.getDispatch,
            rowHeight: 30,
            rowsCount: this.props.dispatches.length,
            width: 320
          },
          _react2['default'].createElement(_fixedDataTable.Column, {
            cellRenderer: this.renderName,
            dataKey: 'action',
            label: 'Name',
            width: 250
          }),
          _react2['default'].createElement(_fixedDataTable.Column, {
            cellRenderer: this.renderRevert,
            dataKey: '',
            label: 'Revert',
            width: 70
          })
        )
      );
    }
  }]);

  return DispatcherDebugger;
})(_react2['default'].Component);

exports['default'] = (0, _connectToStores2['default'])({
  getPropsFromStores: function getPropsFromStores() {
    return _debugDispatcherStore2['default'].getState();
  },

  getStores: function getStores() {
    return [_debugDispatcherStore2['default']];
  }
}, DispatcherDebugger);
module.exports = exports['default'];