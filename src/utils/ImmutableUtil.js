import Immutable from 'immutable'

function immutable(StoreModel, overrides = {}) {
  StoreModel.config = {
    setState(currentState, nextState) {
      this.state = nextState
      return this.state
    },

    getState(currentState) {
      return currentState
    },

    onSerialize(state) {
      return state.toJS()
    },

    onDeserialize(data) {
      return overrides.onDeserialize
        ? overrides.onDeserialize(data)
        : Immutable.fromJS(data)
    },
  }

  return StoreModel
}

export default immutable
