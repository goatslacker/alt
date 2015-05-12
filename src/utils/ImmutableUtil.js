import Immutable from 'immutable'

function immutable(StoreModel) {
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
      return Immutable.fromJS(data)
    }
  }

  return StoreModel
}

export default immutable
