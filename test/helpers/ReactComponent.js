import { assign } from '../../utils/functions'

class ReactComponent {
  setState(state) {
    this.state = state
    this.render()
  }

  // Create the mocked component.
  static prepare(Component) {
    const builtInProto = Object.getOwnPropertyNames(Component.prototype)

    // A trolol way of doing the react <0.13 auto-binding.
    function AutoBoundComponent() {
      Component.call(this)

      builtInProto.forEach((method) => {
        if (typeof this[method] === 'function' && method !== 'constructor') {
          this[method] = this[method].bind(this)
        }
      })
    }
    AutoBoundComponent.prototype = Component.prototype

    // Move over the statics.
    if (Component.statics) {
      Object.keys(Component.statics).forEach((stat) => {
        Component[stat] = Component.statics[stat]
      })
    }

    return AutoBoundComponent
  }

  // A not at all react spec compliant way to test fake react components.
  static test(Component, testFn, props = {}) {
    // Prepare the class.
    const PreparedComponent = ReactComponent.prepare(Component)

    // Initialize the component.
    const component = new PreparedComponent()

    // Transfer over the mixins.
    if (Component.mixins) {
      Component.mixins.forEach((mixin) => {
        Object.keys(mixin).forEach((method) => {
          component[method] = mixin[method].bind(component)
        })
      })
    }

    // Call the lifecycle methods and the test function.
    try {
      let defaultProps = component.getDefaultProps
        ? component.getDefaultProps()
        : {}
      component.props = assign({}, defaultProps, props)

      component.state = component.getInitialState
        ? component.getInitialState()
        : {}

      component.componentWillMount && component.componentWillMount();
      component.componentDidMount && component.componentDidMount();

      testFn && testFn();
    } catch (e) {
      throw e;
    } finally {
      // End with last lifecycle method.
      component.componentWillUnmount && component.componentWillUnmount();
    }
  }
}

export default ReactComponent
