import makeFinalStore from './makeFinalStore'
import { isFunction } from './functions'

function makeAtomicClass(alt, StoreModel) {
  class AtomicClass extends StoreModel {
    constructor() {
      super()
      this.on('error', () => alt.rollback())
    }
  }
  AtomicClass.displayName = StoreModel.displayName || StoreModel.name
  return AtomicClass
}

function makeAtomicObject(alt, StoreModel) {
  StoreModel.lifecycle = StoreModel.lifecycle || {}
  StoreModel.lifecycle.error = () => {
    alt.rollback()
  }
  return StoreModel
}

export default function atomic(alt) {
  const finalStore = makeFinalStore(alt)

  finalStore.listen(() => alt.takeSnapshot())

  return (StoreModel) => {
    return isFunction(StoreModel)
      ? makeAtomicClass(alt, StoreModel)
      : makeAtomicObject(alt, StoreModel)
  }
}
