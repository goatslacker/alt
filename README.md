# fux

> flux minus the l.

Fux is a [flux](http://facebook.github.io/flux/docs/overview.html) implementation where the `l` is left out.
What's the L you say?
It's probably all those [JS "constants"](https://github.com/facebook/flux/blob/master/examples/flux-chat/js/constants/ChatConstants.js),
maybe it's the [static string tossing](https://github.com/facebook/flux/blob/master/examples/flux-chat/js/dispatcher/ChatAppDispatcher.js#L39),
or it could be the [massive switch statements](https://github.com/facebook/flux/blob/master/examples/flux-chat/js/stores/MessageStore.js#L111) you're required to code.
Whatever it is they're all not here.

Fux is flux. Data flows one way. Here's an ascii chart to prove it.

```txt
╔═══════════════╗             ╔══════════════╗             ╔════════════╗
║    Actions    ║  ═══════>   ║    Stores    ║  ═══════>   ║    View    ║
╚═══════════════╝             ╚══════════════╝             ╚════════════╝
        ▲                                                        ║
        ║                                                        ║
        ╚════════════════════════════════════════════════════════╝
```

If you're in a hurry [show me the code](#examples) or [tl;dr](#tldr).

## What the flux?

For those new to Flux in general here's a short overview: Flux eschews MVC in favor of unidirectional data flow. What this means is that data
enters through your actions which are then sent to the stores whose responsibility is to manage state and dependencies of that state, and then finally
the store informs the view via event listeners so the view can update. The view then triggers more actions via user input and the flow restarts.

## Pure flux

Fux is a terse implementation of Flux that encourages unadulterated flux and all the nice ideas that come along with it:

* The Flux [dispatcher](https://github.com/facebook/flux/blob/master/src/Dispatcher.js), which
means one can only dispatch one action per cycle to ensure a predictable and simple data flow (rather than cascading actions).
The `waitFor` method is also available to help you marshall callback order.

* Extends from an event emitter, in our case [EventEmitter3](https://github.com/primus/EventEmitter3), so
one can set up the view to listen to changes on the store.

* Singleton stores making your store logic simple to follow and easy to test.

* Single dispatcher which allows one to listen to all events for debugging or fun.

## Differences

Where fux is a tad different from flux.

There is no giant switch statement you have to write in your store and this is because fux removes the burden of constants from the developer.
This has the wonderful side effect of making the custom dispatcher logic unnecessary, thus removing one of the boxes from the flow
chart (not pictured above) the dispatcher. Make no mistake, there is still a single dispatcher through which actions flow through on their merry
way to the store, in fact, you still get the benefit of being able to hook into the dispatcher to listen to all the global events for debugging, fun, or misery.
The dispatcher is just a part of fux and something you don't necessarily have to write custom code for.

These removals make the code terse and easy to follow, there is less indirection and the learning curve to grok is much lower.
Think I'm lying? [Check out an example](#differences-example).

## Additions

What's new.

One really cool aspect of fux is that you can save snapshots of the entire application's state at any given point in time.
Best of all, if you really screw the state up beyond repair you can easily rollback to the last saved snapshot.

There's also a method available that lets you bootstrap all the application's stores once, at startup, with a saved snapshot.
This is particularly useful if you're writing isomorphic applications where you can send down a snapshot of the state the server was in, then bootstrap it back on the client and continue working where the program left off.

Stores are immutable. Meaning you can't just update the store through your store instance, the objects returned by `getState` are immutable (well you can mutate them all you want but it won't affect the state inside the store), and other stores can't mutate other stores. This makes it easy to reason about how your application exactly changes and where.

Last but not least, fux is meant to work with ES6. That is we're betting you'll be writing your stores and actions
as classes. This part isn't necessary but you really should write some ES6 anyways because it's nice.

## Usage

### Installing

```sh
npm install fux
```

### Running tests

Check out the repo and then:

```sh
npm test
```

### Actually Using It

We'll be referring back to this code a lot by using the `fux` variable declared.

```js
var Fux = require('fux')
var fux = new Fux()
```

### ES Versions Disclaimer

Fux depends on ES5 features, the good news is so does React. You can use [es5-shim](https://github.com/es-shims/es5-shim)
to support those pesky old browsers.

Fux encourages ES6 features, the good news is it's pleasant to write. You can use the es6 transpiler that comes
with react courtesy of [jstransform](https://github.com/facebook/jstransform) or you can use your own favorite ES6 transpiler:
[6to5](https://6to5.org/), [es-next](https://esnext.github.io/esnext/), or [any es6 transpiler](https://www.npmjs.com/search?q=es6) you fancy.

You won't need an [es6-shim](https://github.com/paulmillr/es6-shim) but you can use one for further goodies in your javascripts.

### Creating Actions

Actions are the way you update state. They're kind of a big deal.

`fux.createActions :: Class -> Actions`

```js
class MyActions {
  updateLocation() {
    this.dispatch('Paris')
  }
}

var myActions = fux.createActions(MyActions)
```

Every action contains a `dispatch` method which is what sends your data to the dispatcher for dispatching to stores. The type signature for dispatch is `dispatch :: x -> undefined`.

`fux.createActions` then returns an `Object` containing all the methods defined. You can then call your actions directly.

```js
myActions.updateLocation()
```

You can also define actions that take a parameter like so

```js
class MyActions {
  updateLocation(x) {
    this.dispatch(x)
  }
}

var myActions = fux.createActions(MyActions)
```

```js
myActions.updateLocation('San Francisco')
```

Writing out actions that pass data through directly can get quite tedious so there's a shorthand for writing these what are essentially `identity` functions

```js
class MyActions {
  constructor() {
    // for single action
    this.generateAction('updateLocation')

    // for many actions
    this.generateActions('updateCity', 'updateState', 'updateCountry')
  }
}

var myActions = fux.createActions(MyActions)
```

```js
myActions.updateLocation('Las Vegas')

myActions.updateCity('Las Vegas')
myActions.updateState('Nevada')
myActions.updateCountry('US')
```

Remember, `dispatch` only takes one argument. Therefore, if you need to pass multiple arguments into a store you can use an Object.

```js
class MyActions {
  updateLocation(x, y) {
    this.dispatch({ x, y })
  }
}

var myActions = fux.createActions(MyActions)

myActions.updateLocation('Miami', 'Florida')
```

An shorthand function created in the constructor will pass through the multiple parameters as an Array

```js
class MyActions {
  constructor() {
    this.updateLocation = true // ['South Lake Tahoe, 'California']
  }
}

var myActions = fux.createActions(MyActions)

myActions.updateLocation('South Lake Tahoe', 'California')
```

### Stores

Stores are where you keep a part of your application's state. It's a singleton, holds your data, and is immutable.

`fux.createStore :: Class -> Store`

```js
class MyStore {
  constructor() {
    this.bindAction(myActions.updateLocation, this.onUpdateLocation)

    this.city = 'Denver'
    this.state = 'Colorado'
  }

  onUpdateLocation(obj) {
    var { city, state } = obj
    this.city = city
    this.state = state
  }
}

var myStore = fux.createStore(MyStore)
```

Stores require a constructor, that's where you'll set your initial state and bind any actions to the methods that update the state, the `action handlers` if you will. All store instances returned by `fux.createStore` will have the following methods:

#### createStore API

##### listen :: Function -> undefined

`listen` is meant to be used by your View components in order to await changes made to each store.

```js
myStore.listen((data) => {
  console.log(data)
})
```

##### unlisten :: Function -> undefined

`unlisten` is a clean up method. It takes in the same function you used for `listen` and unregisters it.

##### getState :: State

`getState` will return a copy of your the current store's state.

```js
myStore.getState().city === 'Denver'
```

##### dispatcherToken

A token that can be used with waitFor.

#### Disclaimer

All defined methods in your Store class **will not** be available on the store instance. They are accessible within the class but not on the returned
Object via `fux.createStore`. This ensures that stores have no direct setters and the state remains mutable only through actions keeping the flow unidirectional.
If you want to attach public/static functions to your store you may do so after it's generated.

```js
myStore.myMethod = () => {
  return true
}
```

#### Canceling An Event

If you don't want the store to inform the view of an action make sure to return false
from the action handler methods, fux won't judge you.

```js
class MyStore {
  constructor() {
    this.bindAction(myActions.updateCity, this.onUpdateCity)

    this.city = 'Portland'
    this.state = 'Oregon'
  }

  onUpdateCity(city) {
    this.city = city

    // ensure the view never finds out
    return false
  }
}

var myStore = fux.createStore(MyStore)
```

#### Constants

I thought you said there were no constants? Well, yeah, sort of. The thing is, they're automagically created for you.
Feel free to use them to bind your actions or use the method itself, whatever reads better in your opinion.

```js
class MyStore {
  constructor() {
    this.bindAction(myActions.UPDATE_STATE, this.onUpdateState)

    this.city = ''
    this.state = ''
  }
}

var myStore = fux.createStore(MyStore)
```

Constants are automagically generated for you so feel free to use them to bind your actions or use the method itself, whatever reads better in your opinion.

#### Listening To Multiple Actions

In the ~~rare~~ very common case of binding multiple actions, calling `bindAction` with each
handler is not anyone's idea of fun.

```js
class MyActions {
  constructor() {
    this.generateActions('updateCity', 'updateState')
  }
}

var myActions = fux.createActions(MyActions)
```

You can bind all the actions inside `myActions` using the shortcut `bindActions`

```js
class MyStore {
  constructor() {
    this.bindActions(myActions)

    this.city = 'Austin'
    this.state = 'Texas'
  }

  onUpdateCity(city) {
    this.city = city
  }

  onUpdateState(state) {
    this.state = state
  }
}

var myStore = fux.createStore(MyStore)
```

Actions who have a `onCamelCasedAction` method or an `actionName` method available in the store will be bound.

#### Methods available in Stores

Thus brings us to our final store point. Stores have the following available methods internally:

* `bindAction :: ActionsMethod, StoreMethod -> undefined`
* `bindActions :: Actions`
* `waitFor :: DispatcherToken | [DispatcherTokens]`

`waitFor` is mostly an alias to Flux's Dispatcher waitFor. Here's an excerpt from the flux docs on what waitFor is designed for:

> As an application grows, dependencies across different stores are a near certainty. Store A will inevitably need Store B to update itself first, so that Store A can know how to update itself. We need the dispatcher to be able to invoke the callback for Store B, and finish that callback, before moving forward with Store A. To declaratively assert this dependency, a store needs to be able to say to the dispatcher, "I need to wait for Store B to finish processing this action." The dispatcher provides this functionality through its waitFor() method.

You can use waitFor like so:

```js
var dependingStore = fux.createStore(class DependingStore {
  constructor() {
    this.bindActions(someActions)
    this.data = 42
  }

  onRandom(x) {
    this.data = x
  }
})

var myStore = fux.createStore(class MyStore {
  constructor() {
    this.bindActions(someOtherActions)

    this.syncedData = Date.now()
  }

  onThings() {
    this.waitFor(dependingStore.dispatchToken)
    this.syncedData = dependingStore.getState().data
  }
})
```

You can also `waitFor` multiple stores by passing in an Array: `this.waitFor([store1.dispatchToken, store2.dispatchToken])`

### Views

Your choice of view isn't important to fux. What's important is to know how the view consumes the store's data, and that is via event listeners.

In this example I'll be using React, but you're free to use your library of choice.

```js
var LocationComponent = React.createClass({
  getInitialState() {
    return myStore.getState()
  },

  componentWillMount() {
    myStore.listen(this.onChange)
  },

  componentWillUnmount() {
    myStore.unlisten(this.onChange)
  },

  onChange() {
    this.setState(this.getInitialState())
  },

  render() {
    return (
      <div>
        <p>
          City {this.state.city}
        </p>
        <p>
          State {this.state.state}
        </p>
      </div>
    )
  }
})
```

Fux provides a free `ListenerMixin` for React so you don't have to remember to unregister your listener. You can use said mixin like this:

```js
var ListenerMixin = require('fux/ListenerMixin')

var LocationComponent = React.createClass({
  mixins: [ListenerMixin],

  getInitialState() {
    return myStore.getState()
  },

  componentWillMount() {
    this.listenTo(myStore, this.onChange)
  },

  onChange() {
    this.setState(this.getInitialState())
  },

  render() {
    return (
      <div>
        <p>
          City {this.state.city}
        </p>
        <p>
          State {this.state.state}
        </p>
      </div>
    )
  }
})
```

### Full Circle

Restart the loop by making your views kick off new actions.

## Fux Features

### Snapshots

`takeSnapshot :: String`

Snapshots are a core component of fux. The idea is that at any given point in time you can `takeSnapshot` and have your entire application's state
serialized for persistence, transfering, logging, or debugging.

Taking a snapshot is as easy as calling `fux.takeSnapshot()`.

### Bootstrapping

`bootstrap :: String -> undefined`

Bootstrapping can only be done once, and usually is best to do when initializing your application. The `fux.bootstrap()` function takes in a snapshot
you've saved and reloads all the state with that snapshot, no events will be emitted to your components during this process, so again, it's best to do this
on init before the view has even rendered.

Bootstrap is great if you're running an isomorphic app, or if you're persisting state to localstorage and then retrieving it on init later on. You can save a snapshot on the server side, send it down, and then bootstrap it back on the client.

### Rollback

`rollback :: undefined`

If you've screwed up the state, or you just feel like rolling back you can call `fux.rollback()`. Rollback is pretty dumb in the sense
that it's not automatic in case of errors, and it only rolls back to the last saved snapshot, meaning you have to save a snapshot first in order to roll back.

### Life Cycle Methods

When bootstrapping or snapshotting there are special methods you can assign to your store to ensure any bookeeping that needs to be done.

`onBootstrap()` is a method which is called after the store has been bootstrapped. Here you can add some logic to take your bootstrapped data and manipulate it.

`onTakeSnapshot()` is a method which is called before the store's state is serialized. Here you can perform any final tasks you need to before the state is saved.

### Single Dispatcher

A single dispatcher instance is made available for listening to all events passing through. You can access this via the `dispatcher` property: `fux.dispatcher`
and listening to all events is as easy as

```js
fux.dispatcher.register(console.log)
```

## Examples

* [todomvc](https://github.com/goatslacker/fux/blob/master/examples/todomvc)

## Differences Example

Flux has constants, the dispatcher is also pretty dumb as in it just takes what you passed in the action
and pipes it through to the store. This is completely fine but not something you should be expected to write.
The nice thing about constants is that you can easily grep for them in your application and see where
all the actions are being called, with fux you get the same benefit without having to manage them.

#### Before: Flux

```js
var action = {
  foo() {
    AppDispatcher.handleAction({ type: actionConstants.HANDLE_ACTION, data: 'foo' })
  }
}

var AppDispatcher = Object.assign(new Dispatcher(), {
  handleAction(payload) {
    this.dispatch(payload)
  }
})
```

#### After: Fux

```js
class Action {
  handleAction() {
    this.dispatch('foo')
  }
}

var action = fux.createActions(Action)
```

## Other Flux Implementations

[Reflux](https://github.com/spoike/refluxjs) is a fun to work with and terse "flux implementation".
It's not actually flux, but it's still a pleasure to use. Fux brings the terseness of reflux to actual flux.

[Fluxxor](http://fluxxor.com/) is a neat implementation of flux with good documentation and examples.

[...others](https://www.npmjs.com/search?q=flux) there are actually plenty of flux implementations.

## TL;DR

* Pure Flux
* No Constants
* No static string checking
* No giant switch statement
* Save state snapshots
* Rollbacks
* Bootstrap components on app load
* Isomorphic
* Light-weight and terse
* ES6 Syntax, code your actions and stores with classes
* Immutable stores
* Single dispatcher
* Global listening for debugging

## License

[MIT](http://josh.mit-license.org/)
