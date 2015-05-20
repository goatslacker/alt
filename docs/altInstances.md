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

You can set your entire app context by wrapping your root component with `withAltContext`.

As a decorator:
```js
import withAltContext from 'alt/utils/withAltContext'

@withAltContext(alt)
export default class App extends React.Component {
  render() {
    return <div>{this.context.flux}</div>
  }
}
```

As a function:
```js
import withAltContext from 'alt/utils/withAltContext'

export default withAltContext(alt)(App);
```

# AltClass

## AltClass#constructor

> constructor(config: object) : Alt

## AltClass#addActions

> addActions(actionsName: string, actions: [ActionsClass](createActions.md)): undefined

Creates the actions for this instance.

## AltClass#addStore

> addStore(name: string, store: [StoreModel](createStore.md), saveStore: boolean): undefined

Creates the store for this instance.

## AltClass#getActions

> getActions(): [Actions](actions.md)

Retrieves the created actions. This becomes useful when you need to bind the actions in the store.

```js
class MyStore {
  constructor(alt) {
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
