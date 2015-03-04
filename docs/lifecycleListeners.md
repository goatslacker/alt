---
layout: docs
title: Lifecycle Listeners
description: Event listeners for various stages of your store's lifecycle
permalink: /docs/lifecycleListeners/
---

# Lifecycle Listener Methods

When bootstrapping, snapshotting, or recycling there are special methods you can assign to your store to ensure any bookeeping that needs to be done. You would place these in your store's constructor.

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

## Snapshot

`snapshot` is called before the store's state is serialized. Here you can perform any final tasks you need to before the state is saved.

```js
class Store {
  constructor() {
    this.on('snapshot', () => {
      // do something here
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
