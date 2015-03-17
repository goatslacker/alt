import React from 'react'
import IsomorphicRenderer from '../../utils/IsomorphicRenderer'
import Alt from '../../dist/alt-with-runtime'

const alt = new Alt()

const App = React.createClass({
  render() {
    return (
      <div>chillin</div>
    )
  }
})

export default IsomorphicRenderer(alt, App)
