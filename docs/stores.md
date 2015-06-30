---
layout: docs
title: Stores
description: The stores returned by createStore
permalink: /docs/stores/
---

# Alt Stores

These are the stores returned by [`alt.createStore`](createStore.md), they will not have the methods defined in your StoreModel because flux stores do not have direct setters. However, any `static` methods defined in your StoreModel will be transferred to this object.

**Please note:** Static methods defined on a store model are nothing more than syntactic sugar for exporting the method as a public method of your alt instance. This means that `this` will be bound to the store instance. It is recommended to explicitly export the methods in the constructor using [`StoreModel#exportPublicMethods`](createStore.md#storemodelexportpublicmethods).

## Store#getState

> (): object

The bread and butter method of your store. This method is used to get your state out of the store. Once it is called it performs a shallow copy of your store's state, this is so you don't accidentally overwrite/mutate any of your store's state. The state is pulled from the [StoreModel](createStore.md)'s instance variables.

```js
MyStore.getState();
```

## Store#listen

> (handler: function): function

The listen method takes a function which will be called when the store emits a change. A change event is emitted automatically whenever a dispatch completes unless you return `false` from the action handler method defined in the StoreModel. The `listen` method returns a function that you can use to unsubscribe to store updates.

```js
MyStore.listen(function (state) {
  assert.deepEqual(MyStore.getState(), state);
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
