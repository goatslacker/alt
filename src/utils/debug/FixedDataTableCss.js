import React, { Component } from 'react'

class FixedDataTableCss extends Component {
  shouldComponentUpdate() {
    return false
  }

  render() {
    return (
      <link
        rel="stylesheet"
        type="text/css"
        href="node_modules/fixed-data-table/dist/fixed-data-table.min.css"
      />
    )
  }
}

export default FixedDataTableCss
