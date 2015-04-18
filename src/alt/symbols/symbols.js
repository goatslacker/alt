import Symbol from 'es-symbol'

// action creator handler
export const ACTION_HANDLER = Symbol()

// the action's uid symbol for listening
export const ACTION_KEY = Symbol()

// the action's name
export const ACTION_UID = Symbol()

// store all of a store's listeners
export const ALL_LISTENERS = Symbol()

// event emitter instance
export const EE = Symbol()

// initial snapshot
export const INIT_SNAPSHOT = Symbol()

// last snapshot
export const LAST_SNAPSHOT = Symbol()

// all lifecycle listeners
export const LIFECYCLE = Symbol()

// store action listeners
export const LISTENERS = Symbol()

// public methods
export const PUBLIC_METHODS = Symbol()

// boolean if state has changed for emitting change event
export const STATE_CHANGED = Symbol()

// contains all state
export const STATE_CONTAINER = Symbol()
