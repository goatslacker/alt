var React = require('react');
var AltManagerMixin = require('../../../../mixins/AltManagerMixin');
var AppActions = require('../actions/AppActions');
var WeatherActions = require('../actions/WeatherActions');
var WeatherStore = require('../stores/WeatherStore');

module.exports = React.createClass({

  displayName: 'WeatherTab',

  mixins: [AltManagerMixin],
  statics: { registerStore: WeatherStore, registerAction: WeatherActions },

  onNewAlt: function(state, newProps) {
    // load weather if none exists
    if (!state.location && !state.loading) {
      this.action.loadWeather(newProps.location);
    }
  },

  _onClickShowRaw: function() {
    this.action.showRaw(!this.state.showRaw);
  },

  onClickDelete: function() {
    AppActions.deleteLocation(this.props.location);
  },

  getWeatherContent: function() {
    if (this.state.loading) {
      return <div className="loading"><img src="images/loading.gif" /></div>;
    }

    if (!this.state.weather) {
      return <p>Error loading weather data, check location</p>;
    }

    var weather = this.state.weather;
    var rawData = null;
    var showText = 'Show Raw JSON';
    if (this.state.showRaw) {
      rawData = <pre>{JSON.stringify(weather, null, 4)}</pre>;
      showText = 'Hide Raw JSON';
    }

    return (
      <div className="weather-data">
        <h3>Current Temp: {weather.main.temp}K, {weather.weather[0].description}</h3>
        <button onClick={this._onClickShowRaw}>
          {showText}
        </button>
        {rawData}
      </div>
    );
  },

  render: function() {
    return (
      <div className="weather-tab">
        <button className="pull-right" onClick={this.onClickDelete}>
          Close Tab
        </button>
        <h2>Weather For {this.state.location}</h2>
        {this.getWeatherContent()}
      </div>
    );
  },
});
