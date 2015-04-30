var React = require('react');
var ReactStateMagicMixin = require('../../../../mixins/ReactStateMagicMixin');
var Alt = require('../../../../');
var AltManager = require('../../../../utils/AltManager');
var AppActions = require('../actions/AppActions');
var AppStore = require('../stores/AppStore');
var WeatherTab = require('./WeatherTab.jsx');

var manager = new AltManager(Alt);
AppActions.setManager(manager);

module.exports = React.createClass({

  displayName: 'App',
  mixins: [ReactStateMagicMixin],
  statics: { registerStore: AppStore },

  render: function() {
    var locationLinks = [];
    var weatherApp = null;

    if (this.state.location) {
      weatherApp = (
        <WeatherTab
          alt={manager.getOrCreate(this.state.location)}
          location={this.state.location} />
      );
    }

    for (var location in manager.all()) {
      locationLinks.push(
        <li
          key={location}
          className={location === this.state.location ? 'selected' : null}>
          <a href="javascript:void(0);" onClick={this._onClickLocation.bind(this, location)}>
            {location}
          </a>
        </li>
      );
    }

    return (
      <div>
        <h1>AltManager - Weather Tabs App</h1>
        <div className="content">
          <p>
            This is an example React/Flux/Alt app that shows the use of AltManager, a
            utility class for Alt.js. AltManager allows for multiple alt instances which is
            necessary to build apps that encapsulates a mini app inside of a large app. In
            this example we have a simple weather searcher. Each search you make will
            create a new tab which itself is a new Alt instance and has its own internal
            store & actions. Whatever you do in the alt instance is persisted even after
            you move to another tab. You can delete tabs which will delete that alt instance
          </p>
          <form className="search-box" onSubmit={this._onClickSubmit}>
            <input
              type="text"
              className="search-location"
              placeholder="Location eg. New York City, NY"/>
            <button>Search Weather</button>
          </form>
          <ul className="nav">{locationLinks}</ul>
          {weatherApp}
        </div>
      </div>
    );
  },

  componentDidMount: function() {
    // we load San Francisco, CA on page load as an example
    AppActions.addLocation('San Francisco, CA, USA');
  },

  _onClickSubmit: function(e) {
    e.preventDefault();
    AppActions.addLocation(e.target.children[0].value.trim());
  },

  _onClickLocation: function(location) {
    AppActions.setLocation(location);
  }
});
