---
layout: post
title: How to convert flux to alt
date: '2015-01-22'
tags:
- alt
- flux
- javascript
- es6
- react
---

This is a commit-by-commit tutorial on how to convert your flux-style code into alt. Why alt? because it's a nice and terse implementation of flux, and it allows us to write in ES6.

This is not an introduction to flux, you should already be familiar with flux. Alt knowledge is not necessary. I assume you're familiar with some ES6 although the syntax used isn't exotic by any means.

Spoiler alert: there aren't many steps, alt is flux. We'll mostly be deleting code.

In this small tutorial we'll be converting the `flux-chat` application from flux to alt. As we go along I'll be providing links to a github commit so you can read through the code.

Let's get to it, first, lets import the chat application. This is just a copy of the code.

```bash
cp -R ~/flux/examples/flux-chat .
```

Full commit is here: [Importing the chat project](https://github.com/goatslacker/alt/commit/1a54de1064fe5bd252979380e47b0409d1306773).

---

Next is my favorite part, deleting code.

```bash
rm js/constants/ChatConstants.js
rm js/dispatcher/ChatAppDispatcher.js
```

We're not going to need the constants since alt creates them for you. We also won't need the dispatcher since alt's actions work as a dispatcher.

We will also add in an `alt.js` file, this will set up our alt instance that we'll later use to create our stores and actions.


```js
// js/alt.js

var Alt = require('alt');
module.exports = new Alt();
```

Full commit is here: [Adding alt and removing boilerplate](https://github.com/goatslacker/alt/commit/75ffdb53420dc32bdc2d99b5cf534cd0949331d8).

---

Now it's time to convert the actions into alt style actions

Since the actions act as a dispatcher and the flux action creators were nothing more than thin wrappers around the dispatcher we can just dispatch directly.

Code in flux like this:

```js
clickThread: function(threadID) {
  ChatAppDispatcher.handleViewAction({
    type: ActionTypes.CLICK_THREAD,
    threadID: threadID
  });
}
```

becomes something like this in alt:

```js
clickThread: function(threadID) {
  this.dispatch(threadID)
}
```

Having a function that wraps `this.dispatch` is kind of silly. If you don't need to do anything else in your action, meaning your action just passes through a value, you can use alt's `generateActions` shorthand in the constructor.

```js
// js/actions/ChatThreadActionCreators.js

class ChatThreadActions {
  constructor() {
    this.generateActions('clickThread');
  }
}
```

This will generate a `clickThread` action which passes through its parameters.

```js
ChatThreadActions.clickThread(1); // passes through 1
ChatThreadActions.clickThread(1, 2); // passes through [1, 2]
```

We can go ahead and convert the next set of actions in `js/actions/ChatServerActionCreators.js` the same way.

One difference we can note in `ChatServerActionCreators` is the use of `ChatAppDispatcher.handleServerAction` vs `ChatAppDispatcher.handleViewAction`. In alt, since we don't write our own dispatcher, having separate actions for events is a little different. If you must know the source of an action or wish to have different behavior depending on where the action originates from you have two options:

Dispatch an Object containing the source or some sort of identifier.

```js
receiveAll: function(rawMessages) {
  this.dispatch({
    source: 'server-action',
    data: rawMessages
  });
}
```

Perform the steps necessary in the action itself.

```js
receiveAll: function(rawMessages) {
  // do things with rawMessages here
  log.debug(rawMessages);

  this.dispatch(rawMessages);
}
```

Finally, let's convert `js/actions/ChatMessageActionCreators.js`

This action depends on `MessageStore` to `getCreatedMessageData()` but `MessageStore` will later need to depend on these actions to listen to them. So we don't create a circular dependency we can abstract `getCreatedMessageData` to a util.

```js
var ChatWebAPIUtils = require('../utils/ChatWebAPIUtils');
var ChatMessageDataUtils = require('../utils/ChatMessageDataUtils');

class ChatMessageActions {
  createMessage(text) {
    this.dispatch(text);

    var message = ChatMessageDataUtils.getCreatedMessageData(text);
    ChatWebAPIUtils.createMessage(message);
  }
}
```

Full commits are here: [Converting some actions](https://github.com/goatslacker/alt/commit/6f8cf22ba6b36c6ae91a794fad75473c9436b683) and [the last action](https://github.com/goatslacker/alt/commit/58ea1418ecd2af25b578cd0f4b77c3d4d8631518).

---

Now things get interesting. Converting stores is fairly straightforward but since stores are the most complicated piece of flux they'll need a bit more effort.

The basic logistics, if you've followed a traditional flux implementation, are:

* You'll be moving your outside private state into your store as part of `this` (don't worry it'll still be private)
* You can get rid of the dispatcher with the massive switch statement converting each case into a specific method
* Setup how you'll listen to which actions

I'll talk about one store here and just link to the rest. Let's talk `MessageStore`.

MessageStore's dispatcher has three main actions it responds to `CLICK_THREAD`, `CREATE_MESSAGE`, `RECEIVE_RAW_MESSAGES`.
clickThread comes from the `ChatThreadActions`, createMessage from `ChatMessageActions`, and receiveRawMessages is actually named receiveAll and exists in `ChatServerActions`

We'll need to setup a listener for all these actions and then do something with the payload. Setting up a listener is simple. You set the listener up in the constructor of your store's class via this method `bindActions`.

```js
class MessageStore {
  constructor() {
    this.bindActions(ChatMessageActions);
    this.bindActions(ChatServerActions);
    this.bindActions(ChatThreadActions);
  }
}
```

Passing the entire actions into bindActions sets up the ability to listen to all actions provided. Or, you can cherry pick the actions you listen to via the method `bindAction`. You can use that method like so `this.bindAction(ChatMessageActions.CREATE_MESSAGE)`.

Setting up an action handler is also intuitive. You'll create a method with the same name or prefixed with `on` in the store's class. So acting on clickThread we would do something like

```js
class MessageStore {
  constructor() {
    this.bindActions(ChatMessageActions);
  }

  // this is fine
  createMessage() {
  }

  // this is ok too, but you should pick one or the other
  onCreateMessage() {
  }

  // this will not work, why are you doing this
  CREATE_MESSAGE() {
  }
}
```

If you do happen to have conflicting action names alt will let you know with a nice warm thrown `ReferenceError`.

For creating a message the MessageStore was modifying a private set of messages which were represented by an Object. We can actually move that to the constructor now and then access it in the class itself when handling the action.

```js
class MessageStore {
  constructor() {
    this.bindActions(ChatMessageActions);

    this.messages = {};
  }

  onCreateMessage(text) {
    // our ChatMessageDataUtils from before
    var message = ChatMessageDataUtils.getCreatedMessageData(text);

    // we can modify this.messages directly
    this.messages[message.id] = message;

    // we don't need to emit, stores automatically emit by default unless
    // they're told not to if you return false.
  }
}
```

The rest follows the same process.

Full commits are here: Converting the stores [MessageStore](https://github.com/goatslacker/alt/commit/f4c7bb4bb9027b53c380f98ed99a2e1b6ba5fa0b), [ThreadStore](https://github.com/goatslacker/alt/commit/bce2aadbb52981f934b4281b3a6244d4f2c4a7a9), and [UnreadThreadStore](https://github.com/goatslacker/alt/commit/0129baa5bd505ef26228e30cfa15a6ac4503a22d).

---

Last, we apply some finishing touches.

We need to change the listeners in the React components. Flux uses a make-your-own-listeners approach and the example provided uses `addChangeListener`. Alt stores come with their own listener register and calls that method `listenTo`.

Full commit here: [Finishing touches](https://github.com/goatslacker/alt/commit/e05a4e02f3f13831361136a21cd757416b69b4d8).

All done. Converting the tests are a challenge I'll leave up to you. If you have any questions feel free to open an [issue at alt](https://github.com/goatslacker/alt/issues), or ping me [@goatslacker](https://twitter.com/goatslacker).
