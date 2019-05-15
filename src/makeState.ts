export interface IStateHandlers<State> {
  /**
   * Gets the current state from the store
   */
  get: () => State
  /**
   * Applies a partial update to the store's state.
   */
  update: (delta: Partial<State>) => State
  /**
   * Completely overwrites the store's state.
   */
  set: (state: State) => State
  /**
   * Uses the slice's initialize() function to reset the state.
   * Then, optionally, applies a partial update on top.
   */
  reset: (delta?: Partial<State>) => State
}

export type Listener<State> = (state: State) => void

export const makeState = <State>(
  initialize: () => State,
  listener: (state: State) => void
): IStateHandlers<State> => {
  let state = initialize()

  return {
    get: () => state,
    set: (newState: State) => {
      state = newState
      listener(state)
      return state
    },
    reset: delta => {
      state = { ...initialize(), ...delta }
      listener(state)
      return state
    },
    update: delta => {
      state = { ...state, ...delta }
      listener(state)
      return state
    }
  }
}
