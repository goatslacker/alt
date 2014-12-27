var alt = require('../alt')

var ChatWebAPIUtils = require('../utils/ChatWebAPIUtils')
var ChatMessageDataUtils = require('../utils/ChatMessageDataUtils')

class ChatMessageActions {
  createMessage(text) {
    this.dispatch(text)

    var message = ChatMessageDataUtils.getCreatedMessageData(text)
    ChatWebAPIUtils.createMessage(message)
  }
}

module.exports = alt.createActions(ChatMessageActions)
