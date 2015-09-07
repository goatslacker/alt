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
  performSearch: {
    // remotely fetch something (required)
    remote(state) {
      return axios.get(`/search/q/${state.value}`);
    },

    // this function checks in our local cache first
    // if the value is present it'll use that instead (optional).
    local(state) {
      return state.results[state.value] ? state.results : null;
    },

    // here we setup some actions to handle our response
    loading: SearchActions.loadingResults, // (optional)
    success: SearchActions.receivedResults, // (required)
    error: SearchActions.fetchingResultsFailed, // (required)

    // should fetch has precedence over the value returned by local in determining whether remote should be called
    // in this particular example if the value is present locally it would return but still fire off the remote request (optional)
    shouldFetch(state) {
      return true
    }
  }
};
```

You then tie this to a store using the `registerAsync` function in the constructor.

```js
class SearchStore {
  constructor() {
    this.state = { value: '' };

    this.registerAsync(SearchSource);
  }
}
```

Now we'll have a few methods available for use: `SearchStore.performSearch()`, and `SearchStore.isLoading()`. We can use them in `SearchStore` by `this.getInstance().performSearch()` and `this.getInstance().isLoading()`

``` js
class SearchStore {
  constructor() {
    this.state = { value: '' };

    this.registerAsync(SearchSource);
  }
  onSearch() {
    if (!this.getInstance().isLoading()) {
      this.getInstance().performSearch();
    }
  }
}
```

## API

The data source is an object or a function that returns an object where the keys correspond to methods that will be available to the supplied Store. The values of the keys are an object that describes the behavior of calling that method.

If you are using the no-singletons approach then you'd use the function form of data sources and use the first and only parameter `alt` that is passed to retrieve the actions to listen to them.

```js
const SearchSource = (alt) => {
  return {
    performSearch: {
      return {
        loading: alt.actions.SearchActions.loadingResults
      };
    }
  }
};
```

Each function must return an object. The object may optionally implement `local` and `loading` but it must implement `remote`, `success`, and `error`.

### local(state: object, ...args: any)
_Optional_

This function is called first. If a value is returned then a change event will be emitted from the store. Omit this function to always fetch a value remotely;

### remote(state: object, ...args: any)
##### Required

This function is called whenever we need to fetch a value remotely. `remote` is only called if `local` returns null or undefined as its value, or if `shouldFetch` returns true.

Any arguments passed to your public method will be passed through to both local and remote:

```js
remote(state, one, two, three) {
}

SearchStore.performSearch(1, 2, 3);
```

### success
##### Required

Must be an action. Called whenever a value resolves.

### error
##### Required

Must be an action. Called whenever a value rejects.

### shouldFetch(state: object, ...args: any)
_Optional_

This function determines whether or not remote needs to be called, despite the value returned by `local`. If `shouldFetch` returns true, it will always get the data from `remote` and if it returns false, it will always use the value from `local`. You can omit both `shouldFetch` and `local` if you wish to always fetch remotely.

### interceptResponse(response, action, args)
_Optional_

This function overrides the value passed to the action. Response is the value returned from the promise in `remote` or `local` and null in the case of loading action, action is the action to be called, args are the arguments (as an array) passed to the data source method.

```js
interceptResponse(data, action, args) {
  return 12; // always returns 12 to loading/success/failed
}
```

### loading
_Optional_

Must be an action. This function will be called immediately prior to the `remote` function. This call is a synchronous  and is not related to the `isLoading()` method of the store.

## Decorator

There is also a decorator available for convenience for you ES7 folk out there.

```js
import { datasource } from 'alt/utils/decorators';

@datasource(SearchSource);
class SearchStore {
  constructor() {
    this.state = { value: '' };
  }
}
```
