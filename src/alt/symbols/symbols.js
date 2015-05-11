import Symbol from 'es-symbol'

// per instance registry of actions
export const ACTIONS_REGISTRY = Symbol()

// store all of a store's listeners
export const ALL_LISTENERS = Symbol()

// are we handling our own errors
export const HANDLING_ERRORS = Symbol()

// all lifecycle listeners
export const LIFECYCLE = Symbol()

// store action listeners
export const LISTENERS = Symbol()

// public methods
export const PUBLIC_METHODS = Symbol()

// contains all state
export const STATE_CONTAINER = Symbol()
