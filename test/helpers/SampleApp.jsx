import React from 'react'
import IsomorphicRenderer from '../../utils/IsomorphicRenderer'
import Alt from '../../dist/alt-with-runtime'

const alt = new Alt()

const FooStore = alt.createStore({
  displayName: 'FooStore',
  state: { test: 'hello' }
})

const App = React.createClass({
  getInitialState() {
    return FooStore.getState()
  },

  render() {
    return (
      <div>{this.state.test}</div>
    )
  }
})

export default IsomorphicRenderer(alt, App)
