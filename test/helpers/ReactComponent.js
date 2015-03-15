class ReactComponent {
  setState(state) {
    this.state = state
    this.render()
  }

  // A not at all react spec compliant way to test fake react components
  static test(Component, testFn, props) {
    const builtInProto = Object.getOwnPropertyNames(Component.prototype)

    // A trolol way of doing the react <0.13 auto-binding.
    function AutoBoundComponent() {
      Component.call(this)

      builtInProto.forEach((method) => {
        if (method !== 'constructor') {
          this[method] = this[method].bind(this)
        }
      })
    }
    AutoBoundComponent.prototype = Component.prototype

    // initialize the component
    const component = new AutoBoundComponent()

    Component.mixins.forEach((mixin) => {
      // transfer over the mixins.
      Object.keys(mixin).forEach((method) => {
        component[method] = mixin[method].bind(component)
      })

      // move over the statics
      if (Component.statics) {
        Object.keys(Component.statics).forEach((stat) => {
          Component[stat] = Component.statics[stat]
        })
      }
    })

    // call the lifecycle methods and the test function
    try {
      component.props = component.getDefaultProps
        ? component.getDefaultProps()
        : {}

      component.state = component.getInitialState
        ? component.getInitialState()
        : {}

      component.componentWillMount && component.componentWillMount();
      component.componentDidMount && component.componentDidMount();

      testFn && testFn();
    } catch (e) {
      throw e;
    } finally {
      // end with last lifecycle method
      component.componentWillUnmount && component.componentWillUnmount();
    }
  }
}

export default ReactComponent
