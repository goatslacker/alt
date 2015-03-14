---
layout: docs
title: Testing Stores
description: How to test alt stores
permalink: /docs/testing/stores/
---

# Testing Stores

## Conceptual how to

The tricky thing about testing alt stores is that alt wraps up the store class we create into an `AltStore`, which essentially adds alt specific functionality (`getState`, `emitChange`, etc), while hiding the implementation and data in our store. The only way we can interact with our store once alt wraps it is via the methods alt adds like `getState` as well as any static methods we defined in our class. Alt does this to enforce the unidirectional flow of data and prevent views from updating stores. Flux specifies that stores be updated via actions only. This means testing our static methods is easy, but testing our other methods is not as straightforward.

The primary functionality of Stores in the Flux pattern is to listen for Actions, update/manage data to be used by the view, and emit change events to let the views know that data has been changed and they need to update. Based on this, the main thing we want to is dispatch an event that our store is listening to (via `alt.dispatcher.dispatch(payload)`) and then check if the data in the store is updated in the way we expect (via methods that return data like `store.getState()` or `store.myStaticMethod()`).

This form of "blackbox testing" should cover most of your store testing needs, but what if our store methods that respond to actions do other things besides update data, or what if we have some other non-static helper methods that we need to test?

One thing we can do is to test our class before it is wrapped by alt, the unwrapped class. We should trust the alt library to test its own internals, so we can just test the inaccessible methods in our plain class by exporting it separately from our alt wrapped store (via `alt.createStore`). To do this, we can export it as a separate file, or use a named export for our unwrapped class and the default export for our alt wrapped class (in the example below, I will use the latter for simplicity).

The best way to demonstrate testing stores is with an example.

## Example

### Store

```javascript
// stores/PetStore.js
import alt from 'MyAlt'; // instance of alt
import petActions from 'actions/PetActions';

// named export
export class UnwrappedPetStore {
  constructor() {
    this.bindActions(petActions); // buyPet, sellPet

    this.pets = {}; //eg. {hamsters: 2, dogs: 0, cats: 3}
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

### Store test

```javascript
// tests/stores/PetStore_test.js
import alt from 'MyAlt';
// wrappedPetStore is alt store, UnwrappedPetStore is UnwrappedPetStore class
import wrappedPetStore, {UnwrappedPetStore} from 'stores/PetStore';
import petActions from 'actions/PetActions';
 // you can use any assertion library you want
import {assert} from 'chai';

describe('PetStore', () => {
  it('listens for buy a pet action', () => {
    // get initial state of store
    var oldRevenue = wrappedPetStore.getState().revenue,
        oldDogs = wrappredPetStore.getInventory().dogs;

    // create action to be dispatched
    var payload = {cost: 10.223, pet: 'dog'},
        action = petActions.BUY_PET;

    // dispatch action (store is listening for action)
    alt.dispatcher.dispatch({action, payload});

    // assertions
    assert.equal(wrappedPetStore.getState().revenue, oldRevenue - 10.22);
    assert.equal(wrappedPetStore.getInventory().dogs, oldDogs + 1);
  });

  it('listens for sell a pet action', () => {
    // get initial state of store
    var oldRevenue = wrappedPetStore.getState().revenue,
        oldDogs = wrappredPetStore.getInventory().dogs;

    // create action to be dispatched
    var payload = {price: 40.125, pet: 'dog'},
        action = petActions.SELL_PET;

    // dispatch action (store is listening for action)
    alt.dispatcher.dispatch({action, payload});

    // assertions
    assert.equal(wrappedPetStore.getState().revenue, oldRevenue + 40.13);
    assert.equal(wrappedPetStore.getInventory().dogs, oldDogs - 1);
  });

  // though we can see that this method is working from our tests above,
  // lets use this inaccessible method to show how we can test
  // non static methods if we desire/need to
  it('rounds money to 2 decimal places', function() {
    var unwrappedStore = new UnwrappedPetStore();
    assert.equal(unwrappedStore.roundMoney(21.221234), 21.22);
    assert.equal(unwrappedStore.roundMoney(11.2561341), 11.26);
  });
});
```
