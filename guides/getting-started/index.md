---
layout: guide
title: Getting Started
description: Learn about flux and alt
permalink: /guide/
---

# Getting Started

Alt is a library that facilitates the managing of state within your JavaScript applications. It is modeled after flux.

## What is flux?

Flux is an application architecture for building complex user interfaces. It eschews MVC in favor of unidirectional data flow. What this means is that data enters through a single place (your actions) and then flow outward through their state manager (the store) and finally onto the view. The view can then restart the flow by calling other actions in response to user input.

## Setup

For this tutorial I'll be assuming you're familiar with [React](https://facebook.github.io/react/), [CommonJS](http://www.commonjs.org/), [ES5 JavaScript](https://es5.github.io/), and a subset of [ES6](https://people.mozilla.org/~jorendorff/es6-draft.html) specifically the one that works with react's transform. I'll also assume you're on a modern browser or a node environment. Alt is not restricted to only React or CommonJS, you may download a browser build of alt [here](https://cdn.rawgit.com/goatslacker/alt/master/dist/alt.js).

## Installing

If you're using a package manager like npm or bower then go ahead and install alt.

```bash
npm install alt
```

## Folder structure

A typical folder structure would look like this

```txt
your_project
|--actions/
|  |--MyActions.js
|--stores/
|  |--MyStore.js
|--components/
|  |--MyComponent.jsx
|--alt.js
|--app.js
```

## Creating your first alt

For this guide we'll be creating a very simple application which has a list of travel destinations and allows you to favorite which ones you're interested in. Let's get started.

We'll be creating an instance of alt, this instantiates a [Flux dispatcher](http://facebook.github.io/flux/docs/dispatcher.html#content) for you and gives you methods to create your actions and stores. We'll be referring back to this file throughout this guide.

In the root of your project, create a new file called `alt.js`.

```js
var Alt = require('alt');
var alt = new Alt();

module.exports = alt;
```

[Continue to next step...](actions.md)
