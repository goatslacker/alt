"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

Object.defineProperty(exports, "__esModule", {
  value: true
});

var Symbol = _interopRequire(require("es-symbol"));

// action creator handler
var ACTION_HANDLER = Symbol();

exports.ACTION_HANDLER = ACTION_HANDLER;
// the action's uid symbol for listening
var ACTION_KEY = Symbol();

exports.ACTION_KEY = ACTION_KEY;
// the action's name
var ACTION_UID = Symbol();

exports.ACTION_UID = ACTION_UID;
// store all of a store's listeners
var ALL_LISTENERS = Symbol();

exports.ALL_LISTENERS = ALL_LISTENERS;
// event emitter instance
var EE = Symbol();

exports.EE = EE;
// initial snapshot
var INIT_SNAPSHOT = Symbol();

exports.INIT_SNAPSHOT = INIT_SNAPSHOT;
// last snapshot
var LAST_SNAPSHOT = Symbol();

exports.LAST_SNAPSHOT = LAST_SNAPSHOT;
// all lifecycle listeners
var LIFECYCLE = Symbol();

exports.LIFECYCLE = LIFECYCLE;
// store action listeners
var LISTENERS = Symbol();

exports.LISTENERS = LISTENERS;
// public methods
var PUBLIC_METHODS = Symbol();

exports.PUBLIC_METHODS = PUBLIC_METHODS;
// boolean if state has changed for emitting change event
var STATE_CHANGED = Symbol();

exports.STATE_CHANGED = STATE_CHANGED;
// contains all state
var STATE_CONTAINER = Symbol();
exports.STATE_CONTAINER = STATE_CONTAINER;