---
layout: docs
title: connectToStores
description: Connecting components to Alt stores
permalink: /docs/utils/connect-to-stores/
---

# Connecting components to Alt stores

`connectToStores` wraps a React component and control its props with data coming from Alt stores.

Expects the Component to have two static methods:
- `getStores()`: Should return an array of stores.
- `getPropsFromStores(props)`: Should return the props from the stores.

## Usage Examples

### ES6 Class Higher Order Component
```js
import React from 'react';
import myStore from './stores/myStore';
import connectToStores from 'alt-utils/lib/connectToStores';

class MyComponent extends React.Component {
  static getStores(props) {
    return [myStore];
  }
  
  static getPropsFromStores(props) {
    return myStore.getState();
  }
  
  render() {
    // Use this.props like normal...
  }
}

export default connectToStores(MyComponent);
```

### ES7 Decorator
```js
import React from 'react';
import myStore from './stores/myStore';
import connectToStores from 'alt-utils/lib/connectToStores';

@connectToStores
class MyComponent extends React.Component {
  static getStores(props) {
    return [myStore];
  }
  
  static getPropsFromStores(props) {
    return myStore.getState();
  }
  
  render() {
    // Use this.props like normal...
  }
}
```
