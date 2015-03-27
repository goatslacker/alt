/**
 * AltManager(Alt: AltClass): undefined
 *
 * > AltManager Util
 *
 * AltManager util allows for a developer to create multiple alt instances in
 * their app. This is useful for building apps that encapsulates an alt instance
 * inside of a outer parent. Popular examples include HipMunk flight search or
 * Google Spreadsheets's multiple sheet tabs. This also allows for caching of
 * client side instance if you need to store a new copy of an alt for each
 * action.
 *
 * Usage:
 *
 * ```js
 * var Alt = require('alt'); // Alt class, not alt instance
 * var altManager = new AltManager(Alt);
 *
 * var altInstance = altManager.create('uniqueKeyName');
 * altInstance.createAction(SomeAction);
 * var someOtherOtherAlt = altManager.create('anotherKeyName');
 * altManager.delete('uniqueKeyName');
 *
 * ```
 */

function AltManager(Alt) {
  this.Alt = Alt
  this.alts = {}
}

AltManager.prototype.create = function (altKey) {
  if (this.get(altKey)) {
    throw new ReferenceError(`Alt key ${altKey} already exists`)
  }

  if (typeof altKey !== 'string') {
    throw new TypeError('altKey must be a string')
  }

  this.alts[altKey] = new this.Alt()
  return this.alts[altKey]
}

AltManager.prototype.get = function (altKey) {
  return this.alts[altKey]
}

// returns all alt instances
AltManager.prototype.all = function () {
  return this.alts
}

AltManager.prototype.findWhere = function (regex) {
  var results = {}
  for (var i in this.alts) {
    if (regex.exec(i) === null) {
      continue
    }

    results[i] = this.alts[i]
  }

  return results
}

AltManager.prototype.delete = function (altKey) {
  if (!this.get(altKey)) {
    return false
  }

  delete this.alts[altKey]
  return true
}

AltManager.prototype.getOrCreate = function (altKey) {
  var alt = this.get(altKey)
  if (alt) {
    return alt
  }

  return this.create(altKey)
}

module.exports = AltManager
