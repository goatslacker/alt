---
layout: guide
title: Creating Actions
description: How to create actions for managing state
permalink: /guide/actions/
---

# Creating Actions

An action creator is defined using a `class`. Prototype methods are used to define the actions.

`updateLocations` is an action that takes an array of locations and dispatches them to the store. `LocationActions` is action creator.

Use [`this.dispatch`](http://alt.js.org/docs/createActions/#actionsclassdispatch) to dispatch your payload through the `Dispatcher` to the stores.

Export the class using [`createActions`](http://alt.js.org/docs/createActions/#createactions).

---

`actions/LocationActions.js`

```js
let alt = require('../alt');

class LocationActions {
  updateLocations (locations) {
    this.dispatch(locations);
  }
}

module.exports = alt.createActions(LocationActions);
```

The class syntax is optional. You can [use regular constructors and prototypes](http://alt.js.org/guides/es5/).

[Continue to next step...](store.md)
