---
layout: guide
title: Container Components
description: Higher-order container components for handling store state
permalink: /guide/container-components/
---

# Container Components

Now that we've learned the basics on how to [create actions](actions.md), [create stores](store.md),
and then [listen to them in the view](view.md); it's time to learn some more advanced topics like container components.

What are [container components](https://medium.com/@learnreact/container-components-c0e67432e005)?

They are components that are responsible for managing your state. Remember how in the view we would mix state and rendering?

```js
var Locations = React.createClass({
  getInitialState() {
    return LocationStore.getState();
  },

  componentDidMount() {
    LocationStore.listen(this.onChange);
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
```

This is actually a bad pattern to follow because it makes it more difficult to re-use view specific code. Your components should be split up into two types: those that manage state (stateful components) and those that just deal with the display of data (pure components). Some people call these [smart/dumb components](https://medium.com/@dan_abramov/smart-and-dumb-components-7ca2f9a7c7d0).

The goal of pure components is to write them so they only accept props and are responsible for rendering those props into a view. This makes it easier to test and re-use those components. A simple example is a UserComponent, you can couple this with a UserStore, but then later on if you want to re-use UserComponent with your AdminStore you're going to have a bad time.

A pure Locations component would look like:

```js
var Locations = React.createClass({
  render() {
    return (
      <ul>
        {this.props.locations.map((location, i) => {
          return (
            <li key={i}>
              {location.name}
            </li>
          );
        })}
      </ul>
    );
  }
});
```

Seems easy enough, all we really did was change from `this.state` to `this.props` and removed all the store listening code. So wait, how do you listen to stores then? Enter the wrapping container component.

There are two ways to create a container component in Alt. Through a declarative approach and through a function, we can check out both.

### connectToStores

This is a util function that will connect a component to a store.

```js
var LocationsContainer = connectToStores({
  getStores() {
    // this will handle the listening/unlistening for you
    return [LocationStore]
  },

  getPropsFromStores() {
    // this is the data that gets passed down as props
    return LocationStore.getState()
  }
}, React.createClass({
  render() {
    return <Locations locations={this.props.locations} />
  }
}))
```

As you can see, locations can now be re-used in other places since it's not tied to a particular store. All locations will do is accept an array of locations and concern itself with rendering them. This may seem like extra boilerplate but you'll be grateful for it later on when coming back to the app to maintain it. As a bonus, connectToStores handles the listening and unlistening of your stores. Every time a store changes, `getPropsFromStores` is called and the result of it is passed down as props to the connected component.

### AltContainer

This is a component you can use to declaratively connect a store, or pass down actions, or context to the pure components.

```js
var LocationsContainer = React.createClass({
  render() {
    return (
      <AltContainer store={LocationStore}>
        <Locations />
      </AltContainer>
    )
  }
}))
```

With AltContainer, hooking up a single store to a single component is fairly simple, we use the `store` prop. This will automatically listen and unlisten to your store and whenever state changes it'll re-render the child components passing the entire store's state as props to each component.
