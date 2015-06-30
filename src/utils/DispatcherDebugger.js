/*eslint-disable */
import React from 'react'
import { Column, Table } from 'fixed-data-table'
import makeFinalStore from './makeFinalStore'
import connectToStores from './connectToStores'

import FixedDataTableCss from './debug/FixedDataTableCss'

import DebugActions from './debug/DebugActions'
import DispatcherStore from './debug/DispatcherStore'

class DispatcherDebugger extends React.Component {
  constructor() {
    super()

    this.getDispatch = this.getDispatch.bind(this)
    this.renderName = this.renderName.bind(this)
    this.renderReplay = this.renderReplay.bind(this)
    this.renderRevert = this.renderRevert.bind(this)
    this.view = this.view.bind(this)
  }

  componentDidMount() {
    const finalStore = makeFinalStore(this.props.alt)
    finalStore.listen(state => DebugActions.addDispatch(state.payload))
    DebugActions.setAlt(this.props.alt)
  }

  clear() {
    DebugActions.clear()
  }

  getDispatch(idx) {
    const dispatch = this.props.dispatches[idx]
    return {
      id: dispatch.id,
      action: dispatch.action,
      data: dispatch.data,
      details: dispatch.details,
      recorded: dispatch.recorded,
      dispatchedStores: dispatch.dispatchedStores,
      mtime: this.props.mtime,
    }
  }

  loadRecording() {
    const json = prompt('Give me a serialized recording')
    if (json) DebugActions.loadRecording(json)
  }

  revert(ev) {
    const data = ev.target.dataset
    DebugActions.revert(data.dispatchId)
  }

  saveRecording() {
    DebugActions.saveRecording()
  }

  startReplay() {
    DebugActions.startReplay()
    DebugActions.replay()
  }

  stopReplay() {
    DebugActions.stopReplay()
  }

  toggleLogDispatches() {
    DebugActions.toggleLogDispatches()
  }

  togglePauseReplay() {
    DebugActions.togglePauseReplay()
  }

  toggleRecording() {
    DebugActions.toggleRecording()
  }

  view(ev) {
    const data = ev.target.dataset
    const dispatch = this.props.dispatches[data.index]
    DebugActions.selectData(dispatch)
  }

  renderName(name, _, dispatch, idx) {
    return (
      <div
        data-index={idx}
        onClick={this.view}
        style={{ cursor: 'pointer' }}
      >
        {name}
      </div>
    )
  }

  renderReplay() {
    if (this.props.inReplayMode) {
      return (
        <span>
          <span onClick={this.togglePauseReplay}>
            {this.props.isReplaying ? 'Pause Replay' : 'Resume Replay'}
          </span>
          {' | '}
          <span onClick={this.stopReplay}>
            Stop Replay
          </span>
        </span>
      )
    }

    return (
      <span onClick={this.startReplay}>
        Start Replay
      </span>
    )
  }

  renderRevert(a, b, dispatch) {
    return (
      <div>
        <span
          data-dispatch-id={dispatch.id}
          onClick={this.revert}
          style={{ cursor: 'pointer' }}
        >
          Revert
        </span>
        <span dangerouslySetInnerHTML={{
          __html: this.props.currentStateId === dispatch.id ? '&#10003;' : ''
        }} />
      </div>
    )
  }

  render() {
    return (
      <div>
        <h3>Dispatches</h3>
        <FixedDataTableCss />
        <div>
          <span onClick={this.toggleRecording}>
            {this.props.isRecording ? 'Stop Recording' : 'Record'}
          </span>
          {' | '}
          <span onClick={this.clear}>
            Clear
          </span>
          {' | '}
          <span onClick={this.saveRecording}>
            Save
          </span>
          {' | '}
          <span onClick={this.loadRecording}>
            Load
          </span>
          {' | '}
          {this.renderReplay()}
        </div>
        <Table
          headerHeight={30}
          height={480}
          rowGetter={this.getDispatch}
          rowHeight={30}
          rowsCount={this.props.dispatches.length}
          width={320}
        >
          <Column
            cellRenderer={this.renderName}
            dataKey="action"
            label="Name"
            width={250}
          />
          <Column
            cellRenderer={this.renderRevert}
            dataKey=""
            label="Revert"
            width={70}
          />
        </Table>
      </div>
    )
  }
}

export default connectToStores({
  getPropsFromStores() {
    return DispatcherStore.getState()
  },

  getStores() {
    return [DispatcherStore]
  }
}, DispatcherDebugger)
