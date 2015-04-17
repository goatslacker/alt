"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var _symbolsSymbols = require("./symbols/symbols");

var ACTION_HANDLER = _symbolsSymbols.ACTION_HANDLER;
var ACTION_UID = _symbolsSymbols.ACTION_UID;

var AltAction = (function () {
  function AltAction(alt, name, action, actions) {
    _classCallCheck(this, AltAction);

    this[ACTION_UID] = name;
    this[ACTION_HANDLER] = action.bind(this);
    this.actions = actions;
    this.alt = alt;
  }

  _createClass(AltAction, {
    dispatch: {
      value: function dispatch(data) {
        this.alt.dispatch(this[ACTION_UID], data);
      }
    }
  });

  return AltAction;
})();

module.exports = AltAction;