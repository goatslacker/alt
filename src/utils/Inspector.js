/*eslint-disable */
import React from 'react'
import ViewerStore from './debug/ViewerStore'
import connectToStores from './connectToStores'

const Styles = {
  root: {
    font: '14px/1.4 Consolas, monospace',
  },

  line: {
    cursor: 'pointer',
    paddingLeft: '1em',
  },

  key: {
    color: '#656865',
  },

  string: {
    color: '#87af5f',
    cursor: 'text',
    marginLeft: '0.1em',
  },

  boolean: {
    color: '#f55e5f',
    cursor: 'text',
    marginLeft: '0.1em',
  },

  number: {
    color: '#57b3df',
    cursor: 'text',
    marginLeft: '0.1em',
  },

  helper: {
    color: '#b0b0b0',
    marginLeft: '0.1em',
  },
}

class Leaf extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      hidden: this.props.hidden
    }

    this.toggle = this._toggle.bind(this)
  }

  renderValue() {
    if (typeof this.props.data === 'object' && this.props.data) {
      if (this.state.hidden) {
        return null
      }

      return Object.keys(this.props.data).map((node, i) => {
        return (
          <Leaf
            key={i}
            label={node}
            data={this.props.data[node]}
            level={this.props.level + 1}
            hidden={this.props.level > 0}
          />
        )
      })
    } else {
      const jstype = typeof this.props.data

      return <span style={Styles[jstype]}>{String(this.props.data)}</span>
    }
  }

  renderPluralCount(n) {
    return n === 0
      ? ''
      : n === 1 ? '1 item' : `${n} items`
  }

  renderLabel() {
    const label = this.props.label || 'dispatch'

    const jstype = typeof this.props.data

    const type = jstype !== 'object'
      ? ''
      : Array.isArray(this.props.data) ? '[]' : '{}'

    const length = jstype === 'object' && this.props.data != null
      ? Object.keys(this.props.data).length
      : 0

    return (
      <span>
        <span style={Styles.key}>
          {label}:
        </span>
        <span style={Styles.helper}>
          {type}
          {' '}
          {this.renderPluralCount(length)}
        </span>
      </span>
    )
  }

  _toggle() {
    this.setState({
      hidden: !this.state.hidden
    })
  }

  render() {
    return (
      <div style={Styles.line}>
        <span onClick={this.toggle}>
          {this.renderLabel()}
        </span>
        {this.renderValue()}
      </div>
    )
  }
}

Leaf.defaultProps = { hidden: true }

class Inspector extends React.Component {
  constructor() {
    super()
  }

  render() {
    return (
      <div styles={Styles.root}>
        <Leaf data={this.props.selectedData} hidden={false} level={0} />
      </div>
    )
  }
}

export default connectToStores({
  getPropsFromStores() {
    return ViewerStore.getState()
  },

  getStores() {
    return [ViewerStore]
  }
}, Inspector)
