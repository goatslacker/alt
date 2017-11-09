import { assert } from 'chai';
import Alt from '../';

const alt = new Alt();

alt.generateActions('one', 'two');
alt.generateActions('three');
alt.generateActions('one');

alt.createActions(class FooActions {
  static displayName = 'FooActions';
  one() {}
  two() {}
});

alt.createActions({
  displayName: 'Pojo',
  one() { },
  two() { }
});

alt.createActions({
  one() { },
  two() { }
});

alt.createAction('test', () => { });

export default {
  'actions obj': function () {
    assert.isObject(alt.actions, 'actions exist');
    assert.isFunction(alt.actions.global.test, 'test exists');
    assert(Object.keys(alt.actions.global).length === 10, 'global actions contain stuff from createAction and generateActions');
    assert(Object.keys(alt.actions.FooActions).length === 4, '2 actions namespaced on FooActions');
    assert.isObject(alt.actions.Pojo, 'pojo named action exists');
    assert(Object.keys(alt.actions.Pojo).length === 4, 'pojo has 2 actions associated with it');

    assert.isDefined(alt.actions.global.three, 'three action is defined in global');

    assert.isDefined(alt.actions.Unknown.one, 'one exists in Unknown');
    assert.isDefined(alt.actions.global.one1, 'one1 was created because of a name clash');

    assert.isDefined(alt.actions.global.THREE, 'the constant exists too');
  }
};
