---
layout: docs
title: Alt and ImmutableJS
description: Flux and Immutable Stores using ImmutableJS
permalink: /docs/utils/immutable/
---

# Using Immutable Data Structures

With React's virtual DOM, immutable data structures make a lot of sense to make diffing more efficient, and immutable data structures have the additional benefit of preventing views from updating store data in a Flux architecture. For reasons like this, it makes a lot of sense to incorporate immutable data structures into your alt app, and where they come into play primarily is in your stores.

We will focus on Facebook's [Immutable](http://facebook.github.io/immutable-js/) library.

## Alt <3s Immutable

Alt has first-class support for immutable data structures via the ImmutableUtil.

Getting started is simple, you'll require the utility and pass your pre-wrapped stores to it.

```js
var alt = new Alt();
var immutable = require('alt/utils/ImmutableUtil');
```

If you're using babel with ES7 Stage 1 [decorator](https://github.com/wycats/javascript-decorators) support then this is sweet.

```js
@immutable
class TodoStore {
  static displayName = 'TodoStore'

  constructor() {
    this.state = {
      todos: Immutable.Map({})
    };
  }
}

alt.createStore(TodoStore);
```

If you don't wish to use ES7 decorators then no problem, they're just sugar for function calls. You can just pass your store into the immutable function.

```js
function TodoStore() {
  this.state = Immutable.Map({
    todos: Immutable.Map({})
  });
}
TodoStore.displayName = 'TodoStore';

alt.createStore(immutable(TodoStore));
```

A few things to note about immutable stores about this approach:

* You use `this.state` to create your state rather than assigning directly to instance properties.
* You specify your own Immutable data structure you wish to use. In this example we're using Map.

Using your ImmutableStore is a bit different from using a regular store:

```js
function TodoStore() {
  this.state = Immutable.Map({
    todos: Immutable.Map({})
  });

  this.bindListeners({
    addTodo: TodoActions.addTodo
  });
}

TodoStore.prototype.addTodo = function (todo) {
  var id = String(Math.random());
  this.setState(this.state.setIn(['todos', id], todo));
};

TodoStore.displayName = 'TodoStore';

var todoStore = alt.createStore(immutable(TodoStore));
```

* You'll be using `setState` in order to modify state within the store.
* You can access the immutable object by using the accessor of `this.state`. In this example we're using Map's `set` method to set a new key and value.

```js
todoStore.getState() // Immutable.Map
```

`getState` will return the Immutable object. This means if you're using React you can use something like `===` in `shouldComponentUpdate` to get the performance benefits.

If you wish to convert your structure to a JS object/from a JS object you can use Immutable's `toJS()` and `fromJS()` methods.

Last but not least, snapshots and bootstrapping just works when you're using this util. The data structures are serialized and deserialized automatically.

## Manually using ImmutableJS in your Stores

#### `Record`

One of the easiest ways to start getting some of the benefits of immutable is to take advantage of Immutable's [`Record`](http://facebook.github.io/immutable-js/docs/#/Record) types. This method will result in the smallest changes for existing projects. You can read more about them on Facebook's docs, but the best thing about Records is that they enable you to access values the same way you would from a normal JS object (`object.prop`). This means no changes to the view code using the immutable data and our changes only occur in store methods that return data to the view.

Here is an example of how a Record can be used:

```js
// MyStore.js
import {Record} from 'immutable';

class MyStore {
  constructor() {
    this.data = {
      prop1: 1,
      prop2: 2
    };
  }

  getImmutState() {
    var ObjectRecord = Record(this.getState());
    return new ObjectRecord();
  }
}

// MyComponent.js
import {Component} from 'react';
import MyStore from 'stores/MyStore';

class MyComponent extends Component {
  render() {
    var storeData = MyStore.getImmutState();
    return (
      <div>Prop1: {storeData.prop1}</div>
    );
  }
}
```

#### `fromJS`

Immutable has a nice helper, [`fromJS`](http://facebook.github.io/immutable-js/docs/#/fromJS) that allows us to convert JS object/arrays to immutable [`Map`s](http://facebook.github.io/immutable-js/docs/#/Map) and [`List`s](http://facebook.github.io/immutable-js/docs/#/List). This is an easy way to convert plain JS store data to immutable data structures before sending to the view. Unlike the "Record method" described above, you must remember to use getters to access data within these immutable objects.

Here is an example of using `fromJS` to return immutable data:

```js
// MyStore.js
import Immutable from 'immutable';

class MyStore {
  constructor() {
    this.data = {
      prop1: 1,
      prop2: 2
    };
  }

  getImmutState() {
    return Immutable.fromJS(this.getState());
  }
}

// MyComponent.js
import {Component} from 'react';
import MyStore from 'stores/MyStore';

class MyComponent extends Component {
  render() {
    var storeData = MyStore.getImmutState().get('data');
    return (
      <div>Prop1: {storeData.get('prop1')}</div>
    );
  }
}
```

### Using Immutable Data in Stores/Everywhere

You can also use Immutable's data structures in your stores or throughout your app. You just need to remember that you need to use getters to access the data in your views or wherever you are reading it.

Immutable provides many nice data structures like [`Map`](http://facebook.github.io/immutable-js/docs/#/Map), [`List`](http://facebook.github.io/immutable-js/docs/#/List), [`Set`](http://facebook.github.io/immutable-js/docs/#/Set), etc.

Here is a basic example of using immutable data structures in your stores, rather than just returning immutable data structures to the view from them.

```js
// MyStore.js
import {Map} from 'immutable';

class MyStore {
  constructor() {
    this.data = new Map({
      prop1: 1,
      prop2: 2
    });
  }

  onUpdateProp1(newProp1) {
    this.data = this.data.set('prop1', newProp1);
  }
}

// MyComponent.js
import {Component} from 'react';
import MyStore from 'stores/MyStore';

class MyComponent extends Component {
  render() {
    var storeData = MyStore.getState().get('data');
    return (
      <div>Prop1: {storeData.get('prop1')}</div>
    );
  }
}
```

### Serializing/Deserializing Immutable Data

If you are using immutable data and plan on taking advantage of alt's [snapshot](../takeSnapshot.md) and [bootstrap](../bootstrap.md) capabilities you must ensure that the [onSerialize](../serialization.md#onSerialize) and [onDeserialize](../serialization.md#onDeserialize) hooks handle the immutable data.

Serialize returns the data from the store to be used in a snapshot so the immutable getters will need to be used to return a plain JS object to be serialized.

Deserialize takes bootstrap data and uses it to set the state of the store. This means in order for your store to function as you initially set it up, the bootstrapped data must be converted back to immutable data structures.

Example serialize/deserialize with immutable data structures:

```js
// MyStore.js
import Immutable, {Map} from 'immutable';

class MyStore {
  constructor() {
    this.data = new Map({
      prop1: 1,
      prop2: 2
    });
  }

  static config = {
    onSerialize(state) {
      return {
        data: state.data.toJS()
      }
    },
    onDeserialize(data) {
      return Immutable.fromJS({
        prop1: data.prop1,
        prop2: data.prop2
      });
    }
  }
}
```
