import alt from './alt'
import DebugActions from './DebugActions'

export default alt.createStore(class {
  static displayName = 'ViewerStore'

  static config = {
    getState(state) {
      return {
        selectedData: state.selectedData,
      }
    },
  }

  constructor() {
    this.selectedData = {}

    this.bindActions(DebugActions)
  }

  selectData(data) {
    this.selectedData = data
    /*eslint-disable*/
    console.log(data)
    /*eslint-enable*/
  }
})
