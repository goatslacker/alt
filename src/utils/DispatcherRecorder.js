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

function DispatcherRecorder(alt, maxEvents = Infinity) {
  this.alt = alt
  this.events = []
  this.dispatchToken = null
  this.maxEvents = maxEvents
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

  this.dispatchToken = this.alt.dispatcher.register((payload) => {
    if (this.events.length < this.maxEvents) {
      this.events.push(payload)
    }
  })

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
  const alt = this.alt

  if (replayTime === void 0) {
    this.events.forEach((payload) => {
      alt.dispatch(payload.action, payload.data)
    })
  }

  const onNext = (payload, nextAction) => {
    return () => {
      setTimeout(() => {
        alt.dispatch(payload.action, payload.data)
        nextAction()
      }, replayTime)
    }
  }

  let next = done || function () { }
  let i = this.events.length - 1
  while (i >= 0) {
    let event = this.events[i]
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
  const events = this.events.map((event) => {
    return {
      action: event.action,
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
  const parsedEvents = JSON.parse(events)
  this.events = parsedEvents.map((event) => {
    return {
      action: event.action,
      data: event.data
    }
  })
}

export default DispatcherRecorder
