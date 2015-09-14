import alt from './alt'
import AltStore from './AltStore'
import DebugActions from './DebugActions'

export default alt.createStore(class {
  static displayName = 'DispatcherStore'

  static config = {
    getState(state) {
      return {
        currentStateId: state.currentStateId,
        dispatches: state.dispatches,
        inReplayMode: state.nextReplayId !== null,
        isRecording: state.isRecording,
        isReplaying: state.isReplaying,
        mtime: state.mtime,
      }
    },
  }

  constructor() {
    this.cachedDispatches = []
    this.dispatches = []
    this.currentStateId = null
    this.snapshots = {}
    this.replayTime = 100
    this.isRecording = true
    this.isReplaying = false
    this.nextReplayId = null

    // due to the aggressive nature of FixedDataTable's shouldComponentUpdate
    // and JS objects being references not values we need an mtime applied
    // to each dispatch so we know when data has changed
    this.mtime = Date.now()

    this.on('beforeEach', () => {
      this.mtime = Date.now()
    })

    this.bindActions(DebugActions)
  }

  addDispatch(payload) {
    if (!this.isRecording) return false

    const dispatchedStores = AltStore.stores()
      .filter((x) => x.boundListeners.indexOf(payload.action) > -1)
      .map((x) => x.name)
      .join(', ')

    payload.dispatchedStores = dispatchedStores

    this.dispatches.unshift(payload)

    this.snapshots[payload.id] = AltStore.alt().takeSnapshot()
    this.currentStateId = payload.id
  }

  clear() {
    this.dispatches = []
    this.currentStateId = null
    this.nextReplayId = null
    this.snapshots = {}

    AltStore.alt().recycle()
  }

  loadRecording(events) {
    this.clear()
    const wasRecording = this.isRecording
    this.isRecording = true
    const dispatches = JSON.parse(events)
    dispatches.reverse().forEach((dispatch) => {
      setTimeout(() => {
        AltStore.alt().dispatch(
          dispatch.action,
          dispatch.data,
          dispatch.details
        )
      }, 0)
    })
    this.isRecording = wasRecording
  }

  replay() {
    if (!this.isReplaying) return false

    const dispatch = this.cachedDispatches[this.nextReplayId]
    setTimeout(() => {
      AltStore.alt().dispatch(dispatch.action, dispatch.data, dispatch.details)
    }, 0)

    this.nextReplayId = this.nextReplayId - 1

    if (this.nextReplayId >= 0) {
      setTimeout(() => DebugActions.replay(), this.replayTime)
    } else {
      this.isReplaying = false
      this.nextReplayId = null
    }
  }

  revert(id) {
    const snapshot = this.snapshots[id]
    if (snapshot) {
      this.currentStateId = id
      AltStore.alt().bootstrap(snapshot)
    }
  }

  saveRecording() {
    /*eslint-disable*/
    console.log(JSON.stringify(this.dispatches))
    /*eslint-enable*/
  }

  startReplay() {
    this.cachedDispatches = this.dispatches.slice()
    this.clear()
    this.nextReplayId = this.cachedDispatches.length - 1
    this.isReplaying = true
  }

  stopReplay() {
    this.cachedDispatches = []
    this.nextReplayId = null
    this.isReplaying = false
  }

  togglePauseReplay() {
    this.isReplaying = !this.isReplaying
  }

  toggleRecording() {
    this.isRecording = !this.isRecording
  }
})
