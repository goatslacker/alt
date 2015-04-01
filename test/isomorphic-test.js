import { assert } from 'chai'
import sinon from 'sinon'
import React from 'react'

const sampleApp = require('./helpers/SampleApp.jsx')

const reactRender = React.render

export default {
  'Isomorphic Flux rendering util': {
    afterEach() {
      delete global.window
      delete global.document
      React.render = reactRender
    },

    'sampleApp is a function server-side'() {
      assert.isFunction(sampleApp)
    },

    'client side it returns undefined because it just bootstraps'() {
      global.window = {}

      const node = {
        getAttribute: sinon.stub().returns(JSON.stringify(JSON.stringify({})))
      }

      global.document = {
        querySelectorAll: sinon.stub().returns([node])
      }

      React.render = sinon.spy()

      // requiring a separate file because of how require caching works
      const sampleApp2 = require('./helpers/SampleApp2.jsx')

      assert.isUndefined(sampleApp2)

      assert.ok(global.document.querySelectorAll.calledTwice, 'querySelectorAll was called twice when bootstrapping')
      assert.ok(React.render.calledOnce, 'react render was called to render the node')
    },

    'the sampleApp function returns the markup'() {
      const sampleApp = require('./helpers/SampleApp.jsx')

      const markup = sampleApp()
      assert.isString(markup)

      assert(markup.indexOf('react-checksum') !== -1, 'it has a react checksum')
      assert(markup.indexOf('FooStore') !== -1, 'FooStore is encoded in there somewhere')
      assert(markup.indexOf('hello') !== -1, 'the content has been injected properly')
    }
  }
}
