import { jsdom } from 'jsdom'
import Alt from '../dist/alt-with-runtime'
import React from 'react/addons'
import connectToStores from '../utils/connectToStores'
import { assert } from 'chai'

const { TestUtils } = React.addons

const alt = new Alt()

const testActions = alt.generateActions('updateFoo')

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

export default {
  'connectToStores wrapper': {
    beforeEach() {
      global.document = jsdom('<!doctype html><html><body></body></html>')
      global.window = global.document.parentWindow
      global.navigator = global.window.navigator
      require('react/lib/ExecutionEnvironment').canUseDOM = true

      alt.recycle()
    },

    afterEach() {
      delete global.document
      delete global.window
      delete global.navigator
    },

    'missing the static getStores() method should throw'() {
      const BadComponentOne = React.createClass({
        render() {
          return React.createElement('div', null, 'Bad')
        }
      })

      assert.throws(() => connectToStores(BadComponentOne), 'expects the wrapped component to have a static getStores() method')
    },

    'element mounts and unmounts'() {
      const div = document.createElement('div')

      const LegacyComponent = connectToStores(React.createClass({
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
      }))

      React.render(
        <LegacyComponent />
      , div)

      React.unmountComponentAtNode(div)
    },

    'missing the static getPropsFromStores() method should throw'() {
      const BadComponentTwo = React.createClass({
        statics: {
          getStores() {
            return [testStore]
          }
        },
        render() {
          return React.createElement('div', null, 'Bad')
        }
      })

      assert.throws(() => connectToStores(BadComponentTwo), 'expects the wrapped component to have a static getPropsFromStores() method')
    },

    'createClass() component can get props from stores'() {
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

      const WrappedComponent = connectToStores(LegacyComponent)
      const element = React.createElement(WrappedComponent, {delim: ': '})
      const output = React.renderToStaticMarkup(element)
      assert.include(output, 'Foo: Bar')
    },

    'component can get use stores from props'() {
      const LegacyComponent = React.createClass({
        statics: {
          getStores(props) {
            return [props.store]
          },
          getPropsFromStores(props) {
            return props.store.getState()
          }
        },
        render() {
          return React.createElement('div', null, `Foo${this.props.delim}${this.props.foo}`)
        }
      })

      const WrappedComponent = connectToStores(LegacyComponent)
      const element = React.createElement(WrappedComponent, {delim: ': ', store: testStore})
      const output = React.renderToStaticMarkup(element)
      assert.include(output, 'Foo: Bar')
    },

    'ES6 class component responds to store events'() {
      class ClassComponent extends React.Component {
        static getStores() {
          return [testStore]
        }
        static getPropsFromStores(props) {
          return testStore.getState()
        }
        render() {
          return <span foo={this.props.foo} />
        }
      }

      const WrappedComponent = connectToStores(ClassComponent)

      const node = TestUtils.renderIntoDocument(
        <WrappedComponent />
      )

      testActions.updateFoo('Baz')

      const span = TestUtils.findRenderedDOMComponentWithTag(node, 'span')

      assert(span.props.foo === 'Baz')
    },

    'Component receives all updates'() {
      class ClassComponent extends React.Component {
        static getStores() {
          return [testStore]
        }
        static getPropsFromStores(props) {
          return testStore.getState()
        }
        componentDidMount() {
          testActions.updateFoo('Baz')
        }
        render() {
          return <span foo={this.props.foo} />
        }
      }

      const WrappedComponent = connectToStores(ClassComponent)

      let node = null

      class PortalComponent extends React.Component {
        render() {
          return null
        }
        componentDidMount() {
          this.portalElement = document.createElement('div')
          document.body.appendChild(this.portalElement)
          this.componentDidUpdate()
        }
        componentWillUnmount() {
          React.unmountComponentAtNode(this.portalElement)
          document.body.removeChild(this.portalElement)
        }
        componentDidUpdate() {
          const { clickToClose, onRequestClose } = this.props
          node = React.render(<div>{this.props.children}</div>, this.portalElement)
        }
      }

      TestUtils.renderIntoDocument(
        <PortalComponent>
          <WrappedComponent />
        </PortalComponent>
      )

      const span = TestUtils.scryRenderedDOMComponentsWithTag(node, 'span')[0]

      assert(span.props.foo === 'Baz')
    }
  }
}
