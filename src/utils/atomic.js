import makeFinalStore from './makeFinalStore'

function makeAtomicClass(alt, StoreModel) {
  class AtomicClass extends StoreModel {
    constructor() {
      super()
      this.on('error', () => alt.rollback())
    }
  }
  AtomicClass.displayName = StoreModel.displayName || StoreModel.name || 'AtomicClass'
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
  var finalStore = makeFinalStore(alt)

  finalStore.listen(() => alt.takeSnapshot())

  return (StoreModel) => {
    return typeof StoreModel === 'function'
      ? makeAtomicClass(alt, StoreModel)
      : makeAtomicObject(alt, StoreModel)
  }
}
