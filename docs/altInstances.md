---
layout: docs
title: Alt Instances
description: Generating instances of your flux universe
permalink: /docs/altInstances/
---

# Creating instances of your Flux

If using a singleton is scary to you, or if you believe dependency injection is the way to go then this is the feature for you. You don't have to settle for traditional flux and its singleton stores. You can create separate instances of the Alt universe and then inject these into your view via dependency injection or if you're using React, contexts. With this approach you get isomorphism for free, without having to worry about flushing your stores, since each request will generate its own instance.

Using instances of alt is fairly straightforward.

```js
class MyAlt extends Alt {
  constructor(config = {}) {
    super(config);

    this.addActions('myActions', ActionCreators);
    this.addStore('storeName', Store);
  }
}

var flux = new MyAlt();
```

# AltClass

## AltClass#constructor

> constructor(config: object) : Alt

The alt constructor takes an optional configuration object. This is where you can configure your alt instance.

```js
var flux = new Alt({
  dispatcher: new MyDispatcher()
});
```
### Config Object

The following properties can be defined on the config object:

#### dispatcher

By default alt uses Facebook's Flux [dispatcher](https://github.com/facebook/flux/blob/master/src/Dispatcher.js), but you can provide your own dispatcher implementation for alt to use. Your dispatcher must have a similar interface to the Facebook dispatcher including, `waitFor`, `register`, and `dispatch`.

One easy way to provide your own dispatcher is to extend the Facebook dispatcher. The following example shows a dispatcher that extends Facebook's dispatcher, but modifies it such that all dispatched payloads are logged to the console and `register` has a custom implementation.

```js
class MyDispatcher extends Dispatcher {
  constructor() {
    super();
  }

  dispatch(payload) {
    console.log(payload);
    super.dispatch(payload);
  }

  register(callback) {
    // custom register implementation
  }
}
```

#### serialize

This controls how store data is serialized in snapshots. By default alt uses `JSON.stringify`, but you can provide your own function to serialize data.

#### deserialize

This controls how store data is deserialized from snapshot/bootstrap data. By default alt uses `JSON.parse`, but you can provide your own function to deserialize data.

## AltClass#addActions

> addActions(actionsName: string, actions: [ActionsClass](createActions.md)): undefined

Creates the actions for this instance.

## AltClass#addStore

> addStore(name: string, store: [StoreModel](createStore.md)): undefined

Creates the store for this instance.

## AltClass#getActions

> getActions(): [Actions](actions.md)

Retrieves the created actions. This becomes useful when you need to bind the actions in the store.

```js
class MyStore {
  constructor() {
    this.bindActions(this.alt.getActions('myActions'));
  }
}
```

## AltClass#getStore

> getStore(): [AltStore](stores.md)

Retrieves the store instance that was created.

```js
var state = alt.getStore('myStore').getState();
```
