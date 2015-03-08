import actions from './SampleActions'

export const bindListeners = {
  handleClick: actions.FIRE
}

export const state = {
  data: 1
}

export function handleClick(data) {
  this.state.data = data
}
