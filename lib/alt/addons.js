"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var Alt = _interopRequire(require("./"));

var ActionListeners = _interopRequire(require("../../utils/ActionListeners"));

var AltManager = _interopRequire(require("../../utils/AltManager"));

var DispatcherRecorder = _interopRequire(require("../../utils/DispatcherRecorder"));

var atomicTransactions = _interopRequire(require("../../utils/atomicTransactions"));

var chromeDebug = _interopRequire(require("../../utils/chromeDebug"));

var makeFinalStore = _interopRequire(require("../../utils/makeFinalStore"));

var withAltContext = _interopRequire(require("../../utils/withAltContext"));

var AltContainer = _interopRequire(require("../../AltContainer"));

Alt.addons = {
  ActionListeners: ActionListeners,
  AltContainer: AltContainer,
  AltManager: AltManager,
  DispatcherRecorder: DispatcherRecorder,
  atomicTransactions: atomicTransactions,
  chromeDebug: chromeDebug,
  makeFinalStore: makeFinalStore,
  withAltContext: withAltContext };

module.exports = Alt;