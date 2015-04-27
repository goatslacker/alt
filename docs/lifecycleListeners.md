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

## Error

`error` is called whenever an error occurs in your store during a dispatch. You can use this listener to catch errors and perform any cleanup tasks.

```js
class Store {
  constructor() {
    this.on('error', (err, payload, currentState) => {
      if (payload.action === MyActions.fire) {
        logError(err, payload.data);
      }
    });

    this.bindListeners({
      handleFire: MyActions.fire
    });
  }

  handleFire() {
    throw new Error('Something is broken');
  }
}
```

## beforeEach

> (payload: object, state: object): undefined

This method gets called, if defined, before the payload hits the action. You can use this method to `waitFor` other stores, save previous state, or perform any bookeeping. The state passed in to `beforeEach` is the current state pre-action.

`payload` is an object which contains the keys `action` for the action name and `data` for the data that you're dispatching; `state` is the current store's state.

## afterEach

> (payload: object, state: object): undefined

This method gets called, if defined, after the payload hits the action and the store emits a change. You can use this method for bookeeping and as a companion to `beforeEach`. The state passed in to `afterEach` is the current state post-action.

## unlisten

> (): undefined

`unlisten` is called when you call unlisten on your store subscription. You can use this method to perform any teardown type tasks.
