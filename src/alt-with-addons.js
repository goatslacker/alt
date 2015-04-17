'use strict'

import Alt from './alt'

import ActionListeners from '../utils/ActionListeners'
import AltManager from '../utils/AltManager'
import DispatcherRecorder from '../utils/DispatcherRecorder'

import atomicTransactions from '../utils/atomicTransactions'
import chromeDebug from '../utils/chromeDebug'
import makeFinalStore from '../utils/makeFinalStore'
import withAltContext from '../utils/withAltContext'

import AltContainer from '../AltContainer'

Alt.addons = {
  ActionListeners,
  AltContainer,
  AltManager,
  DispatcherRecorder,
  atomicTransactions,
  chromeDebug,
  makeFinalStore,
  withAltContext
}

export default Alt
