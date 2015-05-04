import { assign } from './functions'
import makeFinalStore from './makeFinalStore'

function timetravel(alt, options = {}) {
  const history = assign({
    max: 300
  }, options)

  const payloadStore = makeFinalStore(alt)
  const payloads = []
  let current = 0

  function captureMoment(snapshot) {
    if (payloads.length > history.max - 1) {
      payloads.shift()
    }

    // trash history because an undo has taken place
    if (current < payloads.length) {
      payloads.splice(current + 1, payloads.length)
    }

    current += 1
    payloads.push(snapshot)
  }

  return Store => {
    class TimeTravelStore extends Store {
      static displayName = Store.displayName || Store.name

      constructor(...args) {
        super(...args)

        this.on('init', _ => {
          // capture the initial snapshot
          captureMoment(alt.serialize({
            [this._storeName]: this
          }))

          // capture subsequent shots
          payloadStore.listen(_ => captureMoment(
            alt.takeSnapshot(this._storeName)
          ))
        })

        this.exportPublicMethods({
          events() {
            return payloads.slice()
          },

          undo(n = 1) {
            const max = payloads.length - 1
            const index = Math.min(n, max)
            const payload = payloads[max - index]

            current = max - index

            alt.bootstrap(payload)
          },

          redo(n = 1) {
            const max = payloads.length - 1
            const index = Math.min(current + n, max)
            const payload = payloads[index]

            current = index

            alt.bootstrap(payload)
          }
        })
      }
    }

    return TimeTravelStore
  }
}

export default timetravel
