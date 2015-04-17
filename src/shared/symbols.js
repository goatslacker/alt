'use strict'
import Symbol from 'es-symbol'

export const ACTION_HANDLER = Symbol('action creator handler')
export const ACTION_KEY = Symbol('holds the actions uid symbol for listening')
export const ACTION_UID = Symbol('the actions uid name')
export const ALL_LISTENERS = Symbol('name of listeners')
export const EE = Symbol('event emitter instance')
export const INIT_SNAPSHOT = Symbol('init snapshot storage')
export const LAST_SNAPSHOT = Symbol('last snapshot storage')
export const LIFECYCLE = Symbol('store lifecycle listeners')
export const LISTENERS = Symbol('stores action listeners storage')
export const PUBLIC_METHODS = Symbol('store public method storage')
export const STATE_CHANGED = Symbol()
export const STATE_CONTAINER = Symbol('the state container')
