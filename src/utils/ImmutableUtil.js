import Immutable from 'immutable'
import { assign } from './functions'

function immutable(StoreModel, overrides) {
  StoreModel.config = assign({
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
    },
  }, overrides)

  return StoreModel
}

export default immutable
