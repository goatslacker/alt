import AltStore from './debug/AltStore'
import DebugActions from './debug/DebugActions'
import React from 'react'
import connectToStores from './connectToStores'

class StoreExplorer extends React.Component {
  constructor() {
    super()

    this.selectStore = this.selectStore.bind(this)
  }

  componentDidMount() {
    DebugActions.setAlt(this.props.alt)
  }

  selectStore(ev) {
    const data = ev.target.dataset
    const store = this.props.alt.stores[data.name]
    if (store) DebugActions.selectData(store.getState())
  }

  render() {
    return (
      <div>
        <h3>Stores</h3>
        <ul>
          {this.props.stores.map((store) => {
            return (
              <li
                key={store.displayName}
                onClick={this.selectStore}
                data-name={store.displayName}
                style={{ cursor: 'pointer' }}
              >
                {store.displayName}
              </li>
            )
          })}
        </ul>
      </div>
    )
  }
}

export default connectToStores({
  getPropsFromStores() {
    return {
      stores: AltStore.stores()
    }
  },

  getStores() {
    return [AltStore]
  }
}, StoreExplorer)
