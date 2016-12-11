"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = statics;
function addStatics(obj) {
  return function (Component) {
    Object.keys(obj).forEach(function (key) {
      Component[key] = obj[key];
    });
    return Component;
  };
}

function statics(obj, Component) {
  return Component ? addStatics(obj)(Component) : addStatics(obj);
}

module.exports = exports["default"];