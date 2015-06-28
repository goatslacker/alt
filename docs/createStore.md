---
layout: docs
title: Creating Stores
description: Create your stores which hold your application state
permalink: /docs/createStore/
---

# createStore

> (StoreModel: function, iden: ?string, saveStore = true: boolean, ...constructorArgs): [AltStore](stores.md)

This is a function that takes in a class of your store and returns back the singleton store. The second parameter `iden` is a string that is used as a unique identifier for serializing/deserializing your store. The name of the store comes from the class name but on production due to heavy minification it is a good idea to provide your own name to avoid collisions. The third parameter `saveStore` is to tell alt whether to save a reference to the store for later when using [bootstrap](bootstrap.md) or [snapshots](takeSnapshot.md). `constructorArgs` are passed to the `StoreModel` constructor (if `StoreModel` is a class).

# StoreModel

## StoreModel.config

The config object on your store classes allow you to configure your stores for specific behavior.

Available configuration options:

#### setState

> setState(currentState: object, nextState: object): object

`setState` is used internally by Alt to set the state. You can override this to provide your own setState implementation. Internally, setState is an alias for `Object.assign`. `setState` must return an object.

#### getState

> getState(currentState: object): mixed

`getState` receives the current state and returns a copy of it. You can override this function to provide your own implementation.

#### onSerialize

`onSerialize` is also called before the store's state is serialized. You may optionally return an object, which will be used directly as the snapshot data for the store. If you do not return anything, the default, [`MyStore#getState()`](stores.md#storegetstate) is used for the snapshot data. See the [serialization](serialization.md) for an example.

```js
class TodoStore {
  static config = {
    onSerialize: function(data) {
      // do something here
      // optional return of data to be used in snapshot
      // return mySnapshotData
    }
  }
}
```

#### onDeserialize

`onDeserialize` is called before the store's state is deserialized. This occurs whenever the store's state is being set to an existing snapshot/bootstrap data. Here you can perform any final tasks you need to before the snapshot/bootstrap data is set on the store such as mapping the data to model objects, or converting data an external source like a JSON API into a format the store expects. `onDeserialize` takes in a parameter that is an object of snapshot/bootstrap data and must return the data to be set to the store's state. If nothing is returned, then the data from the snapshot is set to the store's state. See the [serialization](serialization.md) for an example.

```js
class TodoStore {
  static config = {
    onDeserialize: function(data) {
      // do something here
      return modifiedData
    }
  }
}
```

## StoreModel#constructor

> (...args): StoreModel

