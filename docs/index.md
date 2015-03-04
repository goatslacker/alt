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
var Alt = require('alt');
var alt = new Alt();
```

Alternatively, you can [create instances](/docs/altInstances/) of the entire alt universe including stores.

```js
class Flux extends Alt {
  constructor() {
    // add your actions and stores here
  }
}

var flux = new Flux();
```
