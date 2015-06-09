---
layout: docs
title: Actions
description: The Actions returned by createActions
permalink: /docs/actions/
---

# Actions

Each action returned by [`alt.createActions`](createActions.md) comes with a few different properties.

## action

> (...data: mixed): mixed

The action itself is a reference to the function that handles the action. The actions are fire and forget like in flux. One solution to know when an action has completed is to return a promise from the action so these calls can later be aggregated. This is a convenient approach if you're attempting to use actions on the server so you can be notified when all actions have completed and it is safe to render.

```js
MyActions.updateName('Zack');
```

## action.defer

> (data: mixed): undefined

This is a method that faciliates calling multiple actions in another actions. Since multiple actions cannot be fired until the dispatch loop has finished this helper function waits for the dispatch loop to finish and then fires off the action. It is not recommended but it is available anyway.

```js
MyActions.updateName.defer('Zack');
```

## action.CONSTANT

A constant is automatically available at creation time. This is a unique identifier for the constant that can be used for dispatching and listening.

```js
MyActions.prototype.updateName = function (name) { };
```

will become

```js
myActions.UPDATE_NAME;
```

## action.methodName

Similar to the constant.

```js
MyActions.prototype.updateName = function (name) { };
```

is

```js
myActions.updateName;
```

This allows flexibility giving you choice between using the constant form or the method form.

## action.id

Is the unique id given to the action, you can use this id to identify which dispatch is what.

## action.data

Some meta data about the action including which action group it belongs to, the name of the action, and the id.
