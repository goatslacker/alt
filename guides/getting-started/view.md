---
layout: guide
title: Using your View
description: React components and how they fit into a flux architecture
permalink: /guide/view/
---

# Using your View

We won't spend too much time on all the parts of the view since it is more about React than it is Alt, however, the important piece is how you listen to stores and get data out of it.

Getting the state out of your store is simple, every alt store has a method which returns its state. The state is copied over as a value when returned so you accidentally don't mutate it by reference. We can use React's `getInitialState` to set the initial state using the store's state.

```js
getInitialState() {
  return LocationStore.getState();
},
```

But then we'll want to listen to changes once the state in the store is updated. In your react component on `componentDidMount` you can add an event handler using `LocationStore.listen`.

```js
componentDidMount() {
  LocationStore.listen(this.onChange);
},
```

And, don't forget to remove your event listener.

```js
componentWillUnmount() {
  LocationStore.unlisten(this.onChange);
},
```

A few [mixins](https://github.com/altjs/mixins) or a ["higher-order-component"](https://github.com/altjs/connect-to-stores) are available to make this boilerplate go away.

---

`components/Locations.jsx`

```js
var React = require('react');
var LocationStore = require('../stores/LocationStore');

var Locations = React.createClass({
  getInitialState() {
    return LocationStore.getState();
  },

  componentDidMount() {
    LocationStore.listen(this.onChange);
  },

  componentWillUnmount() {
    LocationStore.unlisten(this.onChange);
  },

  onChange(state) {
    this.setState(state);
  },

  render() {
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
});

module.exports = Locations;
```

[Continue to next step...](async.md)
