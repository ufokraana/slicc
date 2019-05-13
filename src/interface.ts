export interface IStorePrimitives<State> {
  /**
   * Gets the current state from the store
   */
  get: () => Readonly<State>
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

export interface IActionMap {
  [key: string]: ((...args: any[]) => any) | IActionMap
}

export interface ISlice<State, Actions extends IActionMap> {
  initialize: () => State
  makeActions: (prims: IStorePrimitives<State>) => Actions
}

export interface ISliceMap {
  [key: string]: ISlice<any, any>
}

export type StateFromSlice<Slice> = Slice extends ISlice<infer State, any>
  ? State
  : never

export type StateFromSlices<Slices extends ISliceMap> = {
  [key in keyof Slices]: StateFromSlice<Slices[key]>
}

export type ActionsFromSlice<Slice> = Slice extends ISlice<any, infer Actions>
  ? Actions
  : never

export type ActionsFromSlices<Slices extends ISliceMap> = {
  [key in keyof Slices]: ActionsFromSlice<Slices[key]>
}

export type Listener<State> = (state: State) => void

export interface IStore<State, Actions> {
  /**
   * Primitives used for managing the store's state.
   * @see IStorePrimitives
   */
  primitives: IStorePrimitives<State>
  /**
   * A map of actions provided by the input slice.
   */
  actions: Actions
  /**
   * @deprecated
   * @see setListener
   */
  setListener: (listener?: Listener<State>) => void
  /**
   * Subscribes a listener for state changes
   *
   * @remark
   * Slicc defers listener calls with a setTimeout.
   * If the state is changed multiple times per "frame",
   * the listeners will still be triggered once.
   *
   * @param listener - Function that gets called with the new state when the state changes.
   *
   * @returns A function that unsubscribes the listener.
   */
  subscribe: (listener: Listener<State>) => () => void
}
