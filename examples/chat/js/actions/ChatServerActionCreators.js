var alt = require('../alt')

class ChatServerActions {
  constructor() {
    this.generateActions('receiveCreatedMessage', 'receiveAll')
  }
}

module.exports = alt.createActions(ChatServerActions)
