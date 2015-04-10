# Using Immutable Data Structures

With React's virtual DOM, immutable data structures make a lot of sense to make diffing more efficient, and immutable data structures have the additional benefit of preventing views from updating store data in a Flux architecture. For reasons like this, it makes a lot of sense to incorporate immutable data structures into your alt app, and where they come into play primarily is in your stores.

We will focus on Facebook's [Immutable](http://facebook.github.io/immutable-js/) library.

## Returning Immutable Data from Stores

We can continue to work with standard JS data structures in our stores, but return immutable data structures to our views in order to protect the unidirectional flow of data in Flux and ensure the view does not modify store data directly.

This has the benefit of requiring less code changes than using immutable data structures everywhere and may be a conceptually easier model to work with.

### `Record`

One of the lowest impact ways to start getting some of the benefits of immutable is to take advantage of Immutable's [`Record`](http://facebook.github.io/immutable-js/docs/#/Record) types. This method will result in the smallest changes for existing projects. You can read more about them on Facebook's docs, but the best thing about Records is that they enable you to access values the same way you would from a normal JS object (`object.prop`). This means no changes to the view code using the immutable data and our changes only occur in store methods that return data to the view.

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

### `fromJS`

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

## Using Immutable Data in Stores/Everywhere

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
    this.data = this.data.set(prop1: newProp1);
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

## Serializing/Deserializing Immutable Data

If you are using immutable data and plan on taking advantage of alt's [snapshot](../takeSnapshot.md) and [bootstrap](../bootstrap.md) capabilities you must ensure that [serialize](../lifecycleListeners.md#serialize) and [deserialize](../lifecycleListeners.md#deserialize) handle the immutable data.

Serialize returns the data from the store to be used in a snapshot so the immutable getters will need to be used to return a plain JS object to be serialized.

Deserialize takes bootstrap data and uses it to set the state of the store. This means in order for your store to function as you initially set it up, the bootstrapped data must be converted back to immutable data structures.

Example serialize/deserialize with immutable data structures:

```js
// MyStore.js
import Immutable, {Map} from 'immutable';

class MyStore {
  constructor() {

    this.on('serialize', () => {
      return {
        data: this.data.toJS()
      };
    });

    this.on('deserialize', (data) => {
      return Immutable.fromJS({
        prop1: data.prop1,
        prop2: data.prop2
      });
    });

    this.data = new Map({
      prop1: 1,
      prop2: 2
    });
  }
}
```
