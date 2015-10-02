import Alt from './'

const alt = new Alt()

class Actions {
  one() {
    return 1
  }
  two() {
    this.one()
    return 2
  }
}

const actions = alt.createActions(Actions)

alt.dispatcher.register(x => console.log(x))

actions.one()
actions.two()
