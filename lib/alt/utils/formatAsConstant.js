"use strict";

module.exports = formatAsConstant;

function formatAsConstant(name) {
  return name.replace(/[a-z]([A-Z])/g, function (i) {
    return "" + i[0] + "_" + i[1].toLowerCase();
  }).toUpperCase();
}