module.exports = DispatcherRecorder

function DispatcherRecorder(alt) {
  this.alt = alt
  this.events = []
  this.dispatchToken = null
}

DispatcherRecorder.prototype.record = function () {
  if (this.dispatchToken) {
    return false
  }

  this.dispatchToken = this.alt.dispatcher.register(function (payload) {
    this.events.push(payload)
  }.bind(this))

  return true
}

DispatcherRecorder.prototype.stop = function () {
  this.alt.dispatcher.unregister(this.dispatchToken)
  this.dispatchToken = null
}

DispatcherRecorder.prototype.clear = function () {
  this.events = []
}

DispatcherRecorder.prototype.replay = function () {
  this.events.forEach(function (payload) {
    this.alt.dispatch(payload.action, payload.data)
  }.bind(this))
}
