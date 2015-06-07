function makeHot(alt, Store, name = Store.displayName) {
  if (module.hot) {
    module.hot.dispose(() => {
      delete alt.stores[name]
    })
  }

  return alt.createStore(Store, name)
}

export default makeHot
