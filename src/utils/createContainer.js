import React from 'react'

import {PENDING} from './sentinels'

function defaultPending() {
  return (<div />)
}

export default function createContainer(
  Component,
  {
    listenTo,
    props = {},
    pending = defaultPending
  }
) {
  const listenToArr = listenTo instanceof Array ? listenTo : [listenTo]

  return React.createClass({
    componentDidMount() {
      this.storeListeners = listenToArr.map(
        store => store.listen(this.onChange)
      )
    },

    componentWillUnmount() {
      this.storeListeners.forEach(unlisten => unlisten())
    },

    getInitialState() {
      return this.getState()
    },

    componentWillReceiveProps(nextProps) {
      // So getState will see new props.
      this.props = nextProps

      this.onChange()
    },

    onChange() {
      this.setState(this.getState())
    },

    getState() {
      const storeProps = {}
      let isPending = false

      Object.keys(props).forEach(propName => {
        const propValue = props[propName].call(this)

        storeProps[propName] = propValue
        if (propValue === PENDING) {
          isPending = true
        }
      })

      return {storeProps, isPending}
    },

    render() {
      if (this.state.isPending) {
        return pending.call(this)
      }

      return (
        <Component {...this.props} {...this.state.storeProps} />
      )
    }
  })
}
