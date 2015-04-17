"use strict";

exports.warn = warn;
exports.deprecatedBeforeAfterEachWarning = deprecatedBeforeAfterEachWarning;
Object.defineProperty(exports, "__esModule", {
  value: true
});

function warn(msg) {
  /* istanbul ignore else */
  if (typeof console !== "undefined") {
    console.warn(new ReferenceError(msg));
  }
}

function deprecatedBeforeAfterEachWarning() {
  warn("beforeEach/afterEach functions on the store are deprecated " + "use beforeEach/afterEach as a lifecycle method instead");
}