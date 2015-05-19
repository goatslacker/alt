---
layout: docs
title: Handling Async
description: Data Sources for async data in Alt Stores
permalink: /docs/async/
---

# Data Sources

A common question for newcomers to flux is "where do I put my async code?". While kicking off the request in your actions, stores, or a util class is ok, the most important thing is how you handle your request. Handling a request should only be done via actions, this ensures that it goes through the dispatcher and that the data flow remains uni-directional.

Alt has this concept called data sources which set up an easy way for you to handle your CRUD operations while keeping best practices. We prefer that you tie these pieces of logic to your stores. Why? Because sometimes you need partial state data in order to compose a request. The data source enforces that you handle the asynchronous responses through actions, and gives you access to store state so you can compose your request.

Important note: data sources work with Promises. Make sure you have a Promise polyfill loaded in the browser if you plan on shipping to browsers that don't natively support Promises.

### What it looks like

```js
// sources/SearchSource.js

const SearchSource = {
  performSearch(context) {
    return {
      // remotely fetch something
      remote(state) {
        return axios.get(`/search/q/${state.value}`);
      },

      // this function checks in our local cache first
      // if the value is present it'll use that instead.
      local(state) {
        return state.results[state.value] ? state.results : null;
      },

      // here we setup some actions to handle our response
      loading: SearchActions.loadingResults,
      success: SearchActions.receivedResults,
      error: SearchActions.fetchingResultsFailed
    };
  }
};
```

You then tie this to a store using the `exportAsync` function in the constructor.

```js
class SearchStore {
  constructor() {
    this.value = '';

    this.exportAsync(SearchSource);
  }
}
```

Now we'll have a few methods available for use: `SearchStore.performSearch()`, `SearchStore.isLoading()`, and `SearchStore.hasError()`.

## API

The data source is an object where the keys correspond to methods that will be available to the supplied Store. The values of the keys are functions, each function is called with the store's context as its only argument. If you are using the no-singletons approach then you'd use `context.alt` to retrieve the actions to listen to them.

```js
const SearchSource = {
  performSearch(context) {
    return {
      loading: context.alt.actions.SearchActions.loadingResults
    };
  }
};
```

Each function must return an object. The object may optionally implement `local` and `loading` but it must implement `remote`, `success`, and `error`.

### local(state: object, ...args: any)

This function is called first. If a value is returned then it'll be passed to the success or error action handler.

### remote(state: object, ...args: any)

This function is called whenever we need to fetch a value remotely. This is determined if `local` returns a falsy value.

Any arguments passed to your public method will be passed through to both local and remote:

```js
remote(state, one, two, three) {
}

SearchStore.performSearch(1, 2, 3);
```

### loading

Must be an action. Called before `remote` is called.

### success

Must be an action. Called whenever a value resolves.

### error

Must be an action. Called whenever a value rejects.

## Decorator

There is also a decorator available for convenience for you ES7 folk out there.

```js
import { datasource } from 'alt/utils/decorators';

@datasource(SearchSource);
class SearchStore {
  constructor() {
    this.value = '';
  }
}
```
