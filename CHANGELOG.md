# Changelog

## 0.14.1

Dependency Update:

* es-symbol has been updated to 1.1.1

## 0.14.0

Changed:

* createStore no longer throws when it encounters a store with the same name. Instead if generates a new name for you and warns you in the console. If a store name is not specified due to using anonymous functions then a warning is also logged.

Other:

* Includes many README tweaks.

Dependency Update:

* es-symbol has been updated to 1.1.0 for better IE8 compatibility.

## 0.13.11

New:

* Added access to the internal EventEmitter used by the store. This can be access on the store instance by using `getEventEmitter()` and can be used for custom events.
* Added a setState method for syntactic sugar which sets the state in the instance variables inside your store and then emits a change event.
* Added emitChange method. No more `this.getInstance().emitChange`, now you can just `this.emitChange()` from inside a store.
* Added syntactic sugar for waitFor. `waitFor` now takes in a splat or array of stores or dispatch tokens.
* The `alt` instance now gets passed to the store constructor as well as the actions constructor.
* ActionListener is a util that allows you to listen in on specific actions. Now it's even more lightweight if you want to listen in on a specific action but don't want the weight of a store. This comes as a util meaning it doesn't increase the size of core alt. Use it if you need it.

Fixed:

* addStore now has the `saveStore` parameter as well.

## 0.13.10

New:

* DispatcherRecorder is a util that allows you to record and replay a series of actions. [commit](https://github.com/goatslacker/alt/commit/834ccf1718ccd6067dadbb286ca0fbbfd5510ecb)
* FinalStore is a util Store that emits a change once all other stores have emitted. [commit](https://github.com/goatslacker/alt/commit/c104fb73eedd61f4c1dbd4ac074ce8a2f4b818bf)
* Added a `saveStore` parameter to `alt.createStore`. This parameter controls whether we should save the store internally (for snapshots, bootstraps) or not. Default is true.

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
