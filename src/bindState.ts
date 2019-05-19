import { IStateHandlers } from './bindMachine'

/**
 * Returns a set of state primitives that act on the
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
export const bindState = <State, Key extends keyof State>(
  key: Key,
  { get: outerGet, update }: IStateHandlers<State>,
  initialize: () => State[Key]
): IStateHandlers<State[Key]> => {
  const get = () => outerGet()[key]

  // const set = state => update([key]: state)[key] should work,
  // but typescript mangles the 'key' in {[key]: state} into a string instead of keyof State
  const set = (state: State[Key]) => {
    const delta: Partial<State> = {}
    delta[key] = state
    return update(delta)[key]
  }

  return {
    get,
    set,
    reset: delta => set({ ...initialize(), ...delta }),
    update: delta => set({ ...get(), ...delta })
  }
}
