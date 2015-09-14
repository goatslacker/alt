/*
export default connect({
  resolveAsync(props, context) {
    // must return a promise. component won't render until it resolves
  },

  willMount(props, context) {
    // called on server + client, can do setup work here
  },

  didMount(props, context) {
    // called on client only, here you can kick off other async fetches
  },

  reduceProps(props, context) {
    // called whenever we have new state and we need to compute new props to send down
  },

  listenTo(props, context) {
    // return an array of stores we want to subscribe to
  }
}, MyReactComponent)
*/

import React from 'react'
import Render from './Render'

function connect(Spec, MaybeComponent) {
  function bind(Component) {
    return React.createClass({
      getInitialState() {
        return Spec.reduceProps(this.props, this.context)
      },

      componentWillMount() {
        if (Spec.willMount) Spec.willMount(this.props, this.context)
      },

      componentDidMount() {
        const stores = Spec.listenTo(this.props, this.context)
        this.storeListeners = stores.map((store) => {
          return store.listen(this.onChange)
        })

        if (Spec.didMount) Spec.didMount(this.props, this.context)
      },

      componentWillUnmount() {
        this.storeListeners.forEach(unlisten => unlisten())
      },

      onChange() {
        this.setState(Spec.reduceProps(this.props, this.context))
      },

      render() {
        return <Component {...this.props} {...this.state} />
      },
    })
  }

  const createResolver = Spec.resolveAsync
    ? Render.withData(Spec.resolveAsync)
    : x => x

  // works as a decorator or as a function
  return MaybeComponent
    ? createResolver(bind(MaybeComponent))
    : Component => createResolver(bind(Component))
}

export default connect
