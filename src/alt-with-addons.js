'use strict'

import Alt from './alt'

import FluxyMixin from '../mixins/FluxyMixin'
import ListenerMixin from '../mixins/ListenerMixin'
import ReactStateMagicMixin from '../mixins/ReactStateMagicMixin'
import Subscribe from '../mixins/Subscribe'

import ActionListeners from '../utils/ActionListeners'
import DispatcherRecorder from '../utils/DispatcherRecorder'
import makeFinalStore from '../utils/makeFinalStore'
import AltContainer from '../components/altContainer'

Alt.addons = {
  ActionListeners,
  AltContainer,
  DispatcherRecorder,
  FluxyMixin,
  ListenerMixin,
  makeFinalStore,
  ReactStateMagicMixin,
  Subscribe
}

export default Alt
