---
layout: docs
title: Rollback
description: Reset stores back to previous state
permalink: /docs/rollback/
---

# rollback

> (): undefined

If you've screwed up the state, or you just feel like rolling back you can call `alt.rollback()`. Rollback is pretty dumb in the sense that it's not automatic in case of errors, and it only rolls back to the last saved snapshot, meaning you have to save a snapshot first in order to roll back.

```js
// reset state to last saved snapshot
alt.rollback();
```
