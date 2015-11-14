# Changelog

## 0.17.9

### Changed

* Fixes multiple actions from registering to the same handler [commit](https://github.com/goatslacker/alt/commit/85226f7).

## 0.17.8

### Changed

* Fix FSA dispatching [commit](https://github.com/goatslacker/alt/commit/ec3ccd8)
* Stores created using an Object will now have a config. This gets rid of this [issue](https://github.com/goatslacker/alt-devtool/issues/20). [commit](https://github.com/goatslacker/alt/commit/d72eb9d)

## 0.17.7

### Changed

* isPojo renamed to isMutableObject. [commit](https://github.com/goatslacker/alt/commit/69c773e)

- This now checks if an object is frozen or not before attempting to delete keys from it.

## 0.17.6

### Added

* Can dispatch FSA actions directly through alt.dispatch. [commit](https://github.com/goatslacker/alt/commit/243828c)

## 0.17.5

### Added

* Makes alt FSA compliant. [commit](https://github.com/goatslacker/alt/commit/f4818db)

### Changed

* Removes the warning if nothing is dispatched. [commit](https://github.com/goatslacker/alt/commit/9dd8e09)
* Fix regression for not setting state if reduce returns undefined. [commit](https://github.com/goatslacker/alt/commit/cebd8e8)

## 0.17.4

### Added

* Allow dispatching action creators. [commit](https://github.com/goatslacker/alt/commit/cd54ed1)
* Warn if nothing is dispatched. [commit](https://github.com/goatslacker/alt/commit/3430d56)
* Pass store state to bootstrap lifecycle. [commit](https://github.com/goatslacker/alt/commit/b1a3f7a)
* setState now handles values. [commit](https://github.com/goatslacker/alt/commit/f6be9c3)
* ImmutableUtil supports bootstrapping Records and more. [commit](https://github.com/goatslacker/alt/commit/b1d6622)

### Changed

* contextTypes are now copied onto connectToStores. [commit](https://github.com/goatslacker/alt/commit/74f033a)
* better typescript definitions. [commit](https://github.com/goatslacker/alt/commit/2ef5792)

## 0.17.3

### Changed

* Moved hot load delete of stores up to remove the warning shown in console. [commit](https://github.com/goatslacker/alt/commit/d3befc5)

## 0.17.2

### Added

* Add `onMount` handler for AltContainer. [commit](https://github.com/goatslacker/alt/commit/189e009)

* Expose a reduce function for every store by default. [commit](https://github.com/goatslacker/alt/commit/ab19ceb)

  If you're using reducers then this allows you to not ever use waitFor since you can just call store.reduce(store.getState(), payload) in order to derive data.

* Allow values for store state. [commit](https://github.com/goatslacker/alt/commit/5e18e9c)

  this.state can now be any valid JS value rather than always being an object.

* Add some reducer utils. [commit](https://github.com/goatslacker/alt/commit/f672938)

  These reducer utils can be used for easily working with reducer only stores


### Changed

* Return value from sources local method. [commit](https://github.com/goatslacker/alt/commit/3e8bb8a)

* Delete stores on hot reload. [commit](https://github.com/goatslacker/alt/commit/8485eee)

  Working with react hot loader is now simpler.

* Make fp tools faster by pulling directly from state. [commit](https://github.com/goatslacker/alt/commit/2b5adb3)

* Throw if listen does not get a function. [commit](https://github.com/goatslacker/alt/commit/193206f)

* Change the connectToStores displayName. [commit](https://github.com/goatslacker/alt/commit/b2c0b31)

* Allow listening to same action with multiple methods. [commit](https://github.com/goatslacker/alt/commit/a57d062)


## 0.17.1

### Changed

* Returning a promise from action no longer makes the action dispatch by default. [commit](https://github.com/goatslacker/alt/commit/bcda4fb)

## 0.17.0

### Breaking Changes

* Removed Symbol

  **Upgrade Guide**

  - Remove all references to Symbol, Symbol.keyFor, etc.
  - Get access to the action's unique id via `myAction.id`

* Removed `getEventEmitter()`

  **Upgrade Guide**

  - You can no longer access the internal event emitter to dispatch your own custom events. This is usually an anti-pattern.
  - If you still need this behavior you can create your own event emitter in your store.

```js
class TodoStore {
  constructor() {
    this.eventEmitter = new EventEmitter()

    this.exportPublicMethods({
      getEventEmitter: () => this.eventEmitter
    });
  }
}
```

* Removed `_storeName`.

  **Upgrade Guide**

  - `_storeName` was an internal property to the store where the store's name was kept.
  - You can now use `displayName` instead which is a public API.

* Removed `stateKey`. [commit](https://github.com/goatslacker/alt/commit/40830ea)

  **Upgrade Guide**

  - A `stateKey` property was configurable on stores as well as app level.
  - This has now been removed.
  - This key was mostly used so you can use the react-like API of `this.state`, now this is being supported first-class.

```js
// old behavior
class MyStore {
  static config = { stateKey = 'state' }

  constructor() {
    this.state = {}
  }
}
```

Now you can just use `this.state` directly. If it exists it'll be picked up.

```js
// old behavior
class MyStore {
  constructor() {
    this.state = {}
  }
}
```

The old behavior of assigning state directly as instance properties will continue to be supported. However, this new behavior will be favored in the docs.

* Render.toString/toStaticMarkup now return an object rather than a string of html.

  **Note: Render API is still in flux**

  **Upgrade Guide**

```js
// old
Render.toString(App, props).then(markup => console.log(markup))

// new
Render.toString(App, props).then(obj => console.log(obj.html))
```

* Render.toDOM no longer locks by default.

  **Upgrade Guide**

  - Render.toDOM used to "lock" meaning it wouldn't perform the fetches on the client when it rendered.
  - Now this is configurable and off by default in case you want to use Render to render client side only.

```js
// old
Render.toDOM(App, props, document.getElementById('react-root'))

// new
// the `true` is to not fetch client side.
Render.toDOM(App, props, document.getElementById('react-root'), true)
```

### Added

* A sweet new DispatcherDebugger react component which lets you debug your flux application on the browser. [commit](https://github.com/goatslacker/alt/commit/ad9c2bb)
* You may now return from actions directly in order to dispatch, no need to call `this.dispatch`.
* connectToStores can now be used where you specify the methods at the callsite. [commit](https://github.com/goatslacker/alt/commit/a117e30)
* statics addon lets you add your static methods to components that have been connected. [commit](https://github.com/goatslacker/alt/commit/537ec26)
* TypeScript definitions!. [commit](https://github.com/goatslacker/alt/commit/d4ce63a)

### Changed

* Made the promise resolution to then(success, failure) so errors will be properly rejected. [commit](https://github.com/goatslacker/alt/commit/6f6bb05)

## 0.16.10

### Added

* componentDidConnect for connectToStores. Allows you to specify data fetching in there. [commit](https://github.com/goatslacker/alt/commit/464bb26)

* Hot reload of stores using webpack. [commit](https://github.com/goatslacker/alt/commit/66c875c)

### Changed

* Reversed the then/catch in the promise resolution for data sources so the catch only handles data source failures. [commit](https://github.com/goatslacker/alt/commit/8e1418b)

* Throw when passing `undefined` to store.unlisten. [commit](https://github.com/goatslacker/alt/commit/4998c6a)

## 0.16.9

### Added

* `preventDefault` to stop a store from emitting a change. [commit](https://github.com/goatslacker/alt/commit/1635589)

* `observe()` a way for POJOs to observe for changes. [commit](https://github.com/goatslacker/alt/commit/1635589)

* `otherwise()` listen to all dispatches that have not been bound in your stores. [commit](https://github.com/goatslacker/alt/commit/1635589)

* `reduce()` listen to all dispatches in a store and return the new state. [commit](https://github.com/goatslacker/alt/commit/1635589)

* `output()` transform the output that is emitted from the stores. [commit](https://github.com/goatslacker/alt/commit/1635589)

* Proper server rendering resolving all data at the component level before rendering. [commit](https://github.com/goatslacker/alt/commit/4cf98e3)

* Batched dispatches to avoid having componentWillMount cause a cannot dispatch while dispatching error when it loses context. [commit](https://github.com/goatslacker/alt/commit/907c94c)

* Alt.debug for registering your alt instance with chrome dev tools. [commit](https://github.com/goatslacker/alt/commit/5b6d78c)

* Function utils for transforming store state. [commit](https://github.com/goatslacker/alt/commit/e3564d6)

## 0.16.7

### Added

* interceptResponse method to data sources [commit](https://github.com/goatslacker/alt/commit/6f074)

### Fixes

* Revert breaking change back to merge state. 0.17.0 will include bootstrap, recycle, and flush replace state instead of merge state. [commit](https://github.com/goatslacker/alt/commit/9bc87)

### Changed

* local method in data source must return null or undefined to trigger remote [commit](https://github.com/goatslacker/alt/commit/4152c)

## 0.16.6

### Fixes

* Fixes bug with recycle for keys that weren't set at the beginning. [commit](https://github.com/goatslacker/alt/commit/1f8da1)
* Fixes isLoading for multiple async calls. [commit](https://github.com/goatslacker/alt/commit/6e4ed23)

## 0.16.5

### Added

* @decorate(alt) to decorate your store and activate all @bind and @expose methods. [commit](https://github.com/goatslacker/alt/commit/3865214)
* getStores in conenctToStores decorator/wrapper function now receives props from a store. [commit](https://github.com/goatslacker/alt/commit/7003703)
* Solving the async debate. [commit](https://github.com/goatslacker/alt/commit/4962ac5)

## 0.16.4

### Added

* @bind and @expose decorators for binding actions and exporting public methods. [commit](https://github.com/goatslacker/alt/commit/9bf17f0)
* Made the lifecycles eventemitters so you can bind multiple. [commit](https://github.com/goatslacker/alt/commit/cf226f5)

### Fixes

* Bug with react-native. Stop using the Object.assign polyfill since react-native overrides it with a non-spec compliant one. [commit](https://github.com/goatslacker/alt/commit/5ccab76)

## 0.16.3

### Dependencies

* Updates es-symbol.

## 0.16.2

### Added

* Now passing more information through the dispatch about the action invoked. [commit](https://github.com/goatslacker/alt/commit/05398a6)

## 0.16.1

This release is a pretty big one and it also marks Alt's first breaking changes.

### Breaking Changes

> Upgrade guide is included with each bullet point.

* New method signatures for createStore, createActions, etc. [commit](https://github.com/goatslacker/alt/commit/06838e7)

  **Upgrade Guide**

  - Previously all constructors for stores and actions received the alt instance as its first argument.
  - You now have to pass this in yourself.

```js
// old behavior

class MyStore {
  constructor(alt) { }
}
```

```js
// allows you to pass in your own arguments to the constructors

class MyStore {
  constructor(alt, one, two, three) { }
}

alt.createStore(MyStore, null, alt, 1, 2, 3)
```

* beforeEach/afterEach methods have been moved to lifecycle. [commit](https://github.com/goatslacker/alt/commit/81a4e24)

  **Upgrade Guide**

  - Previously the beforeEach and afterEach methods existed as a prototype method on the store.
  - Now they are lifecycle methods.

```js
// the new way

class Store {
  constructor() {
    this.on('beforeEach', () => {
    });
  }
}
```

* withAltContext is now in decorator form. [commit](https://github.com/goatslacker/alt/commit/3d2df4f)

  **Upgrade Guide**

  - Previously withAltContext took two arguments. The flux and the component.
  - Now it takes a single argument, flux. It returns a function which takes another argument, the component.

  As a decorator:

  ```js
  @withAltContext(alt)
  export default class App extends React.Component {
    render() {
      return <div>{this.context.flux}</div>
    }
  }
  ```

  As a function:

  ```js
  export default withAltContext(alt)(App);
  ```

* Lifecycle method serialize and deserialize have been renamed and moved. [commit](https://github.com/goatslacker/alt/commit/fb30bbc)

  **Upgrade Guide**

  - Rename serialize to onSerialize.
  - Rename deserialize to onDeserialize.
  - Move those methods to your Store's configuration.

  ```js
  // new hotness
  class TodoStore {
    static config = {
      onSerialize() {
      },

      onDeserialize() {
      }
    }
  }
  ```

* atomicTransactions util has been renamed to just atomic. [commit](https://github.com/goatslacker/alt/commit/ff6c285)

  **Upgrade Guide**

  - Change all your import/require from `alt/util/atomicTransactions` to `alt/util/atomic`

* Removed `mixins` from browser-with-addons. [commit](https://github.com/goatslacker/alt/commit/ca2e40e)

Mixins are dead, all hail our new higher-order component overlords.
Please use AltContainer instead: http://alt.js.org/docs/components/altContainer/

* Method signature for beforeEach, afterEach, error lifecycle events have changed. [commit](https://github.com/goatslacker/alt/commit/0b4f3c6)

  **Upgrade Guide**

  - Previously the method signature looked like `fn(actionName, data, state)`.
  - Now it has been simplified to `fn(payload, state)` where `payload` is an object.
  - The payload object contains keys `action` and `data` which contain the information from before.

```js
class Store {
  constructor() {
    this.on('beforeEach', (payload, state) => {
      console.log(payload.data);
    });
  }
}
```

### Added

* Time Traveling! [commit](https://github.com/goatslacker/alt/commit/013447d)

```js
@timetravel
class TodoStore { }

TodoStore.undo(3);
TodoStore.redo(1);
```

* connectToStores function which also works with decorators. [commit](https://github.com/goatslacker/alt/commit/aedabf4)

```js
@connectToStores
class TodoApp extends React.Component {
  static getStores() {
    return [TodoStoreStore]
  }
  static getPropsFromStores(props) {
    return TodoStore.getState()
  }
  render() {
    return (
      <div>
        {this.props.todos.map(todo => <Todo todo={todo} />}
      </div>
    )
  }
}
```

* ImmutableJS support, in an addon as a decorator. [commit](https://github.com/goatslacker/alt/commit/78ef8bf)

```js
@immutable
class TodoStore {
  constructor() {
    this.state = Immutable.Map({})
  }
}
```

* Use store references to take snapshots. [commit](https://github.com/goatslacker/alt/commit/a25f2c8)

```js
alt.takeSnapshot(TodoStore); // returns only TodoStore's snapshot
```

* Use store references to recycle. [commit](https://github.com/goatslacker/alt/commit/0563352)

```js
alt.recycle(TodoStore); // recycles only TodoStore
```

* Simple decorators for creating stores and actions. [commit](https://github.com/goatslacker/alt/commit/c06147e)

```js
import { createStore } from 'alt/utils/decorators'

@createStore(alt)
export default class TodoStore {
  constructor() {
  }
}
```

* Apply transforms at the app level to modify each store before it is created. [commit](https://github.com/goatslacker/alt/commit/1a6f528)

```js
alt.stateTransforms.push(Store => {
  // make every store atomic
  return atomic(alt)(Store)
})
```

* Add specific configuration to your stores, like how getState and setState behave. [commit](https://github.com/goatslacker/alt/commit/1de5e95)

```js
class TodoStore {
  static config = {
    getState(state) {
      // adds a new todo every time you getState
      return states.todos.push({ 'Another todo!' });
    }
  }
}
```

* Create your actions inside the constructor by using instance properties. [commit](https://github.com/goatslacker/alt/commit/752995d)

```js
class FooActions {
  constructor() {
    this.myAction = function (x) {
      this.dispatch(x);
    };
  }
}
```

* All actions created are now available in `alt.actions`. [commit](https://github.com/goatslacker/alt/commit/1d32ad9)

* `inject` prop to AltContainer. [commit](https://github.com/goatslacker/alt/commit/14b56aa)

```js
// inject lets you inject arbitrary props to your children

<AltContainer inject={{ foo: 7, bar: 'hello' }}>
  <div />
</AltContainer>

// div gets prop foo=7 and bar='hello'
```

* `component` prop to AltContainer. [commit](https://github.com/goatslacker/alt/commit/653cb29)

* alt has a `prepare` method which prepares a payload for bootstrapping. [commit](https://github.com/goatslacker/alt/commit/c56d0bf)

```js
// rather than rendering its children you can now pass in a component

<AltContainer component={MyComponent} />

// equivalent to

<AltContainer>
  <MyComponent />
</AltContainer>
```

* Allow customizing where you assign your state as a key. [commit](https://github.com/goatslacker/alt/commit/ff9e4dd)

```js
// if you yearn for a react-like API you can now has

const alt = new Alt({ stateKey: 'state' });

class Store {
  constructor() {
    this.state = {
      stateGoesHere: 1,
      yay: 2
    };

    this.nowItsPrivate = true;
  }
}
```

* An [ES5 guide](http://alt.js.org/guides/es5/) now exists. [commit](https://github.com/goatslacker/alt/commit/8d4ec48)

* Customizable setState and getState. [commit](https://github.com/goatslacker/alt/commit/60c11b6)

```js
// Customize the way getState and setState behave at the app level.

const alt = new Alt({
  getState(state) {
    // add fuzzlewuzzle to every state
    state.fuzzlewuzzle = true;
    return state;
  },

  setState(existingState, newState) {
    // forget existingState, in with the new out with the old
    return newState;
  }
});
```

* Added `maxEvents` parameter to DispatcherRecorder. This allows you to specify how many events you wish to record. [commit](https://github.com/goatslacker/alt/commit/5237b69)

### Fixes

* Performance improvement when creating a really large number of actions. [commit](https://github.com/goatslacker/alt/commit/dca4e7a)
* finalStore is cached per alt instance so it only returns one. [commit](https://github.com/goatslacker/alt/commit/838d8cb)
* Override a store's name using `displayName`. [commit](https://github.com/goatslacker/alt/commit/c91bb1e)
* Fix context for nested components. [commit](https://github.com/goatslacker/alt/commit/21d4d6d)
* Fix AltContainer and AltNativeContainer's rendering. [commit](https://github.com/goatslacker/alt/commit/a155e7d)
* setState now emits a change immediately if the dispatcher is not dispatching. [commit](https://github.com/goatslacker/alt/commit/dd22c7e)

### Changes

* Internals were refactored. [commit](56ede21)
* Babel was upgraded to babel5. [commit](ff00128)
* Action symbols are now prefixed with `alt/`. [commit](7d0c3ec)

## 0.15.6

### Added

* Adding unlisten lifecycle method. [commit](91a67d4)
* AltContainer now takes in store listeners for functions. [commit](7083141)
* `listen` now returns the unlisten function. [commit](864d99c)

## 0.15.5

### Added

* setState has been batched, it emits a change event if there were changes. [commit](https://github.com/goatslacker/alt/commit/a7d98d7)
* Util for having atomic transactions in stores. [commit](https://github.com/goatslacker/alt/commit/868a9ac)
* AltNativeContainer for react-native. [commit](https://github.com/goatslacker/alt/commit/569b4c9)
* Add shouldComponentUpdate to AltContainer. [commit](https://github.com/goatslacker/alt/commit/edda162)
* Centralized error handling inside stores. [commit](https://github.com/goatslacker/alt/commit/1dfdd75)
* Creating single actions. [commit](https://github.com/goatslacker/alt/commit/63d3a72)
* You can now inject actions into your child React components using AltContainer. [commit](https://github.com/goatslacker/alt/commit/1bd3112)
* FinalStore now contains the payload as state. [commit](https://github.com/goatslacker/alt/commit/b8480ba)

## 0.15.4

### Added

* Chrome debugging exporter for devtool. [commit](https://github.com/goatslacker/alt/commit/d925db1)

## 0.15.3

### Added

* Define your actions as POJO. [commit](https://github.com/goatslacker/alt/commit/d99a872)
* Use generateActions with alt instances. [commit](https://github.com/goatslacker/alt/commit/06d07e1)

## 0.15.2

Added/### Fixed

* AltContainer can now receive new props and it'll change. [commit](https://github.com/goatslacker/alt/commit/07debf2)

## 0.15.1

### Fixed

* A bug with `AltContainer` where it was using ES6 syntax. [commit](https://github.com/goatslacker/alt/commit/accea51)

## 0.15.0

### Added

* `AltContainer` which is a react container component that facilitates listening to stores and managing data. [commit](https://github.com/goatslacker/alt/commit/efbd652)
* `beforeEach` and `afterEach` hooks in stores for extending. [commit](https://github.com/goatslacker/alt/commit/46daa25)
* Allow custom dispatcher to be specified. [commit](https://github.com/goatslacker/alt/commit/8f57b6c)
* Adds serialize/loadEvents to the DispatcherRecorder. You can now transfer events between different alt instances and machines. [commit](https://github.com/goatslacker/alt/commit/c18b7f2)
* You can now get a list of a store's bound listeners with `boundListeners`. [commit](https://github.com/goatslacker/alt/commit/e76ae26)
* Testing has been made even easier with access to the original store class with `StoreModel`. [commit](https://github.com/goatslacker/alt/commit/e76ae26)
* takeSnapshot now allows you to take a snapshot of a single store. [commit](https://github.com/goatslacker/alt/commit/98b3c04)
* `rollback`, `flush`, and `recycle` now emit change events. [commit](https://github.com/goatslacker/alt/commit/44ad1de), [commit](bda22be)
* Adds AltManagerUtil which lets you manage multiple instances of alt. [commit](https://github.com/goatslacker/alt/commit/a901e9c)

### Fixed

* Fixes build on Windows. [commit](https://github.com/goatslacker/alt/commit/42d8ca4)
* If a non-store is passed to bootstrap it no longer crashes. [commit](https://github.com/goatslacker/alt/commit/b458450)
* Added the `snapshot` method back in. [commit](https://github.com/goatslacker/alt/commit/5767ae6)

## 0.14.5

### Fixed

* Added react-native support. [commit](https://github.com/goatslacker/alt/commit/a2cb91c)

## 0.14.4

### Added

* Create stores with a POJO. [commit](https://github.com/goatslacker/alt/commit/c382b2840d7d24672d8ec1de400104a4c4dd174e)
* Add `serialize`/`deserialize` lifecycle listener methods. [commit](https://github.com/goatslacker/alt/commit/7a42f27de1cb8a5abd3013704be488df4dccd30d)
* Add isomorphic rendering util. [commit](https://github.com/goatslacker/alt/commit/543c28e8632114f0998596dd615c056828aa0fe0)
* `emitChange` method lets you emit directly from within a store without having to `getInstance` first. [commit](https://github.com/goatslacker/alt/commit/e6c0fffef857b3b88dc62079dda0df798bd2eff5)

Dev ### Dependencies

* Update babel to 4.7.13. [commit](https://github.com/goatslacker/alt/commit/53337890ad9450b17bddd6f9a62ccfba16a518fe)
* Update eslint to 0.17.1 and remove babel-eslint. [commit](https://github.com/goatslacker/alt/commit/a946020219ed74c73e28c46746cf2002f96da6cf).

## 0.14.3

### Added

* `exportPublicMethods` can be used within a store to export public getter methods from the store. [commit](https://github.com/goatslacker/alt/commit/0924093a177eb61b0c448cd7f057cd7499dec8c5)

### Fixed

* Future spec compliant change of making the derived store class call super before setting `this`. [commit](https://github.com/goatslacker/alt/commit/ae1b7bb4b4466fdf6a95c6e0f1ee7458edefbfb2)

## 0.14.2

### Added

* Browser builds for bower. [commit](https://github.com/goatslacker/alt/commit/be35c3fce2a86e94e7fbcba421cc8857cf72bcd1)

### Changed

* The store name generator is now more robust. [commit](https://github.com/goatslacker/alt/commit/504c3f6cfb226e73f3352f78488831f7b2f1fd8b)

## 0.14.1

### Dependencies

* es-symbol has been updated to 1.1.1 [commit](https://github.com/goatslacker/alt/commit/7a9ea4c0bf6b80b677e130ab67766801614d19e1)

## 0.14.0

### Changed

* createStore no longer throws when it encounters a store with the same name. Instead if generates a new name for you and warns you in the console. If a store name is not specified due to using anonymous functions then a warning is also logged. [commit](https://github.com/goatslacker/alt/commit/48c589f5dfd5e623a3c6ab5b490a44ef319fc9ad)

### Dependencies

* es-symbol has been updated to 1.1.0 for better IE8 compatibility. [commit](https://github.com/goatslacker/alt/commit/fcc1c91c9c511d527f6d2464b0ea141cdf6e4995)

## 0.13.11

### Added

* Added access to the internal EventEmitter used by the store. This can be access on the store instance by using `getEventEmitter()` and can be used for custom events. [commit](https://github.com/goatslacker/alt/commit/0bdb3a9a9eda43f99ebfcf5e127bf6570e045d50)
* Added a setState method for syntactic sugar which sets the state in the instance variables inside your store and then emits a change event. [commit](https://github.com/goatslacker/alt/commit/6e45ae49d23e83b3e1f67e5ef41295a09d4d097a)
* Added emitChange method. No more `this.getInstance().emitChange`, now you can just `this.emitChange()` from inside a store. [commit](https://github.com/goatslacker/alt/commit/6e45ae49d23e83b3e1f67e5ef41295a09d4d097a)
* Added syntactic sugar for waitFor. `waitFor` now takes in a splat or array of stores or dispatch tokens. [commit](https://github.com/goatslacker/alt/commit/05eb61887d2bb9ca54ae73d796743a60e6b127bc)
* The `alt` instance now gets passed to the store constructor as well as the actions constructor. [commit](https://github.com/goatslacker/alt/commit/f42b43af9afabfb56494015c0be33d9625d30284)
* ActionListener is a util that allows you to listen in on specific actions. Now it's even more lightweight if you want to listen in on a specific action but don't want the weight of a store. This comes as a util meaning it doesn't increase the size of core alt. Use it if you need it. [commit](https://github.com/goatslacker/alt/commit/ce5ddcac0e40747c6df27b3960961f8cbb854daf)

### Fixed

* addStore now has the `saveStore` parameter as well. [commit](https://github.com/goatslacker/alt/commit/8e654555d9088ba6241ce713dd41234190d2ddf8)

## 0.13.10

### Added

* DispatcherRecorder is a util that allows you to record and replay a series of actions. [commit](https://github.com/goatslacker/alt/commit/834ccf1718ccd6067dadbb286ca0fbbfd5510ecb)
* FinalStore is a util Store that emits a change once all other stores have emitted. [commit](https://github.com/goatslacker/alt/commit/c104fb73eedd61f4c1dbd4ac074ce8a2f4b818bf)
* Added a `saveStore` parameter to `alt.createStore`. This parameter controls whether we should save the store internally (for snapshots, bootstraps) or not. Default is true. [commit](https://github.com/goatslacker/alt/commit/c104fb73eedd61f4c1dbd4ac074ce8a2f4b818bf)

### Fixed

* All the mixins in the mixins folder don't make React complain about binding. [commit](https://github.com/goatslacker/alt/commit/1e5ca13d93f66f6839277dadf9eb3c62989f5569)

## 0.13.8

### Added

* Create context on `add` in `Subscribe` mixin. [commit](https://github.com/goatslacker/alt/commit/df952a22b1b785b719c82df602489cac3cb8d884)

### Fixed

* Change lifecycle hook for `Listener` mixin to `ComponentWillMount` so that it functions are identical
between server rendering and client rendering. [commit](https://github.com/goatslacker/alt/commit/a3a83b963c970e44db10f13afd0c20f74d01084b)

## 0.13.7

### Added

* Add `bindListeners` method to Store. This is the inverse of `bindActions`. [commit](https://github.com/goatslacker/alt/commit/3997f7960ac0b6c1f4fac00b33dc520b9816d70d)
* Create shorthand form of `createActions`, `generateActions`. [commit](https://github.com/goatslacker/alt/commit/84e6bc40f1d7d03dc51f4f68d76bcca5b2fae748)
* Add/update several helpful mixins: `FluxyMixin`, `ReactStateMagicMixin`, and `Subscribe`. [commit](https://github.com/goatslacker/alt/commit/c6acbf5deeee4aa60bd1e6bfcf590d4673926016)

## 0.13.4

### Added

* Add tests.

## 0.13.5

### Added

* Add `bower.json` to enable Alt with Bower. [commit](https://github.com/goatslacker/alt/commit/3f7fc4248c8bc8bd07c9d8f298dda5610af994b5)
* Initial mixin pack addition. [commit](https://github.com/goatslacker/alt/commit/1d5ed1ec06c675a8b85aa683930cc208e88ae60b)
* `ListenerMixin` updated to `listenTo` various stores. [commit](https://github.com/goatslacker/alt/commit/eb7ba8d86f96f5c809aa3787dd29619426c7be60)

## 0.13.3

### Dependencies

* Upgrade to Babel 4.0 (formerly 6to5). [commit](https://github.com/goatslacker/alt/commit/b7dd7795fb8e5b727f07ca578ca1fc930ed6c18b)

## 0.13.2

### Added

* Allow dispatching specific actions with any data. [commit](https://github.com/goatslacker/alt/commit/48efd697378d1b6f794270e0aa6bbad44f0036e5)
* Remove dispatcher symbol from actions. [commit](https://github.com/goatslacker/alt/commit/6a3a7c272d2d46cbb8fee5058aac0a8064a3ad07)

### Fixed

* Assure that store instances do not collide. [commit](https://github.com/goatslacker/alt/commit/6fa0e4a0e868eea4c0b91c7f630589619530f62b)
* Fix bug with defer where it is not variadic. [commit](https://github.com/goatslacker/alt/commit/eb4e3a01279c4e9d7a85d8adcce525e851d09ad9)

## 0.13.1

### Added

* Allow same action name on different Action Classes. [commit](https://github.com/goatslacker/alt/commit/b17d39209ed9e771adc267edc058cf5ef70bb44e)

## 0.13.0

### Added

* Allow unlimited bootstraps. [commit](https://github.com/goatslacker/alt/commit/0ba7b85a97df7dfef37d8f6c97ec48e5ee35b198)

## 0.12.0

### Added

* Replace lifecycle method API. [commit](https://github.com/goatslacker/alt/commit/4c76f7a54f3ceec028ca473b024fdc88ae34292f)
* Add lifecycle methods, `onBootstrapped` and `onRolledBack`. [commit](https://github.com/goatslacker/alt/commit/25dd191b3108fc3b1c73790b38f92000654658b6)
* Distribute Alt with 6to5 runtime. [commit](https://github.com/goatslacker/alt/commit/0147a2e4e072b9574e92a20687e9613c9da4b2c9)
* Allow creating many instances of Stores. [commit](https://github.com/goatslacker/alt/commit/7d9c255bb4f6923b1b17b5e2a6d65e2139636b3a)

## 0.11.0

### Dependencies

* Update es-symbol [commit](https://github.com/goatslacker/alt/commit/d2a1377357eff68c8512be2971228ab863751cba)
* Update 6to5. [commit](https://github.com/goatslacker/alt/commit/5facbbbc8d5fb8573e7edcf5b0dd76b20b37de32)

## 0.10.2

### Added

* Add a class to safeguard call checks. [commit](https://github.com/goatslacker/alt/commit/29012097425e5dc232897a957eb63f4488d5d2dd)

## 0.10.1

### Added

* Add `exportObj` argument to `createActions`. [commit](https://github.com/goatslacker/alt/commit/dc7c75d47866afe1e6d2a0f50e859c1df6b530c1)

## 0.10.0

### Added

* Allow recycling of specific stores. [commit](https://github.com/goatslacker/alt/commit/614843bd2cc84a651229f89a0f0bc749a0249537)

## 0.9.0

### Added

* Unlimited boostrapping on server. [commit](https://github.com/goatslacker/alt/commit/14601b4771afc01f5310c860c63a119bebc45ea9)

## 0.8.0

### Added

* Add `recycle` and `flush` methods. [commit](https://github.com/goatslacker/alt/commit/e3016347f41c14b019235c096415dfa29158d6f8)
* Make stores available in `alt.stores`. [commit](https://github.com/goatslacker/alt/commit/598624c2e281ffed6b5c6b4122930ce5a6a0d7be)
