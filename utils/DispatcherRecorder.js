/**
 * DispatcherRecorder(alt: AltInstance): DispatcherInstance
 *
 * > Record and replay your actions at any point in time.
 *
 * This util allows you to record a set of dispatches which you can later
 * replay at your convenience.
 *
 * Good for: Debugging, repeating, logging.
 *
 * Usage:
 *
 * ```js
 * var recorder = new DispatcherRecorder(alt);
 *
 * // start recording
 * recorder.record();
 *
 * // call a series of actions
 *
 * // stop recording
 * recorder.stop();
 *
 * // replay the events that took place
 * recorder.replay();
 * ```
 */

"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
function DispatcherRecorder(alt) {
  var maxEvents = arguments[1] === undefined ? Infinity : arguments[1];

  this.alt = alt;
  this.events = [];
  this.dispatchToken = null;
  this.maxEvents = maxEvents;
}

/**
 * If recording started you get true, otherwise false since there's a recording
 * in progress.
 * record(): boolean
 */
DispatcherRecorder.prototype.record = function () {
  var _this = this;

  if (this.dispatchToken) {
    return false;
  }

  this.dispatchToken = this.alt.dispatcher.register(function (payload) {
    if (_this.events.length < _this.maxEvents) {
      _this.events.push(payload);
    }
  });

  return true;
};

/**
 * Stops the recording in progress.
 * stop(): undefined
 */
DispatcherRecorder.prototype.stop = function () {
  this.alt.dispatcher.unregister(this.dispatchToken);
  this.dispatchToken = null;
};

/**
 * Clear all events from memory.
 * clear(): undefined
 */
DispatcherRecorder.prototype.clear = function () {
  this.events = [];
};

/**
 * (As|S)ynchronously replay all events that were recorded.
 * replay(replayTime: ?number, done: ?function): undefined
 */
DispatcherRecorder.prototype.replay = function (replayTime, done) {
  var alt = this.alt;

  if (replayTime === void 0) {
    this.events.forEach(function (payload) {
      alt.dispatch(payload.action, payload.data);
    });
  }

  var onNext = function onNext(payload, nextAction) {
    return function () {
      setTimeout(function () {
        alt.dispatch(payload.action, payload.data);
        nextAction();
      }, replayTime);
    };
  };

  var next = done || function () {};
  var i = this.events.length - 1;
  while (i >= 0) {
    var _event = this.events[i];
    next = onNext(_event, next);
    i -= 1;
  }

  next();
};

/**
 * Serialize all the events so you can pass them around or load them into
 * a separate recorder.
 * serializeEvents(): string
 */
DispatcherRecorder.prototype.serializeEvents = function () {
  var events = this.events.map(function (event) {
    return {
      id: event.id,
      action: event.action,
      data: event.data || {}
    };
  });
  return JSON.stringify(events);
};

/**
 * Load serialized events into the recorder and overwrite the current events
 * loadEvents(events: string): undefined
 */
DispatcherRecorder.prototype.loadEvents = function (events) {
  var parsedEvents = JSON.parse(events);
  this.events = parsedEvents.map(function (event) {
    return {
      action: event.action,
      data: event.data
    };
  });
  return parsedEvents;
};

exports["default"] = DispatcherRecorder;
module.exports = exports["default"];