'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _ = require('./');

var _2 = _interopRequireDefault(_);

var _utilsActionListeners = require('../utils/ActionListeners');

var _utilsActionListeners2 = _interopRequireDefault(_utilsActionListeners);

var _utilsAltManager = require('../utils/AltManager');

var _utilsAltManager2 = _interopRequireDefault(_utilsAltManager);

var _utilsDispatcherRecorder = require('../utils/DispatcherRecorder');

var _utilsDispatcherRecorder2 = _interopRequireDefault(_utilsDispatcherRecorder);

var _utilsAtomic = require('../utils/atomic');

var _utilsAtomic2 = _interopRequireDefault(_utilsAtomic);

var _utilsConnectToStores = require('../utils/connectToStores');

var _utilsConnectToStores2 = _interopRequireDefault(_utilsConnectToStores);

var _utilsChromeDebug = require('../utils/chromeDebug');

var _utilsChromeDebug2 = _interopRequireDefault(_utilsChromeDebug);

var _utilsMakeFinalStore = require('../utils/makeFinalStore');

var _utilsMakeFinalStore2 = _interopRequireDefault(_utilsMakeFinalStore);

var _utilsWithAltContext = require('../utils/withAltContext');

var _utilsWithAltContext2 = _interopRequireDefault(_utilsWithAltContext);

var _AltContainer = require('../../AltContainer');

var _AltContainer2 = _interopRequireDefault(_AltContainer);

_2['default'].addons = {
  ActionListeners: _utilsActionListeners2['default'],
  AltContainer: _AltContainer2['default'],
  AltManager: _utilsAltManager2['default'],
  DispatcherRecorder: _utilsDispatcherRecorder2['default'],
  atomic: _utilsAtomic2['default'],
  chromeDebug: _utilsChromeDebug2['default'],
  connectToStores: _utilsConnectToStores2['default'],
  makeFinalStore: _utilsMakeFinalStore2['default'],
  withAltContext: _utilsWithAltContext2['default']
};

exports['default'] = _2['default'];
module.exports = exports['default'];