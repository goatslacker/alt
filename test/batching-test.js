import { jsdom } from 'jsdom'
import Alt from '../'
import React from 'react'
import { assert } from 'chai'
import sinon from 'sinon'
import TestUtils from 'react-dom/test-utils'
import ReactDom from 'react-dom'

// TOOD action was called but not dispatched?
const Actions = {
  buttonClick() {
    setTimeout(() => {
      this.switchComponent()
    }, 10)
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
  constructor(props) {
    super(props)

    this.state = props.alt.stores.store.getState()
  }

  componentDidMount() {
    this.props.alt.stores.store.listen(state => this.setState(state))
  }

  render() {
    if (this.state.active) {
      return <ComponentB alt={this.props.alt} callback={this.props.callback} />
    } else {
      return <div />
    }
  }
}

class ComponentB extends React.Component {
  componentDidMount() {
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

    'does not batch'(done) {
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

    'allows batching'(done) {
      const alt = new Alt({ batchingFunction: ReactDom.unstable_batchedUpdates })
      alt.addActions('actions', Actions)
      alt.addStore('store', Store, alt.actions.actions)

      function test(err) {
        assert.isNull(err)
        done()
      }

      TestUtils.renderIntoDocument(<ComponentA alt={alt} callback={test} />)
      alt.actions.actions.buttonClick()
    },
  }
}
