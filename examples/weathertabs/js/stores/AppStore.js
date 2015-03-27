var alt = require('../alt');

var AppActions = require('../actions/AppActions');

module.exports = alt.createStore(class AppStore {
  constructor() {
    this.bindActions(AppActions);
    this.location = null;
    this.manager = null;
  }

  setManager(manager) {
    this.manager = manager;
  }

  addLocation(location) {
    this.manager.getOrCreate(location);
    this.location = location;
  }

  setLocation(location) {
    this.location = location;
  }

  deleteLocation(location) {
    this.manager.delete(location);
    this.location = null;
    for (var i in this.manager.all()) {
      this.location = i;
      break;
    }
  }
});
