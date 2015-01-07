module.exports = { create: createIsomorphicMixin }

function createIsomorphicMixin(alt) {
  return {
    componentWillMount: function () {
      if (!this.props.altStores) {
        throw new ReferenceError(
          'altStores was not provided as a property to the react element'
        )
      }
      alt.bootstrap(JSON.stringify(this.props.altStores))
    }
  }
}
