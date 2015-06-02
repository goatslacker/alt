# alt

[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/goatslacker/alt?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

> To alter. Altered; Changed.

[![NPM version](https://badge.fury.io/js/alt.svg)](http://badge.fury.io/js/alt)
[![Build Status](https://secure.travis-ci.org/goatslacker/alt.svg?branch=master)](http://travis-ci.org/goatslacker/alt)
[![Coverage Status](https://img.shields.io/coveralls/goatslacker/alt.svg?style=flat)](https://coveralls.io/r/goatslacker/alt)
[![Dependency Status](https://david-dm.org/goatslacker/alt.svg)](https://david-dm.org/goatslacker/alt)
[![Download Count](https://img.shields.io/npm/dm/alt.svg?style=flat)](https://www.npmjs.com/package/alt)
[![JS.ORG](https://img.shields.io/badge/js.org-alt-ffb400.svg?style=flat-square)](http://js.org)

### Why you should be using Alt

* It is pure [flux](http://facebook.github.io/flux/docs/overview.html). Stores have no setters, the flow is unidirectional.
* Isomorphic and works with react-native.
* Actively maintained and being used in production.
* Extremely [flexible](#flexibility) and unopinionated in how you use flux. Create traditional singletons or use dependency injection.
* It is terse. No boilerplate.

### What does it look like?

Alt

```js
import Alt from 'alt';
export default new Alt();
```

Actions

```js
import alt from './alt';

class TodoActions {
  updateTodo(id, text) {
    this.dispatch({ id, text });
  }
}

export default alt.createActions(TodoActions);
```

Store

```js
import alt from './alt';
import TodoActions from './TodoActions'

class TodoStore {
  constructor() {
    this.bindListeners({
      updateTodo: TodoActions.updateTodo
    });

    this.todos = {};
  }

  updateTodo({ id, text }) {
    const todos = this.todos;

    todos[id] = todos[id] || {};
    todos[id].text = text;

    this.setState({ todos });
  }
}

export default alt.createStore(TodoStore, 'TodoStore');
```

## In the Wild

### Examples

* [Airbnb Airpal](https://github.com/airbnb/airpal/tree/master/src/main/resources/assets)
* [Alt Notify](https://github.com/sourcescript/alt-notify)
* [Chrome Devtool](https://github.com/goatslacker/alt-devtool)
* [Example Tests](https://github.com/jdlehman/alt-example-tests)
* [Github Example](https://github.com/RookieOne/react-alt-github-example)
* [Isomorphic Alt](https://github.com/patrickkim/iso-alt)
* [React Router Example](https://github.com/lostpebble/alt-react-router-example)
* [React Router Loopback](https://github.com/bkniffler/react-router-alt-loopback)
* [React Webpack Rails Example](https://github.com/justin808/react-webpack-rails-tutorial)
* [React Weather](https://github.com/sapegin/react-weather)
* [Shopping Cart](https://github.com/voronianski/flux-comparison/tree/master/alt)
* [Todo](https://github.com/benstokoe/alt-todo)
* [Typeahead](https://github.com/timtyrrell/alt-typeahead)
* [Maple.js Webcomponents](https://github.com/Wildhoney/Maple.js/tree/master/example/app)
* [Jumar's Tindahan](https://github.com/srph/jumars-tindahan)

### Boilerplates

* [Isomorphic Flux Boilerplate](https://github.com/iam4x/isomorphic-flux-boilerplate)
* [React + Webpack + Node](https://github.com/choonkending/react-webpack-node)

## Pure Flux + More

* Unidirectional data flow
* Stores have no setters
* Inversion of control
* Single central dispatcher
* All Stores receive the dispatch

Read about the [Principles of Flux](https://medium.com/@goatslacker/principles-of-flux-ea872bc20772).

One really cool aspect of alt is that you can save snapshots of the entire application's state at any given point in time.
This has many different use cases like:

* Time traveling through the state of your application. For fun and profit.
* Being able to debug from a broken state. Have your team send you the exact state the app was in when it crashed.
* Isomorphism. You save a snapshot that you send from the server to the client and then bootstrap back on the client.
* Rolling back to previous stable states.

There are also many [utils](/src/utils) available which interface well with alt:

* [ActionListener](/src/utils/ActionListeners.js) lets you listen to individual actions without having to create a store.
* [AltContainer](/components/AltContainer.js) a higher-order container component that is your swiss army knife for React.
* [atomic](/src/utils/atomic.js) enables your stores for atomic transactions.
* [connectToStores](/src/utils/connectToStores.js) a higher-order function that wraps your React components for store listening.
* [decorators](/src/utils/decorators.js) a collection of useful ES7 decorators for working with alt.
* [DispatchRecorder](/src/utils/DispatcherRecorder.js) lets you record all your dispatches and replay them back at a later time.
* [ImmutableUtil](/src/utils/ImmutableUtil.js) makes working with immutable-js easy.
* [IsomorphicRenderer](/src/utils/IsomorphicRenderer.js) a function that wraps your component to be isomorphic ready.
* [TimeTravel](/src/utils/TimeTravel.js) enhances your stores so they are able to travel through different states in time.
* [FinalStore](/src/utils/makeFinalStore.js) is a Store that you can listen to that only emits when all your other stores have received all their data.

## Topical Guide

Check out the [API Reference](http://alt.js.org/docs/) for full in-depth docs.  For a high-level walk-through, take a look at the [Getting Started](http://alt.js.org/guide/) guide.

First we install alt through npm. Although alt is also available through bower.

```sh
npm install alt
```

The following topical guide covers on using alt as a singleton in a traditional flux way.

We'll be referring back to this code a lot by using the `alt` variable declared.

```js
var Alt = require('alt')
var alt = new Alt()
```

### ES6

Alt is written in, and encourages ES6. It is completely optional but it is pleasant to write.

You can use the es6 transpiler that comes with react courtesy of
[jstransform](https://github.com/facebook/jstransform) or you can use one of the other popular ES6 transpilers:
[babel](https://babeljs.io/) or [traceur](https://github.com/google/traceur-compiler).

You won't need an [es6-shim](https://github.com/paulmillr/es6-shim) but you can use one for further goodies in your javascripts.

Alt does depend on ES5 features, the good news is so does React. You can use [es5-shim](https://github.com/es-shims/es5-shim)
to support those pesky old browsers.

### Creating Actions

Actions are the way you update state. They're kind of a big deal.

`alt.createActions :: Class -> Actions`

```js
class LocationActions {
  updateLocation(city) {
    this.dispatch(city)
  }
}

var locationActions = alt.createActions(LocationActions)
```

Every action contains a `dispatch` method which is what sends your data to the dispatcher for dispatching to stores. The type signature for dispatch is `dispatch :: x -> undefined`.

`alt.createActions` then returns an `Object` containing all the methods defined. You can then call your actions directly.

```js
locationActions.updateLocation('Paris')
```

Writing out actions that pass data through directly can get quite tedious so there's a shorthand for writing these what are essentially `identity` functions

```js
class LocationActions {
  constructor() {
    // for single action
    this.generateActions('updateLocation')

    // as well as for many actions
    this.generateActions('updateCity', 'updateCountry')
  }
}

var locationActions = alt.createActions(LocationActions)
```

```js
locationActions.updateLocation('Las Vegas')

locationActions.updateCity('Las Vegas')
locationActions.updateCountry('US')
```

Remember, `dispatch` only takes one argument. Therefore, if you need to pass multiple arguments into a store you can use an Object.

```js
class LocationActions {
  updateLocation(x, y) {
    this.dispatch({ x, y })
  }
}

var locationActions = alt.createActions(LocationActions)

locationActions.updateLocation('Miami', 'Florida')
```

A shorthand function created in the constructor will pass through the multiple parameters as an Array

```js
class LocationActions {
  constructor() {
    this.generateActions('updateLocation') // ['South Lake Tahoe, 'California']
  }
}

var locationActions = alt.createActions(LocationActions)

locationActions.updateLocation('South Lake Tahoe', 'California')
```

There's even a shorthand for the shorthand if all you're doing is generating a list of actions

```js
var locationActions = alt.generateActions('updateLocation', 'updateCity', 'updateCountry')
```

### Stores

Stores are where you keep a part of your application's state.

You can either define your stores as a class/constructor-prototype or as an Object.

`alt.createStore :: Class, string -> Store`

```js
class LocationStore {
  constructor() {
    this.bindAction(locationActions.updateLocation, this.onUpdateLocation)

    this.city = 'Denver'
    this.country = 'US'
  }

  onUpdateLocation(obj) {
    var { city, country } = obj
    this.city = city
    this.country = country
  }
}

var locationStore = alt.createStore(LocationStore)
```

If you're creating a store via the class/constructor method then all values assigned to `this` inside the store will accessible via `LocationStore.getState()`.

You can also use a regular old JavaScript Object to create your stores. This is more about aesthetic preference.

```js
var locationStore = alt.createStore({
  displayName: 'LocationStore',

  bindListeners: {
    onUpdateLocation: locationActions.updateLocation
  },

  state: {
    city: 'Denver',
    country: 'US'
  },

  onUpdateLocation: function(obj) {
    var { city, country } = obj
    this.setState({
      city: city,
      country: country
    })
  }
})
```

All store instances returned by `alt.createStore` will have the following methods:

`listen` is meant to be used by your View components in order to await changes made to each store. It returns a function you can use to un-listen to your store.

```js
locationStore.listen((data) => {
  console.log(data)
})
```

Alternatively, you can use the `unlisten` method. It takes in the same function you used for `listen` and unregisters it.

`getState` will return a copy of the current store's state.

```js
locationStore.getState().city === 'Denver'
```

The store exposes a `dispatchToken` that can be used with waitFor e.g. `locationStore.dispatchToken`. The store itself may be passed to `waitFor` as a shortcut.

#### Important Note

All defined methods in your Store class **will not** be available on the store instance. They are accessible within the class but not on the returned
Object via `alt.createStore`. This ensures that stores have no direct setters and the state remains mutable only through actions keeping the flow unidirectional.
If you want to attach public/static functions to your store the recommended method is to call the `exportPublicMethods` method from the constructor:

```js
class LocationStore {
  constructor() {
    this.exportPublicMethods({
      myPublicMethod: this.myPublicMethod
    });
  }

  myPublicMethod() {
    var internalInstanceState = this.getState()
    return internalInstanceState
  }
}

var locationStore = alt.createStore(LocationStore)

locationStore.myPublicMethod()
```

Another less explicit alternative is to declare the method as `static`, which will cause alt to expose the method on the store:

```js
class LocationStore {
  static myPublicMethod() {
    var internalInstanceState = this.getState()
    return internalInstanceState
  }
}
```

#### Canceling An Event

If you don't want the store to inform the view of an action make sure to return false
from the action handler methods, alt won't judge you.

```js
class LocationStore {
  constructor() {
    this.bindAction(locationActions.updateCity, this.onUpdateCity)

    this.city = 'Portland'
    this.country = 'US'
  }

  onUpdateCity(city) {
    this.city = city

    // ensure the view never finds out
    return false
  }
}

var locationStore = alt.createStore(LocationStore)
```

#### Constants

I thought you said there were no constants? Well, yeah, sort of. The thing is, they're automagically created for you.
Feel free to use them to bind your actions or use the method itself, whatever reads better in your opinion.

```js
class LocationStore {
  constructor() {
    this.bindAction(locationActions.UPDATE_CITY, this.onUpdateCity)

    this.city = ''
    this.country = ''
  }
}

var locationStore = alt.createStore(LocationStore)
```

#### Listening To Multiple Actions

```js
class LocationActions {
  constructor() {
    this.generateActions('updateCity', 'updateCountry')
  }
}

var locationActions = alt.createActions(LocationActions)
```

Using the function `bindListeners` you're able to specify which action handlers belong to which actions this way you have ultimate control over what gets called and handled.

The function `bindListeners` is the inverse of `bindAction`. `bindListeners` takes an object of action handlers as keys and actions as a value.

```js
class LocationStore {
  constructor() {
    this.bindListeners({
      handleCity: locationActions.updateCity,
      handleCountry: [locationActions.updateCountry, locationActions.updateLatLng]
    });
  }

  handleCity(data) {
    // will only be called by locationActions.updateCity()
  }

  handleCountry(data) {
    // will be called by locationActions.updateCountry() and locationActions.updateLatLng()
  }
}
```

Alternatively, you can bind all the actions inside `locationActions` using the shortcut `bindActions`

```js
class LocationStore {
  constructor() {
    this.bindActions(locationActions)

    this.city = 'Austin'
    this.country = 'US'
  }

  onUpdateCity(city) {
    this.city = city
  }

  onUpdateCountry(country) {
    this.country = country
  }
}

var locationStore = alt.createStore(LocationStore)
```

Actions who have a `onCamelCasedAction` method or an `actionName` method available in the store will be bound. In this example `locationActions.updateCity` will be handled by `onUpdateCity`. There is no difference between calling the action handler `updateCity` or `onUpdateCity` it's just a matter of aesthetic preference.

#### Managing Store Data Dependencies

`waitFor` is mostly an alias to Flux's Dispatcher waitFor. Here's an excerpt from the flux docs on what waitFor is designed for:

> As an application grows, dependencies across different stores are a near certainty. Store A will inevitably need Store B to update itself first, so that Store A can know how to update itself. We need the dispatcher to be able to invoke the callback for Store B, and finish that callback, before moving forward with Store A. To declaratively assert this dependency, a store needs to be able to say to the dispatcher, "I need to wait for Store B to finish processing this action." The dispatcher provides this functionality through its waitFor() method.

You can use waitFor like so:

```js
var dependingStore = alt.createStore(class DependingStore {
  constructor() {
    this.bindActions(someActions)
    this.data = 42
  }

  onRandom(x) {
    this.data = x
  }
})

var locationStore = alt.createStore(class LocationStore {
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

Your choice of view isn't important to alt. What's important is to know how the view consumes the store's data, and that is via event listeners.

In this example I'll be using React, but you're free to use your library of choice.

```js
var LocationComponent = React.createClass({
  getInitialState() {
    return locationStore.getState()
  },

  componentDidMount() {
    locationStore.listen(this.onChange)
  },

  componentWillUnmount() {
    locationStore.unlisten(this.onChange)
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
          Country {this.state.country}
        </p>
      </div>
    )
  }
})
```

Alt provides a free `ListenerMixin` for React so you don't have to remember to unregister your listener. You can use said mixin like this:

```js
var ListenerMixin = require('alt/mixins/ListenerMixin')

var LocationComponent = React.createClass({
  mixins: [ListenerMixin],

  getInitialState() {
    return locationStore.getState()
  },

  componentDidMount() {
    this.listenTo(locationStore, this.onChange)
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
          Country {this.state.country}
        </p>
      </div>
    )
  }
})
```

### Full Circle

Restart the loop by making your views kick off new actions.

## Alt Features

### Snapshots

`takeSnapshot :: ?...string -> string`

Snapshots are a core component of alt. The idea is that at any given point in time you can `takeSnapshot` and have your entire application's state
serialized for persistence, transferring, logging, or debugging.

Taking a snapshot is as easy as calling `alt.takeSnapshot()`. It can also take an optional number of arguments as strings which correspond to the store names you would like to include in the snapshot. This allows you to take a snapshot of a subset of your app's data.

### Bootstrapping

`bootstrap :: string -> undefined`

Bootstrapping can be done as many times as you wish, but it is common to use when initializing your application. The `alt.bootstrap()` function takes in a snapshot (JSON string)
you've saved and reloads all the state with that snapshot, no events will be emitted to your components during this process, so again, it's best to do this
on init before the view has even rendered. If you need to emit a change event, you can use `this.emitChange` inside of your `bootstrap` life cycle method.

Bootstrap is great if you're running an isomorphic app, or if you're persisting state to localstorage and then retrieving it on init later on. You can save a snapshot on the server side, send it down, and then bootstrap it back on the client.

If you're bootstrapping then it is recommended you pass in a unique Identifier, name of the class is good enough, to createStore so that it can be referenced later for bootstrapping.

```js
alt.createStore(LocationStore, 'LocationStore')
```

### Rollback

`rollback :: undefined`

If you've screwed up the state, or you just feel like rolling back you can call `alt.rollback()`. Rollback is pretty dumb in the sense
that it's not automatic in case of errors, and it only rolls back to the last saved snapshot, meaning you have to save a snapshot first in order to roll back.

### Flushing

`flush :: string`

Flush takes a snapshot of the current state and then resets all the stores back to their original initial state. This is useful if you're using alt stores as singletons and doing server side rendering because of concurrency. In this particular scenario you would load the data in via `bootstrap` and then use `flush` to take a snapshot, render the data, and reset your stores so they are ready for the next request.

### Recycling

`recycle :: ?...string -> undefined`

If you wish to reset a particular, or all, store's state back to their original initial state you would call `recycle`. Recycle takes an optional number of arguments as strings which correspond to the store's names you would like reset. If no argument is provided then all stores are reset.

### Lifecycle Methods

When bootstrapping, snapshotting, or recycling there are special methods you can assign to your store to ensure any bookeeping that needs to be done. You would place these in your store's constructor.

`bootstrap` is called after the store has been bootstrapped. Here you can add some logic to take your bootstrapped data and manipulate it.

```js
class Store {
  constructor() {
    this.on('bootstrap', () => {
      // do something here
    })
  }
}
```

`serialize` is called before the store's state is serialized. Here you can perform any final tasks you need to before the state is saved.

```js
class Store {
  constructor() {
    this.on('serialize', () => {
      // do something here
    })
  }
}
```

`init` is called when the store is initialized as well as whenever a store is recycled.

```js
class Store {
  constructor() {
    this.on('init', () => {
      // do something here
    })
  }
}
```

`rollback` is called whenever all the stores are rolled back.

```js
class Store {
  constructor() {
    this.on('rollback', () => {
      // do something here
    })
  }
}
```

`error` is called whenever an error occurs in your store during a dispatch. You can use this listener to catch errors and perform any cleanup tasks.

```js
class Store {
  constructor() {
    this.on('error', (err, actionName, payloadData, currentState) => {
      if (actionName === MyActions.fire) {
        logError(err, payloadData);
      }
    });

    this.bindListeners({
      handleFire: MyActions.fire
    });
  }

  handleFire() {
    throw new Error('Something is broken');
  }
}
```

[See all the lifecycle methods](http://alt.js.org/docs/lifecycleListeners/)

### Single Dispatcher

A single dispatcher instance is made available for listening to all events passing through. You can access this via the `dispatcher` property: `alt.dispatcher`
and listening to all events is as easy as

```js
alt.dispatcher.register(console.log.bind(console))
```

Each store has a reference to the dispatcher as well

```js
alt.createStore(class MyStore {
  constructor() {
    this.dispatcher.register(console.log.bind(console))
  }
})
```

### Flexibility

You can choose to use alt in many ways just like you'd use flux. This means your asynchronous data fetching can live in the actions, or they can live in the stores.
Stores may also be traditional singletons as in flux, or you can create an instance and have multiple store copies. This leads us into server side rendering.

### Server Side Rendering

Alt was built with isomorphism in mind. This means that you can run full flux server-side and pick back up on the client-side.

There are two options for using flux on the server:

* Keep stores as singletons, keep data loading synchronous, bootstrap, and flush.
* Create multiple instances of flux and inject the context into your app.

#### Stores as Singletons

With this approach your stores are singletons.
Any actions that load data must be synchronous, meaning you can fetch your data outside of actions and stores, and once done you fire off a synchronous action which loads
the store. Alternatively, you can gather all of your data, and once complete, you call `bootstrap()` which seeds all the stores with some initial data.

Once you've completed loading the stores with data you call `flush()` which takes a snapshot to send to the client and then resets all the stores' state back to their initial state. This allows the stores to be ready for the next server request.

#### Flux Instances

If you're afraid of singletons, or if you want to skip synchronous actions or data loading you may want to create separate instances of flux for every server request. Taking this approach means you're making the trade-off of injecting the flux instance into your application in order to retrieve the stores and use the actions. This approach is similar to how [fluxible](https://github.com/yahoo/fluxible) solves isomorphic applications. Creating a new alt instances is fairly simple.

```js
class Flux extends Alt {
  constructor() {
    super()

    this.addActions('myActions', ActionCreators)
    this.addStore('storeName', Store)
  }
}

var flux = new Flux()

// sample using react...
React.render(
  <App flux={flux} />,
  document.body
)

// retrieving stores
flux.getStore('storeName').getState()

// actions
flux.getActions('myActions')
```

#### Picking back up on the client

To help facilitate with isomorphism alt recommends you use [iso](https://github.com/goatslacker/iso), a helper function which serializes the data on the server into markup and then parses that data back into usable JavaScript on the client. Iso is a great complement to alt for a full-stack flux approach.

## Examples

* [todomvc](https://github.com/goatslacker/alt/blob/master/examples/todomvc)
* [chat](https://github.com/goatslacker/alt/tree/master/examples/chat)

## Converting a flux application to alt

1. [Importing the chat project](https://github.com/goatslacker/alt/commit/1a54de1064fe5bd252979380e47b0409d1306773).
2. [Adding alt and removing boilerplate](https://github.com/goatslacker/alt/commit/75ffdb53420dc32bdc2d99b5cf534cd0949331d8).
3. [Converting some actions](https://github.com/goatslacker/alt/commit/6f8cf22ba6b36c6ae91a794fad75473c9436b683) and [the last action](https://github.com/goatslacker/alt/commit/58ea1418ecd2af25b578cd0f4b77c3d4d8631518).
4. Converting the stores [MessageStore](https://github.com/goatslacker/alt/commit/f4c7bb4bb9027b53c380f98ed99a2e1b6ba5fa0b), [ThreadStore](https://github.com/goatslacker/alt/commit/bce2aadbb52981f934b4281b3a6244d4f2c4a7a9), and [UnreadThreadStore](https://github.com/goatslacker/alt/commit/0129baa5bd505ef26228e30cfa15a6ac4503a22d).
5. [Finishing touches](https://github.com/goatslacker/alt/commit/e05a4e02f3f13831361136a21cd757416b69b4d8).

## Differences Example

Flux has constants, the dispatcher is also pretty dumb as in it just takes what you passed in the action
and pipes it through to the store. This is completely fine but not something you should be expected to write.
The nice thing about constants is that you can easily grep for them in your application and see where
all the actions are being called, with alt you get the same benefit without having to manage them.

#### Before: Flux

```js
var keyMirror = require('keymirror')

var actionConstants = keyMirror({
  HANDLE_ACTION: null
})

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

#### After: Alt

```js
class Action {
  handleAction() {
    this.dispatch('foo')
  }
}

var action = alt.createActions(Action)
```

## TL;DR

* Isomorphic
* Pure Flux
* No constants
* No static string checking
* No giant switch statement
* Save state snapshots
* Rollbacks
* Bootstrap components on app load
* Light-weight and terse
* ES6 Syntax, code your actions and stores with classes
* Flexible
* No direct setters on stores
* Single dispatcher
* Global listening for debugging
* Small library

## License

[![MIT](https://img.shields.io/npm/l/alt.svg?style=flat)](http://josh.mit-license.org)
