---
layout: docs
title: Stores
description: The stores returned by createStore
permalink: /docs/stores/
---

# Alt Stores

These are the stores returned by [`alt.createStore`](createStore.md), they will not have the methods defined in your StoreModel because flux stores do not have direct setters. However, any `static` methods defined in your StoreModel will be transferred to this object.

**Please Note:** The behavior of `static` methods in alt stores is NOT how `static` methods behave in ES6. Normally `static` methods can be called directly off of the class without creating a new instance of said class, `MyClass.staticMethod()`. In alt, there is magic under the hood that takes the `static` methods you define on a store, and makes them accessible from the store object created by `alt.createStore`. This provides an easy way to add methods that you need to be accessible in your views. If you do not like the magic, or are a fan of being more explicit, you can use [`StoreModel#exportPublicMethods`](createStore.md#storemodelexportpublicmethods) to accomplish the same thing.

## Store#getState

> (): object

The bread and butter method of your store. This method is used to get your state out of the store. Once it is called it performs a shallow copy of your store's state, this is so you don't accidentally overwrite/mutate any of your store's state. The state is pulled from the [StoreModel](createStore.md)'s instance variables.

```js
MyStore.getState();
```

## Store#listen

> (handler: function): undefined

The listen method takes a function which will be called when the store emits a change. A change event is emitted automatically whenever a dispatch completes unless you return `false` from the action handler method defined in the StoreModel.

```js
MyStore.listen(function (state) {
  console.log(MyStore.getState() === state);
});
```

## Store#unlisten

> (handler: function): undefined

This can be used to unbind the store listener when you do not need it any more.

```js
MyStore.unlisten(referenceToTheFunctionYouUsedForListen);
```

## Store#emitChange

> (): undefined

When you manually need to emit a change event you can use this method. Useful if you're doing asynchronous operations in your store and need to emit the change event at a later time. Or if you want to emit changes from across different stores.

```js
MyStore.emitChange();
```

## Store#getEventEmitter

> (): EventEmitter

Returns the eventemitter used internally to emit changes. This affords you the flexibility to create custom events, listen to them, and emit those events within your store or across different stores.

```js
var ee = MyStore.getEventEmitter();

ee.on('foo', function () {
  console.log('hi');
});

ee.emit('foo');
```
