---
layout: guide
title: Creating a Store
description: Store manages the state and is shared across your components
permalink: /guide/store/
---

# Creating a Store

The store is your data warehouse. This is the single source of truth for a particular piece of your application's state. Similar to actions, we'll be creating a class for the store. Also like the actions, the class syntax is completely optional, you can use regular constructors and prototypes.

```js
class LocationStore {
  constructor() {
  }
}
```


Instance variables defined anywhere in the store will become the state. This resembles how we reason about and build normal JS classes. You can initiaize these in the constructor and then update them directly in the prototype methods.

```js
this.locations = [];
```

Next, we define methods in the store's prototype that will deal with the actions. These are called action handlers.
Stores automatically emit a change event when an action is dispatched through the store and the action handler ends. In order to suppress the change event you can return false from the action handler.

```js
handleUpdateLocations(locations) {
  this.locations = locations;
  // optionally return false to suppress the store change event
}
```

And then in the constructor, we bind our action handlers to our actions.

```js
this.bindListeners({
  handleUpdateLocations: LocationActions.UPDATE_LOCATIONS
});
```

Finally, we export our newly created store.

```js
module.exports = alt.createStore(LocationStore, 'LocationStore');
```

---

`stores/LocationStore.js`

```js
var alt = require('../alt');
var LocationActions = require('../actions/LocationActions');

class LocationStore {
  constructor() {
    this.locations = [];

    this.bindListeners({
      handleUpdateLocations: LocationActions.UPDATE_LOCATIONS
    });
  }

  handleUpdateLocations(locations) {
    this.locations = locations;
  }
}

module.exports = alt.createStore(LocationStore, 'LocationStore');
```

[Continue to next step...](view.md)
