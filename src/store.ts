import { ISlice, StateFromSlice, ActionsFromSlice, IStore, Listener, IStorePrimitives } from "./interface";

const store = <
  Slice extends ISlice<any, any>,
  State extends StateFromSlice<Slice>,
  Actions extends ActionsFromSlice<Slice>
>(
  slice: Slice
): IStore<State, Actions> => {
  let state = slice.initialize()

  let listener: Listener<State> | undefined
  let setListener = (newListener?: Listener<State>) => (listener = newListener)
  let trigger = () => listener && listener(state)

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
    setListener
  }
}

export default store