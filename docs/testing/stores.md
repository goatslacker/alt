---
layout: docs
title: Testing Stores
description: How to test alt stores
permalink: /docs/testing/stores/
---

# Testing Stores

## Conceptual how to

Since Flux stores have no direct setters testing the action handlers of a store or any of the store's internal business can be tricky. This short tutorial demonstrates how to use ES6 modules in order to export both the alt created store as well as the store's unwrapped model for testing.

The primary functionality of Stores in the Flux pattern is to listen for Actions, update/manage data to be used by the view, and emit change events to let the views know that data has been changed and they need to update. Based on this, the main thing we want to do is dispatch an event that our store is listening to (via `alt.dispatcher.dispatch(payload)`) and then check if the data in the store is updated in the way we expect (via methods that return data like `store.getState()` or `store.myPublicMethod()`).

This form of "blackbox testing" should cover most of your store testing needs, but what if our store methods that respond to actions do other things besides update data, or what if we have some other private helper methods that we need to test?

One thing we can do is to test our class before it is wrapped by alt, the unwrapped class. We should trust the alt library to test its own internals, so we can just test the inaccessible methods in our plain class by exporting it separately from our alt wrapped store (via `alt.createStore`). To do this, we can export it as a separate file, or use a named export for our unwrapped class and the default export for our alt wrapped class (in the example below, we will use the latter for simplicity).

The best way to demonstrate testing stores is with an example.

## Example

You can also download and run this [example](https://github.com/jdlehman/alt-example-tests).

### Store

```javascript
// stores/PetStore.js
import alt from 'MyAlt'; // instance of alt
import petActions from 'actions/PetActions';

// named export
export class UnwrappedPetStore {
  constructor() {
    this.bindActions(petActions); // buyPet, sellPet

    this.pets = {hamsters: 2, dogs: 0, cats: 3};
    this.storeName = "Pete's Pets";
    this.revenue = 0;
  }

  onBuyPet({cost, pet}) {
    this.pets[pet]++;
    this.revenue -= this.roundMoney(cost);
  }

  onSellPet({price, pet}) {
    this.pets[pet]--;
    this.revenue += this.roundMoney(price);
  }

  // this is inaccessible from our alt wrapped store
  roundMoney(money) {
    // rounds to cents
    return Math.round(money * 100) / 100;
  }

  static getInventory() {
    return this.getState().pets;
  }
}

// default export
export default alt.createStore(UnwrappedPetStore, 'PetStore');
```

### Related Actions

```javascript
// actions/PetActions.js
import alt from 'MyAlt';

class PetActions {
  constructor() {
    this.generateActions('buyPet', 'sellPet');
  }
}

export default alt.createActions(PetActions);
```

### Store test

```javascript
// tests/stores/PetStore_test.js
import alt from 'MyAlt';
// wrappedPetStore is alt store, UnwrappedPetStore is UnwrappedPetStore class
import wrappedPetStore, {UnwrappedPetStore} from 'stores/PetStore';
import petActions from 'actions/PetActions';
 // you can use any assertion library you want
import {assert} from 'chai';

// These testing utils will auto stub the stuff that alt.createStore does
import AltTestingUtils from 'alt/utils/AltTestingUtils';

describe('PetStore', () => {
  it('listens for buy a pet action', () => {
    // get initial state of store
    var oldRevenue = wrappedPetStore.getState().revenue,
        oldDogs = wrappedPetStore.getInventory().dogs;

    // create action to be dispatched
    var data = {cost: 10.223, pet: 'dogs'},
        action = petActions.BUY_PET;

    // dispatch action (store is listening for action)
    // NOTE: FB's dispatcher expects keys "action" and "data"
    alt.dispatcher.dispatch({action, data});

    // assertions
    assert.equal(wrappedPetStore.getState().revenue, oldRevenue - 10.22);
    assert.equal(wrappedPetStore.getInventory().dogs, oldDogs + 1);
  });

  it('listens for sell a pet action', () => {
    // get initial state of store
    var oldRevenue = wrappedPetStore.getState().revenue,
        oldDogs = wrappedPetStore.getInventory().dogs;

    // create action to be dispatched
    var data = {price: 40.125, pet: 'dogs'},
        action = petActions.SELL_PET;

    // dispatch action (store is listening for action)
    // NOTE: FB's dispatcher expects keys "action" and "data"
    alt.dispatcher.dispatch({action, data});

    // assertions
    assert.equal(wrappedPetStore.getState().revenue, oldRevenue + 40.13);
    assert.equal(wrappedPetStore.getInventory().dogs, oldDogs - 1);
  });

  // though we can see that this method is working from our tests above,
  // lets use this inaccessible method to show how we can test
  // non static methods if we desire/need to
  it('rounds money to 2 decimal places', () => {
    var unwrappedStore = AltTestingUtils.makeStoreTestable(alt, UnwrappedPetStore);
    assert.equal(unwrappedStore.roundMoney(21.221234), 21.22);
    assert.equal(unwrappedStore.roundMoney(11.2561341), 11.26)
  });
});
```

If you're using jest to test it is advised you unmock your alt instance as well as alt itself.

You can set this up in your `package.json` like so:

```js
"jest": {
  "unmockedModulePathPatterns": [
    "node_modules/alt",
    "alt.js"
  ]
}
```

You can also test the dispatcher by overwriting `alt.dispatcher`. Here is an example:

```js
beforeEach(function() {
  alt = require('../../alt');
  alt.dispatcher = { register: jest.genMockFunction() };
  UnreadThreadStore = require('../UnreadThreadStore');
  callback = alt.dispatcher.register.mock.calls[0][0];
});
```

You can see a working jest test [here](https://github.com/goatslacker/alt/blob/master/examples/chat/js/stores/__tests__/UnreadThreadStore-test.js) which tests the [UnreadThreadStore](https://github.com/goatslacker/alt/blob/master/examples/chat/js/stores/UnreadThreadStore.js) from the [flux chat example](https://github.com/goatslacker/alt/tree/master/examples/chat) application.
