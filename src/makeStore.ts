import { ISlice, StateFromSlice, ActionsFromSlice } from './interface'
import { makeState, IStatePrimitives } from './makeState'

export interface IStore<State, Actions> {
  /**
   * Primitives used for managing the store's state.
   * @see IStorePrimitives
   */
  primitives: IStatePrimitives<State>
  /**
   * A map of actions provided by the input slice.
   */
  actions: Actions
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

export const createStore = <
  Slice extends ISlice<any, any>,
  State = StateFromSlice<Slice>,
  Actions = ActionsFromSlice<Slice>
>({
  initialize,
  makeActions
}: Slice): IStore<State, Actions> => {
  let listenerTimeout: number | undefined
  let listeners = new Set<Listener<State>>()

  let trigger = () => {
    if (listenerTimeout === undefined) {
      listenerTimeout = setTimeout(() => {
        const state = primitives.get()
        listenerTimeout = undefined
        listeners.forEach(listener => listener(state))
      })
    }
  }

  const subscribe = (listener: Listener<State>) => {
    listeners.add(listener)
    return () => listeners.delete(listener)
  }

  const primitives = makeState(initialize, trigger)

  const actions = slice.makeActions(primitives)

  return {
    actions,
    primitives,
    subscribe
  }
}
