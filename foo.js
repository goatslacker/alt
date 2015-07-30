import Alt from './'
import { combine, reduceWith } from './utils/reducers'

const alt = new Alt()

const actions = alt.generateActions('fire', 'foo', 'bar')

const store = alt.createStore({
  state: 21,

  displayName: 'ValueStore',

  reduce: combine(
    reduceWith([actions.fire], (state, payload) => {
      return state + 1
    })
  )
})

store.listen(state => console.log('CHANGED', state))
actions.fire()
actions.foo()
actions.bar()
actions.fire()
