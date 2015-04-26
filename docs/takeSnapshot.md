---
layout: docs
title: Snapshots
description: Take a snapshot of your entire application's state
permalink: /docs/takeSnapshot/
---

# takeSnapshot

> (...storeNames: ?string|AltStore): string

Take snapshot provides you with the entire application's state serialized to JSON, by default, but you may also pass in stores to take a snapshot of a subset of the application's state.

Snapshots are a core component of alt. The idea is that at any given point in time you can `takeSnapshot` and have your entire application's state
serialized for persistence, transferring, logging, or debugging.

```js
var snapshot = alt.takeSnapshot();
var partialSnapshot = alt.takeSnapshot(Store1, Store3);
```
