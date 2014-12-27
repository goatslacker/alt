var alt = require('../alt')

var ChatThreadActionCreators = require('../actions/ChatThreadActionCreators')
var ChatServerActionCreators = require('../actions/ChatServerActionCreators')

var MessageStore = require('../stores/MessageStore')
var ThreadStore = require('../stores/ThreadStore')

class UnreadThreadStore {
  constructor() {
    this.bindActions(ChatThreadActionCreators)
    this.bindActions(ChatServerActionCreators)
  }

  onClickThread(threadID) {
    this.wait()
  }

  onReceiveRawMessages(rawMessages) {
    this.wait()
  }

  wait() {
    this.waitFor([
      ThreadStore.dispatchToken,
      MessageStore.dispatchToken
    ])
  }

  static getCount() {
    var threads = ThreadStore.getAll()
    var unreadCount = 0
    for (var id in threads) {
      if (!threads[id].lastMessage.isRead) {
        unreadCount++
      }
    }
    return unreadCount
  }
}

module.exports = alt.createStore(UnreadThreadStore, 'UnreadThreadStore')
