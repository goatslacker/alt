import Alt from './'

// XXX
global.window = {}

const alt = new Alt()

const actions = alt.generateActions('yes', 'no')

const Source = {
  checkOneTwo: {
    remote() {
      return Promise.resolve('ok')
    },
    success: actions.yes,
    error: actions.no
  }
}

const Store = alt.createStore(function () {
  this.exportAsync(Source)
  this.bindAction(actions.yes, () => {
    console.log('In success')
  })
}, 'Store')

const unlisten = Store.listen(() => {
  throw new Error('crap')
})

//actions.yes()
Store.checkOneTwo().then(() => {
  console.log('??')
}).catch((e) => {
  console.log('no?')
})
