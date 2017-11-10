import React from 'react'
import PropTypes from 'prop-types'
import { jsdom } from 'jsdom'
import { assert } from 'chai'
import TestUtils from 'react-dom/test-utils'
import ReactDom from 'react-dom'
import Alt from '../'

const Actions = {
  buttonClick() {
    setTimeout(() => {
      this.switchComponent()
    }, 10)
    return null
  },

  switchComponent() {
    return null
  },

  uhoh() {
    return null
  }
}

function Store(actions) {
  this.active = false

  this.bindAction(actions.switchComponent, () => {
    this.active = true
  })
}

class ComponentA extends React.Component {
    static propTypes = {
      alt: PropTypes.object.isRequired,
      callback: PropTypes.func.isRequired
    };

    constructor(props) {
      super(props)
      this.state = props.alt.stores.store.getState()
    }

    componentWillMount() {
      this.props.alt.stores.store.listen((state) => { return this.setState(state) })
    }

    render() {
      if (this.state.active) {
        return <ComponentB alt={this.props.alt} callback={this.props.callback} />
      }
      return <div />
    }
}

class ComponentB extends React.Component { //eslint-disable-line
    static propTypes = {
      alt: PropTypes.object.isRequired,
      callback: PropTypes.func.isRequired
    };

    componentWillMount() {
      let error = null
      try {
        this.props.alt.actions.actions.uhoh()
      } catch (err) {
        error = err
      } finally {
        this.props.callback(error)
      }
    }

    render() {
      return <div />
    }
}

export default {
  'Batching dispatcher': {
    beforeEach() {
      global.document = jsdom('<!doctype html><html><body></body></html>')
      global.window = global.document.defaultView
    },

    afterEach() {
      delete global.document
      delete global.window
    },

    'does not batch': function (done) {
      const alt = new Alt()
      alt.addActions('actions', Actions)
      alt.addStore('store', Store, alt.actions.actions)

      function test(err) {
        assert.match(err, /dispatch in the middle of a dispatch/)
        done()
      }

      TestUtils.renderIntoDocument(<ComponentA alt={alt} callback={test} />)
      alt.actions.actions.buttonClick()
    },

    'allows batching': function (done) {
      const alt = new Alt({ batchingFunction: ReactDom.unstable_batchedUpdates })
      alt.addActions('actions', Actions)
      alt.addStore('store', Store, alt.actions.actions)

      function test(err) {
        assert.isNull(err)
        done()
      }

      TestUtils.renderIntoDocument(<ComponentA alt={alt} callback={test} />)
      alt.actions.actions.buttonClick()
    }
  }
}
