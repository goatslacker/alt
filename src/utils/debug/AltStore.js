import alt from './alt'
import DebugActions from './DebugActions'

export default alt.createStore(class {
  static displayName = 'AltStore'

  static config = {
    getState(state) {
      return {
        stores: state.stores,
      }
    },
  }

  constructor() {
    this.alt = null
    this.stores = []

    this.bindActions(DebugActions)

    this.exportPublicMethods({
      alt: () => this.alt,
      stores: () => this.stores,
    })
  }

  setAlt(altInst) {
    this.alt = altInst
    this.stores = Object.keys(this.alt.stores).map((name) => {
      return this.alt.stores[name]
    })
  }
})
