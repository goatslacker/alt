import { assert } from 'chai';
import Alt from '../dist/alt-with-runtime';

const alt = new Alt();

export default {
  'the stores get the alt instance': function () {
    class MyStore {
      constructor(altInstace) {
        assert.instanceOf(altInstace, Alt, 'alt is an instance of Alt');
      }
    }

    alt.createStore(MyStore, 'MyStore', alt);
  },

  'the actions get the alt instance': function () {
    class MyActions {
      constructor(altInstace) {
        assert.instanceOf(altInstace, Alt, 'alt is an instance of Alt');
      }
    }

    alt.createActions(MyActions, undefined, alt);
  }
};
