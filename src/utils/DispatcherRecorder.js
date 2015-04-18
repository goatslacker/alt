'use strict'
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
module.exports = DispatcherRecorder

var Symbol = require('es-symbol')

function DispatcherRecorder(alt) {
  this.alt = alt
  this.events = []
  this.dispatchToken = null
}

/**
 * If recording started you get true, otherwise false since there's a recording
 * in progress.
 * record(): boolean
 */
DispatcherRecorder.prototype.record = function () {
  if (this.dispatchToken) {
    return false
  }

  this.dispatchToken = this.alt.dispatcher.register(function (payload) {
    this.events.push(payload)
  }.bind(this))

  return true
}

/**
 * Stops the recording in progress.
 * stop(): undefined
 */
DispatcherRecorder.prototype.stop = function () {
  this.alt.dispatcher.unregister(this.dispatchToken)
  this.dispatchToken = null
}

/**
 * Clear all events from memory.
 * clear(): undefined
 */
DispatcherRecorder.prototype.clear = function () {
  this.events = []
}

/**
 * (As|S)ynchronously replay all events that were recorded.
 * replay(replayTime: ?number, done: ?function): undefined
 */
DispatcherRecorder.prototype.replay = function (replayTime, done) {
  var alt = this.alt

  if (replayTime === void 0) {
    this.events.forEach(function (payload) {
      alt.dispatch(payload.action, payload.data)
    })
  }

  var onNext = function (payload, nextAction) {
    return function () {
      setTimeout(function () {
        alt.dispatch(payload.action, payload.data)
        nextAction()
      }, replayTime)
    }
  }

  var next = done || function () { }
  var i = this.events.length - 1
  while (i >= 0) {
    var event = this.events[i]
    next = onNext(event, next)
    i -= 1
  }

  next()
}

/**
 * Serialize all the events so you can pass them around or load them into
 * a separate recorder.
 * serializeEvents(): string
 */
DispatcherRecorder.prototype.serializeEvents = function () {
  var events = this.events.map(function (event) {
    return {
      action: Symbol.keyFor(event.action),
      data: event.data
    }
  })
  return JSON.stringify(events)
}

/**
 * Load serialized events into the recorder and overwrite the current events
 * loadEvents(events: string): undefined
 */
DispatcherRecorder.prototype.loadEvents = function (events) {
  var parsedEvents = JSON.parse(events)
  this.events = parsedEvents.map(function (event) {
    return {
      action: Symbol.for(event.action),
      data: event.data
    }
  })
}
