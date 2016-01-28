---
layout: guide
title: Creating Actions
description: How to create actions for managing state
permalink: /guide/actions/
---

# Creating Actions

The first actions we create will be simple, they'll take in an array of locations we'll pass in at the start of the application and just dispatch them to the store.

We create an action by creating a class, the class' prototype methods will become the actions. The class syntax is completely optional you can use regular constructors and prototypes.

Whatever value you return from your action will be sent through the Dispatcher and onto the stores. Finally, make sure you export the created actions using `alt.createActions`.

---

`actions/LocationActions.js`

```js
var alt = require('../alt');

class LocationActions {
  updateLocations(locations) {
    return locations;
  }
}

module.exports = alt.createActions(LocationActions);
```

[Continue to next step...](store.md)
