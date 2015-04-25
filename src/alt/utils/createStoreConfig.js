import assign from 'object-assign'

function createStoreConfig(globalConfig, StoreModel) {
  StoreModel.config = assign({
    getState(state) {
      return Object.keys(state).reduce((obj, key) => {
        obj[key] = state[key]
        return obj
      }, {})
    },
    setState: assign
  }, globalConfig, StoreModel.config)
}

export default createStoreConfig
