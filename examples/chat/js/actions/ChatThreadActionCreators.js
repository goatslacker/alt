var alt = require('../alt')

class ChatThreadActions {
  constructor() {
    this.generateActions('clickThread')
  }
}

module.exports = alt.createActions(ChatThreadActions)
