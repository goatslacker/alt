import Immutable from 'immutable'

function immutable(StoreModel) {
  StoreModel.config = {
    stateKey: 'state',

    setState(currentState, nextState) {
      return (this.state = nextState)
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
