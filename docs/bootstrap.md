---
layout: docs
title: Bootstrap
description: Bootstrapping all your application state
permalink: /docs/bootstrap/
---

# bootstrap

> (data: string): undefined

The `alt.bootstrap()` function takes in a snapshot you've saved and reloads all the state with that snapshot, no events will be emitted to your components during this process, so it is advised to do this on init before the view has even rendered.

Bootstrap is great if you're running an isomorphic app, or if you're persisting state to localstorage and then retrieving it on init later on. You can save a snapshot on the server side, send it down, and then bootstrap it back on the client.

If you're bootstrapping then it is recommended you pass in a [unique Identifier to createStore](createStore.md#createstore), name of the class is good enough, to createStore so that it can be referenced later for bootstrapping.

```js
alt.bootstrap(JSON.stringify({
  MyStore: {
    key: 'value',
    key2: 'value2'
  }
}));
```
