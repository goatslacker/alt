import Alt from '../dist/alt-with-runtime'
import AltTestingUtils from '../utils/AltTestingUtils'
import { assert } from 'chai'

const alt = new Alt()

const petActions = alt.generateActions('buyPet', 'sellPet')

class UnwrappedPetStore {
  constructor() {
    this.bindActions(petActions) // buyPet, sellPet

    this.pets = {hamsters: 2, dogs: 0, cats: 3}
    this.storeName = "Pete's Pets"
    this.revenue = 0
  }

  onBuyPet({cost, pet}) {
    this.pets[pet]++
    this.revenue -= this.roundMoney(cost)
  }

  onSellPet({price, pet}) {
    this.pets[pet]--
    this.revenue += this.roundMoney(price)
  }

  // this is inaccessible from our alt wrapped store
  roundMoney(money) {
    // rounds to cents
    return Math.round(money * 100) / 100
  }

  static getInventory() {
    return this.getState().pets
  }
}

export default {
  'make a store testable by auto mocking alt.createStore'() {
    var context = AltTestingUtils.mockGetState({ pets: [1, 2, 3] })
    var emptyContext = AltTestingUtils.mockGetState()

    var unwrappedStore = AltTestingUtils.makeStoreTestable(alt, UnwrappedPetStore)
    assert(unwrappedStore.roundMoney(21.221234) === 21.22)
    assert(unwrappedStore.roundMoney(11.2561341) === 11.26)
    assert(UnwrappedPetStore.getInventory.call(context)[0] === 1)
    assert.isUndefined(UnwrappedPetStore.getInventory.call(emptyContext))
  }
}
