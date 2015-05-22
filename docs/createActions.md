---
layout: docs
title: Creating Actions
description: Create your actions which will act as dispatchers
permalink: /docs/createActions/
---

# createActions

> (ActionsClass: function, exportObj: ?object): [Actions](actions.md)

This is a function that takes in a class of actions and returns back an object with those actions defined. The second argument `exportObj` is optional and provides a way to export to a specific object. This is useful when you have circular dependencies you can either export to an app managed global or straight to `exports`.

# generateActions

> (...actions: string): [Actions](actions.md)

If all of your actions are just straight through dispatches you can shorthand generate them using this function.

```js
var MyActions = alt.generateActions('foo', 'bar', 'baz');
```

Which could then be used like this:

```js
MyActions.foo();
MyActions.bar();
MyActions.baz();
```

# ActionsClass

## ActionsClass#constructor

> (alt: Alt): ActionsClass

The constructor of your actions receives the alt instance as its first and only argument. Inside the constructor any instance properties you define will be available as actions.

## ActionsClass#generateActions

> (...actions: string): undefined

This is a method that can be used in the ActionsClass constructor to set up any actions that just pass data straight-through.

Actions like these:

```js
ActionsClass.prototype.myAction = function (data) {
  this.dispatch(data);
};
```

can be converted to:

```js
function ActionsClass {
  this.generateActions('myAction');
}
```

There is also a shorthand for this shorthand [available](generateActions.md) on the alt instance.

## ActionsClass#dispatch

> (data: mixed): undefined

This method is available inside every action. It is a method that is unique to every action which lets the dispatcher know where each dispatch is coming from.

## ActionsClass#actions

This is an object which contains a reference to all the other actions created in your ActionsClass. You can use this for calling multiple actions within an action:

```js
ActionsClass.prototype.myActionFail = function (data) {
  this.dispatch(data);
};

ActionsClass.prototype.myAction = function (data) {
  if (someValidationFunction(data)) {
    this.dispatch(data);
  } else {
    this.actions.myActionFail(data);
  }
};
```
