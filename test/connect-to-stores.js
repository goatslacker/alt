import Alt from '../dist/alt-with-runtime'
import React from 'react'
import ReactComponent from './helpers/ReactComponent'
import connectToStores from '../utils/connectToStores'
import { assert } from 'chai'

const alt = new Alt();

const testActions = alt.createActions(
  class TestActions {
    updateFoo(newValue) {
      this.dispatch(newValue)
    }
  }
)

const testStore = alt.createStore(
  class TestStore {
    constructor() {
      this.bindAction(testActions.updateFoo, this.onChangeFoo)
      this.foo = 'Bar'
    }
    onChangeFoo(newValue) {
      this.foo = newValue
    }
  }
)

const BadComponentOne = React.createClass({
  render() {
    return React.createElement('div', null, 'Bad');
  }
});
const BadComponentTwo = React.createClass({
  statics: {
    getStores() {
      return [testStore]
    }
  },
  render() {
    return React.createElement('div', null, 'Bad');
  }
})

const LegacyComponent = React.createClass({
  statics: {
    getStores() {
      return [testStore]
    },
    getPropsFromStores(props) {
      return testStore.getState()
    }
  },
  render() {
    return React.createElement('div', null, `Foo${this.props.delim}${this.props.foo}`)
  }
})

class ClassComponent extends ReactComponent {
  static getStores() {
    return [testStore]
  }
  static getPropsFromStores(props) {
    return testStore.getState()
  }
  render() {
    // Will never get called due to mocked wrapper.
  }
}

export default {
  'connectToStores wrapper': {

    'missing the static getStores() method should throw'() {
      assert.throws(() => connectToStores(BadComponentOne), 'expects the wrapped component to have a static getStores() method')
    },

    'missing the static getPropsFromStores() method should throw'() {
      assert.throws(() => connectToStores(BadComponentTwo), 'expects the wrapped component to have a static getPropsFromStores() method')
    },

    'createClass() component can get props from stores'() {
      connectToStores.createClass = React.createClass
      const WrappedComponent = connectToStores(LegacyComponent)
      const element = React.createElement(WrappedComponent, {delim: ': '})
      const output = React.renderToStaticMarkup(element)
      assert.include(output, 'Foo: Bar')
    },

    'ES6 class component responds to store events'() {
      let renderCalled = false
      connectToStores.createClass = (spec) => {
        class FakeComponent extends ReactComponent {}
        Object.assign(FakeComponent.prototype, spec)
        FakeComponent.prototype.render = function() {
          assert.strictEqual(this.state.foo, 'Baz', 'wrapped component did not receive store changes')
          renderCalled = true
        }
        return ReactComponent.prepare(FakeComponent)
      }
      const WrappedComponent = connectToStores(ClassComponent)
      ReactComponent.test(WrappedComponent, () => {
        testActions.updateFoo('Baz')
        assert(renderCalled === true, 'render was never called')
      }, {delim: ' - '})
    }

  }
}