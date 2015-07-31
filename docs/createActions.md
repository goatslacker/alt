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

## ActionsClass#dispatch

> (data: mixed): undefined

This method is available inside every action. It is unique to every action and lets the dispatcher know where each dispatch is coming from.

```js
ActionsClass.prototype.myActionFail = function (data) {
  this.dispatch(data);
};
```

You can also simply return a value from an action to dispatch:

```js
ActionsClass.prototype.myActionFail = function (data) {
  return data;
};
```

There are two exceptions to this, however:

 1. Returning `undefined` (or omitting `return` altogether) will **not** dispatch the action
 2. Returning a Promise will **not** dispatch the action

The special treatment of Promises allows the caller of the action to track its progress, and subsequent success/failure. This is useful when rendering on the server, for instance:

```js
alt.createActions({
  fetchUser(id) {
    this.dispatch(id); // this dispatches the action
    return http.get('/api/users/' + id) // this does NOT 
      .then(this.actions.fetchUserSuccess)
      .catch(this.actions.fetchUserFailure)
  },
  fetchUserSuccess: x => x, // equivalent to alt.generateActions('fetchUserSuccess')
  fetchUserFailure: x => x
});

alt.actions.fetchUser(123).then(() => {
  renderToHtml(alt); // we know user fetching has completed successfully, and it's safe to render the app
});
```

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
