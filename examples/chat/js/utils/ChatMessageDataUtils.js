var ThreadStore = require('../stores/ThreadStore')

class Chatmessage2Utils {
  static getCreatedMessageData(text) {
    var timestamp = Date.now()
    return {
      id: 'm_' + timestamp,
      threadID: ThreadStore.getCurrentID(),
      authorName: 'Bill', // hard coded for the example
      date: new Date(timestamp),
      text: text,
      isRead: true
    }
  }
}

module.exports = Chatmessage2Utils
