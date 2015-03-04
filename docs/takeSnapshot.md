---
layout: docs
title: Snapshots
description: Take a snapshot of your entire application's state
permalink: /docs/takeSnapshot/
---

# takeSnapshot

> (): string

Take snapshot provides you with the entire application's state serialized to JSON.

Snapshots are a core component of alt. The idea is that at any given point in time you can `takeSnapshot` and have your entire application's state
serialized for persistence, transfering, logging, or debugging.

```js
var snapshot = alt.takeSnapshot();
```
