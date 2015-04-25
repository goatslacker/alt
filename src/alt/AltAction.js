import * as Sym from './symbols/symbols'

const { ACTION_HANDLER, ACTION_UID } = Sym

export default class AltAction {
  constructor(alt, name, action, actions) {
    this[ACTION_UID] = name
    this[ACTION_HANDLER] = action.bind(this)
    this.actions = actions
    this.alt = alt
  }

  dispatch(data) {
    this.alt.dispatch(this[ACTION_UID], data)
  }
}
