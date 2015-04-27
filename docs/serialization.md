---
layout: docs
title: Serialization
description: Serialization example
permalink: /docs/serialization/
---

# Serialization

The [onSerialize](createStore.md#onSerialize) and [onDeserialize](createStore.md#onDeserialize) store config methods can be utilized separately or together to transform the store data being saved in a snapshot or the snapshot/bootstrap data being set to a store. Though they do not have to be used together, you can picture the parity between the two methods. You can transform the shape of your store data created in the snapshot with `onSerialize`, which might be to get your data in a format ready to be consumed by other services and use `onDeserialize` to transform this data back into the format that your store recognizes.

In the example below, we will show how this technique can be used to `onSerialize` complex model data being used by the store into a simpler structure for the store's snapshot, and repopulate our store models with the simple structure from the bootstrap/snapshot data with `onDeserialize`.

## onSerialize

`onSerialize` provides a hook to transform the store data (via an optional return value) to be saved to an alt snapshot. If a return value is provided than it becomes the value of the store in the snapshot. For example, if the store name was `MyStore` and `onSerialize` returned `{firstName: 'Cereal', lastName: 'Eyes'}`, the snapshot would contain the data `{...'MyStore': {'firstName': 'Cereal', 'lastName': 'Eyes'}...}`. If there is no return value, the default, [`MyStore#getState()`](stores.md#storegetstate) is used for the snapshot data.

## onDeserialize

`onDeserialize` provides a hook to transform snapshot/bootstrap data into a form acceptable to the store for use within the application. The return value of this function becomes the state of the store. If there is no return value, the state of the store from the snapshot is used verbatim. For example, if the `onDeserialize` received the data `{queryParams: 'val=2&val2=23'}`, we might transform the data into `{val: 2, val2: 23}` and return it to set the store data such that `myStore.val === 2` and `myStore.val2 === 23`. onDeserialize can be useful for converting data from an external source such as a JSON API into the format the store expects.

## Example

```js
// this is a model that our store uses to organize/manage data
class MyModel {
  constructor({x, y}) {
    this.x = x
    this.y = y
  }

  get sum() {
    return this.x + this.y
  }

  get product() {
    return this.x * this.y
  }

  get data() {
    return {
      x: this.x,
      y: this.y,
      sum: this.sum,
      product: this.product
    }
  }
}

// our store
class MyStore {
  static config = {
    onSerialize: (state) => {
      return {
        // provides product and sum data from the model getters in addition to x and y
        // this data would not be included by the default serialization (getState)
        myModel: state.myModel.data,
        // change property name in snapshot
        newValKeyName: state.anotherVal
      }
    },
    onDeserialize: (data) => {
      const modifiedData = {
        // need to take POJO and move data into the model our store expects
        myModel: new MyModel({x: data.myModel.x, y: data.myModel.y}),
        // change the property name back to what our store expects
        anotherVal: data.newValKeyName
      }
      return modifiedData
    }
  }

  constructor() {

    // our model is being used by the store
    this.myModel = new Model({x: 2, y: 3})
    // we want to change the property name of this value in the snapshot
    this.anotherVal = 5
    // we don't want to save this data in the snapshot
    this.semiPrivateVal = 10
  }

  static getMyModelData() {
    return this.getState().myModel.data
  }
}
```
