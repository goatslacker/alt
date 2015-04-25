---
layout: docs
title: Prepare
description: Prepare a payload for bootstrapping
permalink: /docs/prepare/
---

# prepare

> (Store: AltStore, payload: mixed): string

Given a store and a payload this functions returns a serialized string you can use to bootstrap that particular store.

```js
const data = alt.prepare(TodoStore, {
  todos: [{
    text: 'Buy some milk'
  ]}
});

alt.bootstrap(data);
```
