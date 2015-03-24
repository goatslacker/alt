import { assert } from 'chai'
import Alt from '../dist/alt-with-runtime'
import AltManager from '../utils/AltManager'

export default {
  'the altManager gets constructed'() {
    var altManager = new AltManager(Alt)
    assert.instanceOf(
      altManager,
      AltManager,
      'altManager is an instance of AltManager'
    )
  },

  'the altManager can create and get and delete'() {
    var altManager = new AltManager(Alt)
    var test1 = altManager.create('test1')
    assert.instanceOf(test1, Alt, 'test1 is an instance of Alt')
    assert.strictEqual(test1, altManager.get('test1'), 'test1 is equal to get alt')
    assert.throw(() => {
      altManager.create('test1')
    }, ReferenceError, 'Alt key test1 already exists');

    assert.throw(() => {
      altManager.create({})
    }, TypeError, 'altKey must be a string');

    assert.ok(altManager.delete('test1'), 'alt test1 is deleted')
    assert.notOk(altManager.get('test1'), 'test1 is null')
    assert.notOk(altManager.delete('test1'), 'alt test1 is deleted')
  },

  'the altManager can getOrCreate'() {
    var altManager = new AltManager(Alt)
    var test1 = altManager.getOrCreate('test1')
    assert.instanceOf(test1, Alt, 'test1 is an instance of Alt')
    assert.strictEqual(test1, altManager.getOrCreate('test1'), 'test1 is equal to get alt')
  },

  'the altManager can get all'() {
    var altManager = new AltManager(Alt)
    var test1 = altManager.getOrCreate('test1')
    var test2 = altManager.getOrCreate('test2')

    assert.instanceOf(test1, Alt, 'test1 is an instance of Alt')
    assert.instanceOf(test2, Alt, 'test2 is an instance of Alt')
    assert.notEqual(test1, test2, 'test1 not equal to test2')

    var index = 0
    var all = altManager.all()
    for (var i in all) {
      if (index == 0) {
        assert.equal(i, 'test1', 'first key is test1')
        assert.strictEqual(test1, all[i], 'test1 is in all[test1]')
      } else {
        assert.equal(i, 'test2', 'first key is test2')
        assert.strictEqual(test2, all[i], 'test2 is in all[test2]')
      }
      assert.isBelow(index, 3, 'index must be under 3')
      index++;
    }
  },

  'the altManager works with findWhere'() {
    var altManager = new AltManager(Alt)
    var test1 = altManager.getOrCreate('users-1')
    var test2 = altManager.getOrCreate('pages-2')

    var results = altManager.findWhere(/^users-/)
    assert.strictEqual(results['users-1'], test1, 'user-1 found with regex')
  }
}
