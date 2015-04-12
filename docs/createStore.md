---
layout: docs
title: Creating Stores
description: Create your stores which hold your application state
permalink: /docs/createStore/
---

# createStore

> (StoreModel: function, iden: ?string, saveStore = true: boolean): [AltStore](stores.md)

This is a function that takes in a class of your store and returns back the singleton store. The second parameter `iden` is a string that is used as a unique identifier for serializing/deserializing your store. The name of the store comes from the class name but on production due to heavy minification it is a good idea to provide your own name to avoid collisions. The third parameter `saveStore` is to tell alt whether to save a reference to the store for later when using [bootstrap](bootstrap.md) or [snapshots](takeSnapshot.md).

# StoreModel

## StoreModel#constructor

> (alt: Alt): StoreModel

The constructor of your store definition receieves the alt instance as its first and only argument. All instance variables, values assigned to `this`, in any part of the StoreModel will become part of state.

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

This method retrieves the store instance which contains other methods like `getEventEmitter()`, `getState()`, and `emitChange()`.

```js
class MyStore {
  handleFoo() {

    setTimeout(() => {
      // emit change later via the store instance.
      this.getInstance().emitChange();
    }, 100);

    // supress emitting a change.
    return false;
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
    return false;
  }
}
```

## StoreModel#setState

> (state = {}: object): false

`setState` is syntactic sugar for setting state. This method automatically emits a change event. This can be particularly useful when performing async in your stores when you wish to update the state and emit a change event all in one.

```js
class MyStore {
  handleFoo() {
    this.foo = 0;

    setTimeout(() => {
      // set foo to 1 and emit a change.
      this.setState({
        foo: 1
      });
    }, 100);

    // supress emitting a change.
    return false;
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
    var actions = this.alt.getActions('MyActions');
  }
}
```

## StoreModel#_storeName

This is a reference to the store's internal name. This is either the identifier you provided to `createStore` or StoreModel's class name.
