## AltManager example: Weather Tabs App

This is an example React/Flux/Alt app that shows the use of AltManager, a
utility class for Alt.js. AltManager allows for multiple alt instances which is
necessary to build apps that encapsulates a mini app inside of a large app. In
this example we have a simple weather searcher. Each search you make will
create a new tab which itself is a new Alt instance and has its own internal
store & actions. Whatever you do in the alt instance is persisted even after
you move to another tab. You can delete tabs which will delete that alt instance

## Install
1) run `npm run clean`
2) open the index.html file

## Docs
See /utils/AltManager.js for details on how to use AltManager.js
See /mixins/AltManagerMixin.js for details on mixin usage.
