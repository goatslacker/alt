---
layout: docs
title: Lifecycle Listeners
description: Event listeners for various stages of your store's lifecycle
permalink: /docs/lifecycleListeners/
---

# Lifecycle Listener Methods

When bootstrapping, snapshotting, or recycling there are special methods you can assign to your store to ensure any bookkeeping that needs to be done. You would place these in your store's constructor.

## Bootstrap

`bootstrap` is called after the store has been bootstrapped. Here you can add some logic to take your bootstrapped data and manipulate it.

```js
class Store {
  constructor() {
    this.on('bootstrap', () => {
      // do something here
    });
  }
}
```

## Serialize

`serialize` is called before the store's state is serialized. Here you can perform any final tasks you need to before the state is saved. You may optionally return an object, which will be used directly as the snapshot data for the store. If you do not return anything, the default, [`MyStore#getState()`](stores.md#storegetstate) is used for the snapshot data.

```js
class Store {
  constructor() {
    this.on('serialize', () => {
      // do something here
      // optional return of data to be used in snapshot
      // return mySnapshotData
    });
  }
}
```

## Deserialize

`deserialize` is called before the store's state is deserialized. This occurs whenever the store's state is being set to an existing snapshot/bootstrap data. Here you can perform any final tasks you need to before the snapshot/bootstrap data is set on the store such as mapping the data to model objects, or converting data an external source like a JSON API into a format the store expects. Deserialize takes in a parameter that is an object of snapshot/bootstrap data and must return the data to be set to the store's state. If nothing is returned, then the data from the snapshot is set to the store's state. See the [serialization](serialization.md) for an example.

```js
class Store {
  constructor() {
    this.on('deserialize', (data) => {
      // do something here
      return modifiedData
    });
  }
}
```

## Init

`init` is called when the store is initialized as well as whenever a store is recycled.

```js
class Store {
  constructor() {
    this.on('init', () => {
      // do something here
    }):
  }
}
```

## Rollback

`rollback` is called whenever all the stores are rolled back.

```js
class Store {
  constructor() {
    this.on('rollback', () => {
      // do something here
    });
  }
}
```
