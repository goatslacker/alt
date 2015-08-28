---
layout: guide
title: Fetching Data
description: Asynchronous flow control and flux state
permalink: /guide/async/
---

# Fetching Data

This tutorial shows how to fetch data and handle a failure.

Where should async go? There is no right answer. You can put it in actions or in stores. In this tutorial, we'll be calling async from the actions and the data fetching will exist in a new folder `sources`.
Create `sources/LocationSource.js`. You can use something like [`fetch`](https://github.com/github/fetch) to fetch some data from a server. For the purposes of this tutorial we will be using `setTimeout` and `Promise` to mimic a request made using `fetch` API.
Here's some mock data we'll be using:
```js
var mockData = [
  { id: 0, name: 'Abu Dhabi' },
  { id: 1, name: 'Berlin' },
  { id: 2, name: 'Bogota' },
  { id: 3, name: 'Buenos Aires' },
  { id: 4, name: 'Cairo' },
  { id: 5, name: 'Chicago' },
  { id: 6, name: 'Lima' },
  { id: 7, name: 'London' },
  { id: 8, name: 'Miami' },
  { id: 9, name: 'Moscow' },
  { id: 10, name: 'Mumbai' },
  { id: 11, name: 'Paris' },
  { id: 12, name: 'San Francisco' }
];
```
So let's create the `LocationSource`.

`sources/LocationSource.js`

```js
var LocationSource = {
  fetch: function () {
    // returning a Promise because that is what fetch does.
    return new Promise(function (resolve, reject) {
      // simulate an asynchronous action where data is fetched on
      // a remote server somewhere.
      setTimeout(function () {
        // resolve with some mock data
        resolve(mockData);
      }, 250);
    });
  }
};
```

Next, we'll need to change the actions to use this new method we created. We will add an action called `fetchLocations` which will fetch the locations and then call `updateLocations` when it successfully completes. A new action `locationsFailed` deals with the locations not being available. Add these methods to the class.
`actions/LocationActions.js`
```js
fetchLocations() {
  // we dispatch an event here so we can have "loading" state.
  this.dispatch();
  LocationSource.fetch()
    .then((locations) => {
      // we can access other actions within our action through `this.actions`
      this.actions.updateLocations(locations);
    })
    .catch((errorMessage) => {
      this.actions.locationsFailed(errorMessage);
    });
}
locationsFailed(errorMessage) {
  this.dispatch(errorMessage);
}
```
Next we'll update our store to handle these new actions. It's just a matter of adding the new actions and their handlers to `bindListeners`. A new state 'errorMessage' is added to deal with a potential error message.
`stores/LocationStore.js`
```js
class LocationStore {
  constructor() {
    this.locations = [];
    this.errorMessage = null;
    this.bindListeners({
      handleUpdateLocations: LocationActions.UPDATE_LOCATIONS,
      handleFetchLocations: LocationActions.FETCH_LOCATIONS,
      handleLocationsFailed: LocationActions.LOCATIONS_FAILED
    });
  }
  handleUpdateLocations(locations) {
    this.locations = locations;
    this.errorMessage = null;
  }
  handleFetchLocations() {
    // reset the array while we're fetching new locations so React can
    // be smart and render a spinner for us since the data is empty.
    this.locations = [];
  }

  handleLocationsFailed(errorMessage) {
    this.errorMessage = errorMessage;
  }
}
```
And finally, the view will change slightly. We'll be displaying an error message if it exists and showing a spinner if the content is loading.
```js
componentDidMount() {
  LocationStore.listen(this.onChange);

  LocationActions.fetchLocations();
},

render() {
  if (this.state.errorMessage) {
    return (
      <div>Something is wrong</div>
    );
  }

  if (!this.state.locations.length) {
    return (
      <div>
        <img src="/my-cool-spinner.gif" />
      </div>
    )
  }

  return (
    <ul>
      {this.state.locations.map((location) => {
        return (
          <li>{location.name}</li>
        );
      })}
    </ul>
  );
}
```
[Continue to next step...](wait-for.md)
