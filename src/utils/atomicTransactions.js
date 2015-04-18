import makeFinalStore from './makeFinalStore'

// babelHelpers
/*eslint-disable */
/* istanbul ignore next */
var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };
/*eslint-enable */

function makeAtomicClass(alt, StoreModel) {
  function AtomicClass() {
    StoreModel.call(this)

    this.on('error', () => alt.rollback())
  }
  _inherits(AtomicClass, StoreModel)
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


export default function atomicTransactions(alt) {
  var finalStore = makeFinalStore(alt)

  finalStore.listen(() => alt.takeSnapshot())

  return (StoreModel) => {
    return typeof StoreModel === 'function'
      ? makeAtomicClass(alt, StoreModel)
      : makeAtomicObject(alt, StoreModel)
  }
}
