---
layout: guide
title: Data Dependencies
description: How to deal with derived data within your stores
permalink: /guide/wait-for/
---

# Data Dependencies

Dealing with data dependencies between stores is often a tricky and time consuming endeavour. This is one of the reasons why flux was originally built. Flux comes with this method called `waitFor` which signals to the dispatcher that this store depends on another store for its data.

Say we have a new `FavoritesStore` where you'll be able to mark your favorite locations. We want to update the LocationStore only after the FavoriteStore gets its update.

First lets add a new action to our LocationActions.

`actions/LocationActions.js`

```js
favoriteLocation(locationId) {
  this.dispatch(locationId);
}
```

Next, lets build our FavoritesStore.

`stores/FavoritesStore.js`

```js
var alt = require('../alt');
var LocationActions = require('../actions/LocationActions');

class FavoritesStore {
  constructor() {
    this.locations = [];

    this.bindListeners({
      addFavoriteLocation: LocationActions.FAVORITE_LOCATION
    });
  }

  addFavoriteLocation(location) {
    this.locations.push(location);
  }
}

module.exports = alt.createStore(FavoritesStore, 'FavoritesStore');
```

And finally lets set the waitFor dependency in our LocationStore. But first, make sure you bind the new action to a new action handler in the store.

```js
this.bindListeners({
  handleUpdateLocations: LocationActions.UPDATE_LOCATIONS,
  handleFetchLocations: LocationActions.FETCH_LOCATIONS,
  handleLocationsFailed: LocationActions.LOCATIONS_FAILED,
  setFavorites: LocationActions.FAVORITE_LOCATION
});
```

And lets create the action handler with `waitFor`.

```js
resetAllFavorites() {
  this.locations = this.locations.map((location) => {
    return {
      id: location.id,
      name: location.name,
      has_favorite: false
    };
  });
}

setFavorites(location) {
  this.waitFor(FavoritesStore);

  var favoritedLocations = FavoritesStore.getState().locations;

  this.resetAllFavorites();

  favoritedLocations.forEach((location) => {
    // find each location in the array
    for (var i = 0; i < this.locations.length; i += 1) {

      // set has_favorite to true
      if (this.locations[i].id === location.id) {
        this.locations[i].has_favorite = true;
        break;
      }
    }
  });
}
```

You can check out the working final result [here](https://github.com/goatslacker/alt-tutorial).
