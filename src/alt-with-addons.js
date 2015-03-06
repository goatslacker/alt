'use strict'

import Alt from './alt'
import ReactStateMagicMixin from '../mixins/ReactStateMagicMixin'
import ListenerMixin from '../mixins/ListenerMixin'
import FluxyMixin from '../mixins/FluxyMixin'
import Subscribe from '../mixins/Subscribe'
import ActionListeners from '../utils/ActionListeners'
import DispatcherRecorder from '../utils/DispatcherRecorder'
import makeFinalStore from '../utils/makeFinalStore'

Alt.addons = {
  ReactStateMagicMixin,
  ListenerMixin,
  FluxyMixin,
  Subscribe,
  ActionListeners,
  DispatcherRecorder,
  makeFinalStore
}

export default Alt
