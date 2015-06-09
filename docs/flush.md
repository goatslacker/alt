---
layout: docs
title: Flush
description: Reset stores back to initial state
permalink: /docs/flush/
---

# flush

> (): string

Flush takes a snapshot of the current application state and then resets all the stores back to their original initial state. This is useful if you're using alt stores as singletons and doing server side rendering.

In this particular scenario you would load the data in via `bootstrap` and then use `flush` once the view markup has been created. This makes sure that your components have the proper data and then resets your stores so they are ready for the next request. This is all not effected by concurrency since bootstrap, flush, and render are all synchronous processes.

```js
const applicationState = alt.flush();
```
