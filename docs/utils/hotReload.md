---
layout: docs
title: Webpack Hot Module Replacement
description: Hot reload on stores for use with webpack
permalink: /docs/hot-reload/
---

# HMR (hot module replacement)

When working with webpack and something like [react-hot-loader](https://github.com/gaearon/react-hot-loader) changing stores often causes your stores to be re-created (since they're wrapped) while this isn't a big deal it does cause a surplus of stores which pollutes the alt namespace and the alt debugger. With this util you're able to get proper hot replacement for stores, changing code within a store will reload it properly.

To use this just export a hot store using `makeHot` rather than using `alt.createStore`.

```js
import alt from '../alt';
import makeHot from 'alt/utils/makeHot';

class TodoStore {
  static displayName = 'TodoStore'

  constructor() {
    this.todos = {};
  }
}

export default makeHot(alt, TodoStore);
```
