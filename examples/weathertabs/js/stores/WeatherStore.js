class WeatherStore {
  constructor(alt) {
    this.bindActions(alt.getActions('WeatherActions'));
    this.loading = false;
    this.weather = null;
    this.showRaw = false;
    this.location = null;
  }

  loadWeather(location) {
    this.location = location;
    this.loading = true;
  }

  setLoading(isLoading) {
    this.loading = isLoading;
  }

  setWeather(weather) {
    this.weather = weather;
  }

  showRaw(showRaw) {
    this.showRaw = showRaw;
  }
}

module.exports = WeatherStore;
