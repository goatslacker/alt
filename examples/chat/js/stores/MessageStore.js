var alt = require('../alt')

var ChatThreadActionCreators = require('../actions/ChatThreadActionCreators')
var ChatServerActionCreators = require('../actions/ChatServerActionCreators')
var ChatMessageActionCreators = require('../actions/ChatMessageActionCreators')
var ThreadStore = require('../stores/ThreadStore')
var ChatMessageDataUtils = require('../utils/ChatMessageDataUtils')
var ChatMessageUtils = require('../utils/ChatMessageUtils')

class MessageStore {
  constructor() {
    this.bindActions(ChatThreadActionCreators)
    this.bindActions(ChatMessageActionCreators)
    this.bindActions(ChatServerActionCreators)

    this.messages = {}
  }

  onCreateMessage(text) {
    var message = ChatMessageDataUtils.getCreatedMessageData(text)
    this.messages[message.id] = message
  }

  onReceiveAll(rawMessages) {
    this._addMessages(rawMessages)
    this.waitFor([ThreadStore.dispatchToken])
    this._markAllInThreadRead(ThreadStore.getCurrentID())
  }

  onClickThread() {
    this.waitFor([ThreadStore.dispatchToken])
    this._markAllInThreadRead(ThreadStore.getCurrentID())
  }

  _addMessages(rawMessages) {
    rawMessages.forEach((message) => {
      if (!this.messages[message.id]) {
        this.messages[message.id] = ChatMessageUtils.convertRawMessage(
          message,
          ThreadStore.getCurrentID()
        )
      }
    })
  }

  _markAllInThreadRead(threadID) {
    for (var id in this.messages) {
      if (this.messages[id].threadID === threadID) {
        this.messages[id].isRead = true
      }
    }
  }

  static getAllForThread(threadID) {
    var threadMessages = []
    var _messages = this.getState().messages
    for (var id in _messages) {
      if (_messages[id].threadID === threadID) {
        threadMessages.push(_messages[id])
      }
    }
    threadMessages.sort(function(a, b) {
      if (a.date < b.date) {
        return -1
      } else if (a.date > b.date) {
        return 1
      }
      return 0
    })
    return threadMessages
  }

  static getAllForCurrentThread() {
    return this.getAllForThread(ThreadStore.getCurrentID())
  }

  static get(id) {
    return this.getState().messages[id]
  }

  static getAll() {
    return this.getState().messages
  }
}

module.exports = alt.createStore(MessageStore, 'MessageStore')
