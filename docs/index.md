---
layout: docs
title: API Documentation
description: Complete API docs for alt
permalink: /docs/
---

# Api Documentation

Welcome to alt API docs page. These pages contain the reference material for the latest version of alt. The pages are organized by various features that alt has.

## Alt

Creating a new instance of alt.

```js
const Alt = require('alt');
const alt = new Alt();
```

## AltClass#constructor

> constructor(config: object) : Alt

The alt constructor takes an optional configuration object. This is where you can configure your alt instance.

```js
const alt = new Alt({
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

#### stateTransforms

This is an array of functions you can provide which will be executed every time `createStore` or `createUnsavedStore` is ran. It will iterate through the array applying each function to your store. This can be useful if you wish to perform any pre-processing or transformations to your store before it's created.

## Instances

Alternatively, you can [create instances](/docs/altInstances/) of the entire alt universe including stores.

```js
class Flux extends Alt {
  constructor() {
    // add your actions and stores here
  }
}

const flux = new Flux();
```
