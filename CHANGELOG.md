# Changelog

## 0.14.5

Fixed:

* Added react-native support. [commit](a2cb91c)

## 0.14.4

Added:

* Create stores with a POJO. [commit](https://github.com/goatslacker/alt/commit/c382b2840d7d24672d8ec1de400104a4c4dd174e)
* Add `serialize`/`deserialize` lifecycle listener methods. [commit](https://github.com/goatslacker/alt/commit/7a42f27de1cb8a5abd3013704be488df4dccd30d)
* Add isomorphic rendering util. [commit](https://github.com/goatslacker/alt/commit/543c28e8632114f0998596dd615c056828aa0fe0)
* `emitChange` method lets you emit directly from within a store without having to `getInstance` first. [commit](https://github.com/goatslacker/alt/commit/e6c0fffef857b3b88dc62079dda0df798bd2eff5)

Dev Dependency Update:

* Update babel to 4.7.13. [commit](https://github.com/goatslacker/alt/commit/53337890ad9450b17bddd6f9a62ccfba16a518fe)
* Update eslint to 0.17.1 and remove babel-eslint. [commit](https://github.com/goatslacker/alt/commit/a946020219ed74c73e28c46746cf2002f96da6cf).

## 0.14.3

Added:

* `exportPublicMethods` can be used within a store to export public getter methods from the store. [commit](https://github.com/goatslacker/alt/commit/0924093a177eb61b0c448cd7f057cd7499dec8c5)

Other:

* Future spec compliant change of making the derived store class call super before setting `this`. [commit](https://github.com/goatslacker/alt/commit/ae1b7bb4b4466fdf6a95c6e0f1ee7458edefbfb2)

## 0.14.2

Added:

* Browser builds for bower. [commit](https://github.com/goatslacker/alt/commit/be35c3fce2a86e94e7fbcba421cc8857cf72bcd1)

Changed:

* The store name generator is now more robust. [commit](https://github.com/goatslacker/alt/commit/504c3f6cfb226e73f3352f78488831f7b2f1fd8b)

## 0.14.1

Dependency Update:

* es-symbol has been updated to 1.1.1 [commit](https://github.com/goatslacker/alt/commit/7a9ea4c0bf6b80b677e130ab67766801614d19e1)

## 0.14.0

Changed:

* createStore no longer throws when it encounters a store with the same name. Instead if generates a new name for you and warns you in the console. If a store name is not specified due to using anonymous functions then a warning is also logged. [commit](https://github.com/goatslacker/alt/commit/48c589f5dfd5e623a3c6ab5b490a44ef319fc9ad)

Other:

* Includes many README tweaks.

Dependency Update:

* es-symbol has been updated to 1.1.0 for better IE8 compatibility. [commit](https://github.com/goatslacker/alt/commit/fcc1c91c9c511d527f6d2464b0ea141cdf6e4995)

## 0.13.11

New:

* Added access to the internal EventEmitter used by the store. This can be access on the store instance by using `getEventEmitter()` and can be used for custom events. [commit](https://github.com/goatslacker/alt/commit/0bdb3a9a9eda43f99ebfcf5e127bf6570e045d50)
* Added a setState method for syntactic sugar which sets the state in the instance variables inside your store and then emits a change event. [commit](https://github.com/goatslacker/alt/commit/6e45ae49d23e83b3e1f67e5ef41295a09d4d097a)
* Added emitChange method. No more `this.getInstance().emitChange`, now you can just `this.emitChange()` from inside a store. [commit](https://github.com/goatslacker/alt/commit/6e45ae49d23e83b3e1f67e5ef41295a09d4d097a)
* Added syntactic sugar for waitFor. `waitFor` now takes in a splat or array of stores or dispatch tokens. [commit](https://github.com/goatslacker/alt/commit/05eb61887d2bb9ca54ae73d796743a60e6b127bc)
* The `alt` instance now gets passed to the store constructor as well as the actions constructor. [commit](https://github.com/goatslacker/alt/commit/f42b43af9afabfb56494015c0be33d9625d30284)
* ActionListener is a util that allows you to listen in on specific actions. Now it's even more lightweight if you want to listen in on a specific action but don't want the weight of a store. This comes as a util meaning it doesn't increase the size of core alt. Use it if you need it. [commit](https://github.com/goatslacker/alt/commit/ce5ddcac0e40747c6df27b3960961f8cbb854daf)

Fixed:

* addStore now has the `saveStore` parameter as well. [commit](https://github.com/goatslacker/alt/commit/8e654555d9088ba6241ce713dd41234190d2ddf8)

## 0.13.10

New:

* DispatcherRecorder is a util that allows you to record and replay a series of actions. [commit](https://github.com/goatslacker/alt/commit/834ccf1718ccd6067dadbb286ca0fbbfd5510ecb)
* FinalStore is a util Store that emits a change once all other stores have emitted. [commit](https://github.com/goatslacker/alt/commit/c104fb73eedd61f4c1dbd4ac074ce8a2f4b818bf)
* Added a `saveStore` parameter to `alt.createStore`. This parameter controls whether we should save the store internally (for snapshots, bootstraps) or not. Default is true. [commit](https://github.com/goatslacker/alt/commit/c104fb73eedd61f4c1dbd4ac074ce8a2f4b818bf)

Fixed:

* All the mixins in the mixins folder don't make React complain about binding. [commit](https://github.com/goatslacker/alt/commit/1e5ca13d93f66f6839277dadf9eb3c62989f5569)

## 0.13.8

New:

* Create context on `add` in `Subscribe` mixin. [commit](https://github.com/goatslacker/alt/commit/df952a22b1b785b719c82df602489cac3cb8d884)

Fixed:

* Change lifecycle hook for `Listener` mixin to `ComponentWillMount` so that it functions are identical
between server rendering and client rendering. [commit](https://github.com/goatslacker/alt/commit/a3a83b963c970e44db10f13afd0c20f74d01084b)

## 0.13.7

New:

* Add `bindListeners` method to Store. This is the inverse of `bindActions`. [commit](https://github.com/goatslacker/alt/commit/3997f7960ac0b6c1f4fac00b33dc520b9816d70d)
* Create shorthand form of `createActions`, `generateActions`. [commit](https://github.com/goatslacker/alt/commit/84e6bc40f1d7d03dc51f4f68d76bcca5b2fae748)
* Add/update several helpful mixins: `FluxyMixin`, `ReactStateMagicMixin`, and `Subscribe`. [commit](https://github.com/goatslacker/alt/commit/c6acbf5deeee4aa60bd1e6bfcf590d4673926016)

## 0.13.4

New:

* Add tests.

## 0.13.5

New:

* Add `bower.json` to enable Alt with Bower. [commit](https://github.com/goatslacker/alt/commit/3f7fc4248c8bc8bd07c9d8f298dda5610af994b5)
* Initial mixin pack addition. [commit](https://github.com/goatslacker/alt/commit/1d5ed1ec06c675a8b85aa683930cc208e88ae60b)
* `ListenerMixin` updated to `listenTo` various stores. [commit](https://github.com/goatslacker/alt/commit/eb7ba8d86f96f5c809aa3787dd29619426c7be60)

## 0.13.3

Dev Dependency Updates:

* Upgrade to Babel 4.0 (formerly 6to5). [commit](https://github.com/goatslacker/alt/commit/b7dd7795fb8e5b727f07ca578ca1fc930ed6c18b)

## 0.13.2

New:

* Allow dispatching specific actions with any data. [commit](https://github.com/goatslacker/alt/commit/48efd697378d1b6f794270e0aa6bbad44f0036e5)
* Remove dispatcher symbol from actions. [commit](https://github.com/goatslacker/alt/commit/6a3a7c272d2d46cbb8fee5058aac0a8064a3ad07)

Fixed:

* Assure that store instances do not collide. [commit](https://github.com/goatslacker/alt/commit/6fa0e4a0e868eea4c0b91c7f630589619530f62b)
* Fix bug with defer where it is not variadic. [commit](https://github.com/goatslacker/alt/commit/eb4e3a01279c4e9d7a85d8adcce525e851d09ad9)

## 0.13.1

New:

* Allow same action name on different Action Classes. [commit](https://github.com/goatslacker/alt/commit/b17d39209ed9e771adc267edc058cf5ef70bb44e)

## 0.13.0

New:

* Allow unlimited bootstraps. [commit](https://github.com/goatslacker/alt/commit/0ba7b85a97df7dfef37d8f6c97ec48e5ee35b198)

## 0.12.0

New:

* Replace lifecycle method API. [commit](https://github.com/goatslacker/alt/commit/4c76f7a54f3ceec028ca473b024fdc88ae34292f)
* Add lifecycle methods, `onBootstrapped` and `onRolledBack`. [commit](https://github.com/goatslacker/alt/commit/25dd191b3108fc3b1c73790b38f92000654658b6)
* Distribute Alt with 6to5 runtime. [commit](https://github.com/goatslacker/alt/commit/0147a2e4e072b9574e92a20687e9613c9da4b2c9)
* Allow creating many instances of Stores. [commit](https://github.com/goatslacker/alt/commit/7d9c255bb4f6923b1b17b5e2a6d65e2139636b3a)

## 0.11.0

Dependency update:

* Update es-symbol [commit](https://github.com/goatslacker/alt/commit/d2a1377357eff68c8512be2971228ab863751cba)

Dev Dependency Updates:

* Update 6to5. [commit](https://github.com/goatslacker/alt/commit/5facbbbc8d5fb8573e7edcf5b0dd76b20b37de32)

## 0.10.2

New:

* Add a class to safeguard call checks. [commit](https://github.com/goatslacker/alt/commit/29012097425e5dc232897a957eb63f4488d5d2dd)

## 0.10.1

New:

* Add `exportObj` argument to `createActions`. [commit](https://github.com/goatslacker/alt/commit/dc7c75d47866afe1e6d2a0f50e859c1df6b530c1)

## 0.10.0

New:

* Allow recycling of specific stores. [commit](https://github.com/goatslacker/alt/commit/614843bd2cc84a651229f89a0f0bc749a0249537)

## 0.9.0

New:

* Unlimited boostrapping on server. [commit](https://github.com/goatslacker/alt/commit/14601b4771afc01f5310c860c63a119bebc45ea9)

## 0.8.0

New:

* Add `recycle` and `flush` methods. [commit](https://github.com/goatslacker/alt/commit/e3016347f41c14b019235c096415dfa29158d6f8)
* Make stores available in `alt.stores`. [commit](https://github.com/goatslacker/alt/commit/598624c2e281ffed6b5c6b4122930ce5a6a0d7be)
