module.exports = { create: createIsomorphicMixin }

function createIsomorphicMixin(alt) {
  return {
    componentWillMount: function () {
      alt.bootstrap(JSON.stringify(this.props.altStores))
    }
  }
}
