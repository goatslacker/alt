'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _alt = require('./alt');

var _alt2 = _interopRequireDefault(_alt);

var _AltStore = require('./AltStore');

var _AltStore2 = _interopRequireDefault(_AltStore);

var _DebugActions = require('./DebugActions');

var _DebugActions2 = _interopRequireDefault(_DebugActions);

exports['default'] = _alt2['default'].createStore((function () {
  var _class = function _class() {
    var _this = this;

    _classCallCheck(this, _class);

    this.cachedDispatches = [];
    this.dispatches = [];
    this.currentStateId = null;
    this.snapshots = {};
    this.replayTime = 100;
    this.isRecording = true;
    this.isReplaying = false;
    this.nextReplayId = null;

    // due to the aggressive nature of FixedDataTable's shouldComponentUpdate
    // and JS objects being references not values we need an mtime applied
    // to each dispatch so we know when data has changed
    this.mtime = Date.now();

    this.on('beforeEach', function () {
      _this.mtime = Date.now();
    });

    this.bindActions(_DebugActions2['default']);
  };

  _createClass(_class, [{
    key: 'addDispatch',
    value: function addDispatch(payload) {
      if (!this.isRecording) return false;

      var dispatchedStores = _AltStore2['default'].stores().filter(function (x) {
        return x.boundListeners.indexOf(payload.action) > -1;
      }).map(function (x) {
        return x.name;
      }).join(', ');

      payload.dispatchedStores = dispatchedStores;

      this.dispatches.unshift(payload);

      this.snapshots[payload.id] = _AltStore2['default'].alt().takeSnapshot();
      this.currentStateId = payload.id;
    }
  }, {
    key: 'clear',
    value: function clear() {
      this.dispatches = [];
      this.currentStateId = null;
      this.nextReplayId = null;
      this.snapshots = {};

      _AltStore2['default'].alt().recycle();
    }
  }, {
    key: 'loadRecording',
    value: function loadRecording(events) {
      this.clear();
      var wasRecording = this.isRecording;
      this.isRecording = true;
      var dispatches = JSON.parse(events);
      dispatches.reverse().forEach(function (dispatch) {
        setTimeout(function () {
          _AltStore2['default'].alt().dispatch(dispatch.action, dispatch.data, dispatch.details);
        }, 0);
      });
      this.isRecording = wasRecording;
    }
  }, {
    key: 'replay',
    value: function replay() {
      if (!this.isReplaying) return false;

      var dispatch = this.cachedDispatches[this.nextReplayId];
      setTimeout(function () {
        _AltStore2['default'].alt().dispatch(dispatch.action, dispatch.data, dispatch.details);
      }, 0);

      this.nextReplayId = this.nextReplayId - 1;

      if (this.nextReplayId >= 0) {
        setTimeout(function () {
          return _DebugActions2['default'].replay();
        }, this.replayTime);
      } else {
        this.isReplaying = false;
        this.nextReplayId = null;
      }
    }
  }, {
    key: 'revert',
    value: function revert(id) {
      var snapshot = this.snapshots[id];
      if (snapshot) {
        this.currentStateId = id;
        _AltStore2['default'].alt().bootstrap(snapshot);
      }
    }
  }, {
    key: 'saveRecording',
    value: function saveRecording() {
      console.log(JSON.stringify(this.dispatches));
    }
  }, {
    key: 'startReplay',
    value: function startReplay() {
      this.cachedDispatches = this.dispatches.slice();
      this.clear();
      this.nextReplayId = this.cachedDispatches.length - 1;
      this.isReplaying = true;
    }
  }, {
    key: 'stopReplay',
    value: function stopReplay() {
      this.cachedDispatches = [];
      this.nextReplayId = null;
      this.isReplaying = false;
    }
  }, {
    key: 'togglePauseReplay',
    value: function togglePauseReplay() {
      this.isReplaying = !this.isReplaying;
    }
  }, {
    key: 'toggleRecording',
    value: function toggleRecording() {
      this.isRecording = !this.isRecording;
    }
  }], [{
    key: 'displayName',
    value: 'DispatcherStore',
    enumerable: true
  }, {
    key: 'config',
    value: {
      getState: function getState(state) {
        return {
          currentStateId: state.currentStateId,
          dispatches: state.dispatches,
          inReplayMode: state.nextReplayId !== null,
          isRecording: state.isRecording,
          isReplaying: state.isReplaying,
          mtime: state.mtime
        };
      }
    },
    enumerable: true
  }]);

  return _class;
})());
module.exports = exports['default'];