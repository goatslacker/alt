/*eslint-disable */
import DebugActions from './debug/DebugActions'
import DispatcherDebugger from './DispatcherDebugger'
import React from 'react'
import StoreExplorer from './StoreExplorer'

class Debugger extends React.Component {
  componentDidMount() {
    DebugActions.setAlt(this.props.alt)
  }

  renderInspectorWindow() {
    return this.props.inspector
      ? <this.props.inspector />
      : null
  }

  render() {
    return (
      <div>
        <h1>Debug</h1>
        <DispatcherDebugger alt={this.props.alt} />
        <StoreExplorer alt={this.props.alt} />
        {this.renderInspectorWindow()}
      </div>
    )
  }
}

export default Debugger
