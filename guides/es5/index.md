---
layout: guides
title: Alt and ES5
description: Using alt with ES5 or ES3
permalink: /guides/es5/
---

# Plain JavaScript

While alt examples encourage ES6 and alt was built with ES6 in mind it is perfectly valid to use plain old JavaScript instead. This guide will focus on a few examples of how you can use alt without the new ES6 hotness.

## Creating Actions

There are quite a few ways to create actions. If they don't process any data and just dispatch a single argument through you can generate them based off of strings. You can create them using constructors and prototypes, or you can use a plain old JS object.

```js
var foodActions = alt.generateActions('addItem');
```

which is the equivalent to

```js
var foodActions = alt.createActions(function () {
  this.addItem = function (item) {
    return item;
  };
});
```

or

```js
var foodActions = alt.createActions({
  addItem: function (item) {
    return item;
  }
});
```

## Creating Stores

You can use constructors and prototypes to create a store, or use an object.

```js
function FoodStore() {
  this.foods = [];

  this.bindListeners({
    addItem: foodActions.addItem
  });
  
  this.exportPublicMethods({
    hasFood: function() {
      return !!this.getState().foods.length;
    }
  });
}

FoodStore.prototype.addItem = function (item) {
  this.foods.push(item);
};

FoodStore.displayName = 'FoodStore';

var foodStore = alt.createStore(FoodStore);
```

which can also be written as an Object:

```js
var FoodStore = alt.createStore({
  displayName: 'FoodStore',

  bindListeners: {
    addItem: foodActions.addItem
  },

  state: {
    foods: []
  },
  
  publicMethods: {
    hasFood: function () {
      return !!this.getState().foods.length;
    }
  },

  addItem: function (item) {
    var foods = this.state.foods;
    foods.push(item);
    this.setState({
      foods: foods
    });
  }
});
```

The interesting thing about the Object pattern is that you can use the old ES3 Module pattern to create your stores:

```js
function FoodStore(initialFood) {
  var foods = [];
  for (var i = 0; i < initialFood.length; i += 1) {
    if (initialFood !== 'banana') {
      foods.push(initialFood);
    }
  }

  return {
    displayName: 'FoodStore',

    bindListeners: {
      addItem: foodActions.addItem
    },

    state: {
      foods: foods
    },
    publicMethods: {
      hasFood: function () {
        return foods.length;
      }
    },

    addItem: function (item) {
      var foods = this.state.foods;
      foods.push(item);
      this.setState({
        foods: foods
      });
    }
  };
}

var foodStore = alt.createStore(
  FoodStore(['banana', 'strawberry', 'mango', 'orange'])
);
```

A less explicit way of creating a public method is to statically define it as property of the store constructor function:
```
FoodStore.hasFood = function() {
  return !!this.getState().length;
}
```

## Instances

You can even create instances of alt if you prefer that over singletons. You would use JavaScript's prototypal inheritance to achieve this.

```js
// Actions
var FoodActionsObject = {
  addItem: function (item) {
    return item;
  }
};

// Creating a store, notice how we inject the actions
function FoodStore(FoodActions) {
  return {
    state: {
      foods: []
    },

    bindListeners: {
      addItem: FoodActions.addItem
    },

    addItem: function (item) {
      var foods = this.state.foods;
      foods.push(item);
      this.setState({
        foods: foods
      });
    }
  };
}

// The flux class
function Flux() {
  // super()
  Alt.apply(this, arguments);

  this.addActions('FoodActions', FoodActionsObject);
  this.addStore('FoodStore', FoodStore(this.getActions('FoodActions')));
}

// ES5 based inheritance
Flux.prototype = Object.create(Alt.prototype, {
  constructor: {
    value: Flux,
    enumerable: false,
    writable: true,
    configurable: true
  }
});

Flux.__proto__ = Alt

// using it
var flux = new Flux();

// use flux like you normally would
flux.getActions('FoodActions').addItem('celery');
console.log(
  flux.getStore('FoodStore').getState()
);
```
