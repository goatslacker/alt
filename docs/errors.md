---
layout: docs
title: Errors and How to Fix
description: Errors encountered when developing a flux application with Alt
permalink: /docs/errors/
---

# Typical Alt Errors

* throw new ReferenceError('Store provided does not have a name')

If you're trying to prepare a store for bootstrap and it doesn't have a displayName property or it is blank then this error will be thrown. A store name is required in order to bootstrap. If you encounter this error then you're probably trying to prepare a non-store, or your store was missing a name in the first place.

* throw new ReferenceError('Dispatch tokens not provided')

waitFor expects some dispatch tokens (returned by the dispatcher/attached to your stores) otherwise it won't know what to wait for.

* throw new Error(`${handler} handler must be an action function`)

This is called whenever you're trying to add a non-action to success/loading/error in your data source. An action is required. This doesn't accept callbacks.

* throw new TypeError('exportPublicMethods expects a function')

Called whenever exportPublicMethods encounters a non-function passed in. It's called exportPublic**Methods** not exportPublicWhateverYouWant.

* throw new ReferenceError('Invalid action reference passed in')

Whenever you're trying to bind an action that isn't really an action. Check where you're binding the actions, you probably passed in the wrong object.

* throw new TypeError('bindAction expects a function')

If you're binding an action to anything other than a function. A function is what handles the action.

* throw new TypeError(
  `Action handler in store ${this.displayName} for ` +
  `${(symbol.id || symbol).toString()} was defined with ` +
  `two parameters. Only a single parameter is passed through the ` +
  `dispatcher, did you mean to pass in an Object instead?`
)

Called whenever you define an action handler with an arity > 1. Dispatch only dispatches a single argument through, so this is a check to make sure you're not expecting to handle multiple args in your stores. If you need to pass in more than 1 item then put it in a data structure.

* throw new ReferenceError(
  `You have multiple action handlers bound to an action: ` +
  `${action} and ${assumedEventHandler}`
)

If you are mistakenly handling the same action twice within your store. Double check your store for methods with the same name or methods that could be handling the same action like for example: onFoo and foo.

* throw new ReferenceError(
  `${methodName} defined but does not exist in ${this.displayName}`
)

If you define a listener but it doesn't actually exist in your store. Add the method to your store and this will go away.

* throw new ReferenceError(`${storeName} is not a valid store`)

Called whenever you're trying to recycle a store that does not exist. Check the recycle call.
