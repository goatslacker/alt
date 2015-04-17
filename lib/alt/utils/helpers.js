"use strict";

exports.getInternalMethods = getInternalMethods;
Object.defineProperty(exports, "__esModule", {
  value: true
});
"use strict";

/* istanbul ignore next */
function NoopClass() {}

var builtIns = Object.getOwnPropertyNames(NoopClass);
exports.builtIns = builtIns;
var builtInProto = Object.getOwnPropertyNames(NoopClass.prototype);

exports.builtInProto = builtInProto;

function getInternalMethods(obj, excluded) {
  return Object.getOwnPropertyNames(obj).reduce(function (value, m) {
    if (excluded.indexOf(m) !== -1) {
      return value;
    }

    value[m] = obj[m];
    return value;
  }, {});
}