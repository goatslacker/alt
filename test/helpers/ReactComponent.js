class ReactComponent {
  setState(state) {
    this.state = state
    this.render()
  }

  // A not at all react spec compliant way to test fake react components
  static test(Component, testFn, props) {
    let component = new Component()

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
      component.componentWillUnmount && component.componentWillUnmount();
    }
  }
}

export default ReactComponent
