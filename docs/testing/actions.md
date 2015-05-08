---
layout: docs
title: Testing Actions
description: How to test alt actions
permalink: /docs/testing/actions/
---

# Testing Actions

## Conceptual how to

The good news about testing actions is that you probably won't have to do a lot of testing! Most Flux actions just pass data directly to the dispatcher, which then gets passed to the store to be handled.

However, there are instances where actions will modify the data in some way before passing it on to the dispatcher. We can test these by "spying on"/listening to the dispatcher and ensuring that `alt.dispatcher.dispatch` is called with the correct payload.

An action might also have other side effects such as calling another action, in which case we might also need to "spy" on that action to ensure that it is also called correctly.

Let's jump into it with an example:

# Example

You can also download and run this [example](https://github.com/jdlehman/alt-example-tests).

## Action
```javascript
import alt from 'MyAlt';
import legalActions from 'actions/LegalActions';

class PetActions {
  constructor() {
    // these we do not need to test as we trust alt tests `generateActions`
    this.generateActions('buyPet', 'sellPet');
  }

  // this action modifies the dispatched data AND calls another action
  buyExoticPet({pet, cost}) {
    var importCost = 1000,
        illegalAnimals = ['dragon', 'unicorn', 'cyclops'],
        // adds import charge to cost
        totalCost = importCost + cost;

    this.dispatch({
      pet,
      cost: totalCost
    });

    // checks if pet is legal
    if(illegalAnimals.indexOf(pet) >= 0) {
      legalActions.illegalPet(pet);
    }
  }
}

export default alt.createActions(PetActions);
```

## Action Test

```javascript
import alt from 'MyAlt';
import petActions from 'actions/PetActions';
import legalActions from 'actions/LegalActions';
// you can use any assertion lib you want
import {assert} from 'chai';
// we will use [sinon](http://sinonjs.org/docs/) for spying, but you can use any similar lib
import sinon from 'sinon';

describe('PetActions', () => {
  beforeEach(() => {
    // here we use sinon to create a spy on the alt.dispatcher.dispatch function
    this.dispatcherSpy = sinon.spy(alt.dispatcher, 'dispatch');
    this.illegalSpy = sinon.spy(legalActions, 'illegalPet');
  });

  afterEach(() => {
    // clean up our sinon spy so we do not affect other tests
    alt.dispatcher.dispatch.restore();
    legalActions.illegalPet.restore();
  });

  describe('#buyExoticPet', () => {
    it('dispatches correct data', () => {
      var pet = 'moose',
          cost = 18.20,
          totalCost = 1000 + cost,
          action = petActions.BUY_EXOTIC_PET;

      // fire the action
      petActions.buyExoticPet({pet, cost});
      // use our spy to see what payload the dispatcher was called with
      // this lets us ensure that the expected payload (with US dollars) was fired
      var dispatcherArgs = this.dispatcherSpy.args[0];
      var firstArg = dispatcherArgs[0];
      assert.equal(firstArg.action, action);
      assert.deepEqual(firstArg.data, {pet, cost: totalCost});
    });

    it('does not fire illegal action for legal pets', () => {
      var pet = 'dog',
          cost = 18.20;

      // fire the action
      petActions.buyExoticPet({pet, cost});
      // use our spy to ensure that the illegal action was NOT called
      assert.equal(this.illegalSpy.callCount, 0);
    });

    it('fires illegal action for illegal pets', () => {
      var pet = 'unicorn',
          cost = 18.20;

      // fire the action
      petActions.buyExoticPet({pet, cost});
      // use our spy to ensure that the illegal action was called
      assert(this.illegalSpy.calledOnce, 'the illegal action was not fired');
    });
  });
});
```
