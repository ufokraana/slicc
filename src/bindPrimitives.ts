import { IStorePrimitives } from "./interface";

/**
 * Returns a set of store primitives that act on the
 * state slice referenced by the key.
 * 
 * @param key - Key of the state slice to operate on
 * @param primitives - Store primitives that operate on the wider state
 * @param initialize - Function that returns the initial state for the state slice
 * @returns Store primitives that act on the referenced state slice.
 * 
 * @example
  ```
  const initPanda = () => ({likesBamboo: true})
  const pandaPrimitives = bindPrimitives('panda', primitives, initPanda)

  pandaPrimitives.get() === primitives.get()['panda'] // true
  pandaPrimitives.reset() // resets the state with initPanda
  ```
 */
const bindPrimitives = <
  Key extends string,
  SubState,
  State extends { [key in Key]: SubState },
  Initialize extends () => SubState
>(
  key: Key,
  primitives: IStorePrimitives<State>,
  initialize: Initialize
): IStorePrimitives<SubState> => {

  const {get, set} = primitives

  return {
    get: () => get()[key],

    set: state => set({
      ...get(),
      [key]: state
    })[key],

    reset: delta => set({
      ...get(),
      [key]: { ...initialize(), ...delta }
    })[key],

    update: delta => {
      const state = get()[key]
      return set({
        ...get(),
        [key]: { ...state, ...delta }
      })[key]
    }
  }
}

export default bindPrimitives