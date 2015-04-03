---
layout: docs
title: ImmutableUtil
description: A utility for creating Immutable Flux Stores
permalink: /docs/utils/immutableUtil
---

# ImmutableUtil

`ImmutableUtil` is a helper utility to create immutable flux stores. These stores will have automatic lifecycle listeners for serialization and deserialization as well as helper methods for setting state.

## ImmutableUtil.createStore

> (alt: object, store: StoreModel, name: string): AltStore

```js
class EmailStore {
  constructor() {
    this.opened = false;
  }
}

const ImmutableStore = ImmutableUtil.createStore(alt, EmailStore, 'EmailStore');
```

Setting state is simple using `setState`.

```js
class EmailStore {
  constructor() {
    this.bindListeners({
      openMail: MailActions.open
    });

    this.opened = false;
  }

  openMail(id) {
    this.setState(this.getImmutableState().set('opened', true));
  }
}
```

`getImmutableState` gets the internal immutable object. It is syntactic sugar for the store instance's `getState()` method.

You can take a snapshot of the store and the immutable object will be converted into a plain JavaScript Object using Immutable's `toJS()` method.

```js
alt.takeSnapshot(); // { EmailStore: { opened: true } }
```

You can also bootstrap from an Object and it'll be converted to an Immutable object.

```js
alt.bootstrap(JSON.stringify({ EmailStore: { opened: true } }));
```
