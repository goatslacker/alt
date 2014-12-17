# fux

> flux minus the l.

Fux is a [flux](http://facebook.github.io/flux/docs/overview.html) implementation where the `l` is left out.
What's the L you say?
It's probably all those [JS "constants"](https://github.com/facebook/flux/blob/master/examples/flux-chat/js/constants/ChatConstants.js),
maybe it's the [static string tossing](https://github.com/facebook/flux/blob/master/examples/flux-chat/js/dispatcher/ChatAppDispatcher.js#L39),
or it could be the [massive switch statements](https://github.com/facebook/flux/blob/master/examples/flux-chat/js/stores/MessageStore.js#L111) you're required to code.
Whatever it is they're all not here.

Fux is a flux. Data flows one way. Here's an ascii chart to prove it.

```txt
╔═══════════════╗             ╔══════════════╗             ╔════════════╗
║    Actions    ║  ═══════>   ║    Stores    ║  ═══════>   ║    View    ║
╚═══════════════╝             ╚══════════════╝             ╚════════════╝
        ▲                                                        ║
        ║                                                        ║
        ╚════════════════════════════════════════════════════════╝
```

If you're in a hurry [show me the code](#the-code) or [tl;dr](#tldr).

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

There is no giant switch statement in the store and this is because constants have been removed.
This has the wonderful side effect of making the custom dispatcher logic unnecessary for the developer to handle.

This actually removes one of the boxes from the flow chart (not pictured above) the dispatcher.
Actions act as dispatchers where you can send data directly to the store, all without losing the benefit of
being able to hook into the dispatcher if needed.

These removals make the code lightweight and the barrier of entry to developing a new flux app really low. Think I'm lying? [Check out an example](#differences-example).

## Additions

On really cool aspect of fux is that you can save snapshots of the entire application state at any given point in time, and if you really screw the state up beyond repair you can easily rollback to the last saved snapshot.

There's also a method available that lets you bootstrap all the application's stores once, at startup, with a saved snapshot.
This is particularly useful if you're writing isomorphic applications where you can send down a snapshot of the state the server was in, then bootstrap it back on the client and continue working where the program left off.

Stores are immutable. Meaning you can't just update the store through your store instance, the objects returned by `getState` are immutable (well you can mutate them all you want but it won't affect the state inside the store), and other stores can't mutate other stores. This makes it easy to reason about how your application exactly changes and where.

Fux is also meant to work with ES6. That is we're betting you'll be writing your stores and actions
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
var myActions = fux.createActions(class MyActions {
  updateLocation() {
    this.dispatch('Paris')
  }
})
```

Every action contains a `dispatch` method which is what sends your data to the dispatcher for dispatching to stores. The type signature for dispatch is `dispatch :: x -> undefined`.

`fux.createActions` then returns an `Object` containing all the methods defined. You can then call your actions directly.

```js
myActions.updateLocation()
```

You can also define actions that take a parameter like so

```js
var myActions = fux.createActions(class MyActions {
  updateLocation(x) {
    this.dispatch(x)
  }
})
```

```js
myActions.updateLocation('San Francisco')
```

Remember, `dispatch` only takes one argument. Therefore, if you need to pass multiple arguments into a store you can use an Object.

```js
var myActions = fux.createActions(class MyActions {
  updateLocation(x, y) {
    this.dispatch({ x, y })
  }
})

myActions.updateLocation('Miami', 'Florida')
```

### Stores

Stores are where you keep a part of your application's state. It's a singleton, holds your data, and is immutable.

`fux.createStore :: Class -> Store`

```js
var myStore = fux.createStore(class MyStore {
  constructor() {
    this.bindAction(myActions.updateLocation, this.onUpdateLocation)

    this.city = 'Denver'
    this.state = 'Colorado'
  }

  onUpdateLocation(city, state) {
    this.city = city
    this.state = state
  }
})
```

Stores require a constructor, that's where you'll set your initial state and bind any actions to methods that update the state. All store instances returned by
`fux.createStore` will have the following methods:

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
store via `fux.createStore`. This ensures that stores have no direct setters and the state remains mutable only through actions keeping the flow unidirectional.
If you want to attach functions to your store you may do so after it's generated.

```js
myStore.myMethod = () => {
  return true
}
```

#### Canceling An Event

If you don't want the store to inform the view of an action make sure to return false
from the action handler methods, fux won't judge you.

```js
var myStore = fux.createStore(class MyStore {
  constructor() {
    this.bindAction(myActions.updateLocation, this.onUpdateLocation)

    this.city = 'Portland'
    this.state = 'Oregon'
  }

  onUpdateLocation(city, state) {
    this.city = city
    this.state = state

    // ensure the view never finds out
    return false
  }
})
```

#### Listening To Multiple Actions

In the ~~rare~~ very common case of binding multiple actions, calling `bindAction` with each
handler is really no better than having to create a bunch of constants.

Speaking of constants...

```js
var myStore = fux.createStore(class MyStore {
  constructor() {
    // I thought you said constants were a thing of the past?
    this.bindAction(myActions.UPDATE_LOCATION, this.onUpdateLocation)

    this.city = 'Boise'
    this.state = 'Idaho'
  }
})
```

Constants are automagically generated for you so feel free to use them to bind your actions or use the method itself, whatever reads better in your opinion.

Back to the topic of binding multiple actions. Say you have:

```js
var myActions = fux.createActions(class MyActions {
  constructor() {
    this.updateCity = true
    this.updateState = true
  }
})
```

You can bind all the actions inside `myActions` using the shortcut `bindActions`

```js
var myStore = fux.createStore(class MyStore {
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
})
```

Actions who have a `onCamelCasedAction` method or an `actionName` method available in the store will be bound.

#### Methods available in Stores

Thus brings us to our final store point. Stores have the following available methods:

* `bindAction :: ActionsMethod, StoreMethod -> undefined`
* `bindActions :: Actions`
* `waitFor :: DispatcherToken | [DispatcherTokens]`

`waitFor` is exactly like Flux's Dispatcher waitFor. Here's an excerpt from the flux docs on what waitFor is designed for:

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

### Views

Views aren't important to fux, but they are to flux, and probably your application too if you want to ever show all your state.
What's important is how the view consumes the store's data, and that is via event listeners.

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

> mention store API: emitChange, listen, unlisten, getState

### Bootstrapping

> You can only bootstrap once, so you can't use it to set state.

### Rollback

> Rollbacks are user initiated and lazy.

### Life Cycle methods

> talk about the special onBootstrap and onTakeSnapshot methods

### Single Dispatcher

A single dispatcher instance is made available for listening to all events passing through. You can access this via the `dispatcher` property: `fux.dispatcher`
and listening to all events is as easy as

```js
fux.dispatcher.register(console.log)
```

## Examples

... XXX link to examples

## TodoFlux

A partial [todomvc](https://github.com/facebook/flux/tree/master/examples/flux-todomvc) example
written using fux.

```js
var Fux = require('fux')
var ListenerMixin = require('fux/ListenerMixin')
var fux = new Fux()

var todoActions = fux.createActions(class TodoActions {
  addTodo(text) {
    this.dispatch(text)
  }
})

var todoStore = fux.createStore(class TodoStore {
  constructor() {
    this.bindAction(todoActions.addTodo, this.onAddTodo)

    this.todos = []
  }

  onAddTodo(text) {
    this.todos.push(text)
  }
})

var TodosController = React.createClass({
  mixins: [ListenerMixin],

  getInitialState() {
    return todoStore.getState()
  },

  componentWillMount() {
    this.listenTo(todoStore, this.onChange)
  },

  onChange() {
    this.setState(this.getInitialState())
  },

  render() {
    return <Todos todos={this.state.todos} />
  }
})

var Todos = React.createClass({
  addTodo() {
    todoActions.addTodo('test')
  },

  render() {
    return (
      <div>
        <ul>
          {this.props.todos.map((todo, index) => {
            return <li key={index}>Todo {index}</li>
          })}
        </ul>
        <button onClick={this.addTodo}>Add Todo</button>
      </div>
    )
  }
})

React.render(<TodosController />, document.body)
```

## Differences Example

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
var action = fux.createActions(class Action {
  handleAction() {
    this.dispatch('foo')
  }
})
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
