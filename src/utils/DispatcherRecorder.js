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
DispatcherRecorder.prototype.record = function record() {
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
DispatcherRecorder.prototype.stop = function stop() {
  this.alt.dispatcher.unregister(this.dispatchToken)
  this.dispatchToken = null
}

/**
 * Clear all events from memory.
 * clear(): undefined
 */
DispatcherRecorder.prototype.clear = function clear() {
  this.events = []
}

/**
 * (As|S)ynchronously replay all events that were recorded.
 * replay(replayTime: ?number, done: ?function): undefined
 */
DispatcherRecorder.prototype.replay = function replay(replayTime, done) {
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

  let next = done || () => {}
  let i = this.events.length - 1
  while (i >= 0) {
    const event = this.events[i]
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
DispatcherRecorder.prototype.serializeEvents = function serializeEvents() {
  const events = this.events.map((event) => {
    return {
      id: event.id,
      action: event.action,
      data: event.data || {},
    }
  })
  return JSON.stringify(events)
}

/**
 * Load serialized events into the recorder and overwrite the current events
 * loadEvents(events: string): undefined
 */
DispatcherRecorder.prototype.loadEvents = function loadEvents(events) {
  const parsedEvents = JSON.parse(events)
  this.events = parsedEvents.map((event) => {
    return {
      action: event.action,
      data: event.data,
    }
  })
  return parsedEvents
}

export default DispatcherRecorder
