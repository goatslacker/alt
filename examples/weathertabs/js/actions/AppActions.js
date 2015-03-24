var alt = require('../alt')

module.exports = alt.createActions(class AppActions {
  constructor() {
    this.generateActions(
      'setManager',
      'addLocation',
      'setLocation',
      'deleteLocation'
    );
  }
});
