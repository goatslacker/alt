'use strict'

export function warn(msg) {
  /* istanbul ignore else */
  if (typeof console !== 'undefined') {
    console.warn(new ReferenceError(msg))
  }
}

export function deprecatedBeforeAfterEachWarning() {
  warn(
    'beforeEach/afterEach functions on the store are deprecated ' +
    'use beforeEach/afterEach as a lifecycle method instead'
  )
}