The constructor of your store definition receives any constructor arguments passed through the [`createStore`](#createStore) function. All instance variables, values assigned to `this`, in any part of the StoreModel will become part of state.

## StoreModel#on

> (lifecycleMethod: string, handler: function): undefined

This method can be used to listen to [Lifecycle events](lifecycleListeners.md). Normally they would be set up in the constructor.

```js
class MyStore {
  constructor() {
    this.on('bootstrap', () => {
    });
  }
}
```

## StoreModel#bindAction

> (actionsSymbol: symbol, storeHandler: function): undefined

This method takes in an [action's symbol](actions.md#actionconstant) and a store's method defined in your StoreModel class. The store's method is then bound to that action so whenever the action [dispatches](createActions.md#actionsclassdispatch) a payload, the specified handler will receive it.

```js
class MyStore {
  constructor() {
    this.bindAction(MyActions.FOO, this.handleFoo);
  }

  handleFoo(data) {
    // do something with data
  }
}
```

## StoreModel#bindActions

> (actions: object): undefined

This is a magic method which takes in an object of action symbols and binds them to their specially named handlers which are defined in the StoreModel. An action with the name `foo` will match an action handler method defined in the StoreModel named `onFoo` or just `foo` but not both.

```js
class MyStore {
  constructor() {
    this.bindActions(MyActions);
  }

  onFoo(data) {
    // do something with data
  }
}
```

## StoreModel#bindListeners

> (listenersMap: object): undefined

`bindListeners` is the inversion of `bindAction` but in a much more convenient way. With this method you can exercise precise control over which actions you wish your store listens to and what handlers those actions are bound to. `bindListeners` accepts an object where the keys correspond to the method in your StoreModel and the values can either be an array of [action symbols](actions.md#actionconstant) or a single [action symbol](actions.md#actionconstant).

```js
class MyStore {
  constructor() {
    this.bindListeners({
      handleFoo: MyActions.FOO,
      handleBar: [MyActions.BAR, OtherActions.BAR]
    });
  }

  handleFoo(data) {
    // will only be called by MyActions.foo()
  }

  handleBar(data) {
    // will be called by MyActions.bar() and OtherActions.bar()
  }
}
```

## StoreModel#waitFor

> (dispatcherSource: mixed): undefined

`dispatcherSource` can be either a single token/source or an array of tokens/sources. `waitFor` is mostly an alias for the flux dispatcher's waitFor method. This method is used to enable dependencies between stores and signal to the dispatcher that this store needs to wait for another store to update first before it can be updated itself.

```js
class MyStore {
  onFoo(data) {

    // All of these do the same thing:
    this.waitFor(OtherStore);
    this.waitFor(OtherStore.dispatchToken);

    // You can also pass in multiple stores, these are all the same:
    this.waitFor([Store1, Store2]);
    this.waitFor([Store1.dispatchToken, Store2.dispatchToken]);
    this.waitFor(Store1, Store2);
    this.waitFor(Store1.dispatchToken, Store2.dispatchToken);

    // handle data once OtherStore is updated
  }
}
```

## StoreModel#setState

> (state = {}: function | object): undefined

`setState` is the recommended way to set state for a store. This method automatically emits a change event. `setState` also accepts a function which returns an object of the state to be set. For convenience, calls to `setState` are automatically batched as they are in React and only one change event will be emitted once the action finishes dispatching.

```js
class MyStore {
  handleFoo() {
    this.state = { foo: 0 };

    setTimeout(() => {
      // set foo to 1 and emit a change.
      this.setState({
        foo: 1
      });
    }, 100);

    // supress emitting a change.
    this.preventDefault();
  }
}
```

## StoreModel#exportPublicMethods

> (methods: object): undefined

`exportPublicMethods` is an explicit, less magical alternative to declaring public methods as type `static`. The method accepts an object where the keys correspond to a method that exists inside or outside the StoreModel object.

```js
const externalFunc = () => {
  // do something
};

class StoreBase {
  baseMethod() {
    // do something
  }
}

class Store extends StoreBase {
  constructor() {
    this.exportPublicMethods({
      baseMethod: this.baseMethod,
      ownMethod: this.ownMethod,
      externalFunc: externalFunc
    });
  }

  ownMethod() {
    // do something
  }
}
```

## StoreModel#getInstance

> (): (AltStore)[stores.md]

This method retrieves the store instance which contains any of the public methods you've exported as well as the listen/unlisten methods.

```js
class MyStore {
  constructor() {
    this.exportPublicMethods({
      accessToPublicMethod: () => 2
    });
  }

  handleFoo() {
    this.getInstance().accessToPublicMethod();
  }
}
```

## StoreModel#emitChange

> (): undefined

Shorthand for emitting a change from within a store.

```js
class MyStore {
  handleFoo() {
    setTimeout(() => {
      this.emitChange();
    }, 100);

    // supress emitting a change.
    this.preventDefault();
  }
}
```

## StoreModel#dispatcher

This is a reference to the dispatcher used by alt which is flux's own dispatcher. You may use this to listen in on all the global dispatches yourself.

```js
this.dispatcher.register(function (payload) {
  console.log(payload);
});
```

## StoreModel#alt

This is a reference to the alt instance. It can be used for getting other stores, dispatching, recycling, flushing, bootstrapping, snapshotting, etc. If you're using alt stores as [instances](altInstances.md) rather than singletons then this property is very useful.

```js
class MyStore {
  constructor() {
    const actions = this.alt.getActions('MyActions');
  }
}
```

## StoreModel#displayName

This is a reference to the store's internal name. This is either the identifier you provided to `createStore` or StoreModel's class name.

## StoreModel#otherwise

> otherwise(data, action)

This is a method you can implement in your store in order to receive all dispatches that are not currently being handled in your store explicitly via bindActions, bindAction, or bindListeners. This is similar to guards matching in Haskell.

## StoreModel#output

> output(state): {}

A method you can use to control the output of what gets sent down to `listen()` as "state".

```js
output(state) {
  return { foo: 'bar' }
}

store.listen((state) => {
  state.foo === 'bar'
})
```

## StoreModel#reduce

> reduce(state, { action, data }): {}

Another method you can implement in your store. This method receives all dispatches and the result that is returned is then set as the new state of your store. This way you can write your stores as reducers of dispatches.

## StoreModel#preventDefault

You may call this method in order to suppress a change event from being pushed. Alternatively, you can just return `false` from your action handler in your store.

## StoreModel#observe

> observe(alt): {}

A method you can implment in your stores, mostly useful when using plain objects to create a store. This method will receive the current alt instance and returns an object containing the methods/actions it'll handle.
