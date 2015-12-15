---
layout: docs
title: Creating Actions
description: Create your actions which will act as dispatchers
permalink: /docs/createActions/
---

# createActions

> (ActionsClass: function, exportObj: ?object, ...constructorArgs): [Actions](actions.md)

This is a function that takes in a class of actions and returns back an object with those actions defined. The second argument `exportObj` is optional and provides a way to export to a specific object. This is useful when you have circular dependencies you can either export to an app managed global or straight to `exports`. `constructorArgs` are passed to the `ActionClass` constructor.

# generateActions

> (...actions: string): [Actions](actions.md)

If all of your actions are just straight through dispatches you can shorthand generate them using this function.

```js
const MyActions = alt.generateActions('foo', 'bar', 'baz');
```

Which could then be used like this:

```js
MyActions.foo();
MyActions.bar();
MyActions.baz();
```

# ActionsClass

## ActionsClass#constructor

> (...args): ActionsClass

The constructor of your actions receives any constructor arguments passed through the [`createActions`](#createActions) function. Inside the constructor any instance properties you define will be available as actions.

## ActionsClass#generateActions

> (...actions: string): undefined

This is a method that can be used in the ActionsClass constructor to set up any actions that just pass data straight-through.

Actions like these:

```js
ActionsClass.prototype.myAction = function (data) {
  return data;
};
```

can be converted to:

```js
function ActionsClass {
  this.generateActions('myAction');
}
```

There is also a shorthand for this shorthand [available](generateActions.md) on the alt instance.
