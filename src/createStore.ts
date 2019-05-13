import {
  ISlice,
  StateFromSlice,
  ActionsFromSlice,
  IStore,
  Listener,
  IStorePrimitives
} from './interface'

export const createStore = <
  Slice extends ISlice<any, any>,
  State extends StateFromSlice<Slice>,
  Actions extends ActionsFromSlice<Slice>
>(
  slice: Slice
): IStore<State, Actions> => {
  let state = slice.initialize()

  let listenerTimeout: number | undefined
  let listener: Listener<State> | undefined
  let setListener = (newListener?: Listener<State>) => (listener = newListener)
  let listeners = new Set<Listener<State>>()
  const subscribe = (listener: Listener<State>) => {
    listeners.add(listener)
    return () => listeners.delete(listener)
  }
  let trigger = () => {
    if (listenerTimeout === undefined) {
      listenerTimeout = setTimeout(() => {
        listenerTimeout = undefined
        listeners.forEach(listener => listener(state))
        listener && listener(state)
      })
    }
  }

  let primitives: IStorePrimitives<State> = {
    get: () => state,
    set: (newState: State) => {
      state = newState
      trigger()
      return state
    },
    reset: delta => {
      state = { ...slice.initialize(), ...delta }
      trigger()
      return state
    },
    update: delta => {
      state = { ...state, ...delta }
      trigger()
      return state
    }
  }

  const actions = slice.makeActions(primitives)

  return {
    actions,
    primitives,
    setListener,
    subscribe
  }
}
