import { IStateHandlers } from './bindMachine'

export interface IActionMap {
  [key: string]: ((...args: any[]) => any) | IActionMap
}

export interface ISlice<State, Actions extends IActionMap> {
  initialize: () => State
  makeActions: (handlers: IStateHandlers<State>) => Actions
}

/**
 * Creates a slice definition
 * 
 * @remarks
 * The entire reason for this function is to help
 * Typescript infer the types of the created slice.
 * It can be omitted (just create slices as plain objects), when Typescript is not in use.
 * 
 * @param slice - The slice to create
 * @returns The created slice
 * 
 * @example
  ```
  const counterSlice = slice({
    initialize: () => ({counter: 0}),
    makeActions: ({get, set}) => ({
      increment: () => {
        const counter = get().counter + 1
        update({ counter: counter })
      }
    })
  })
  ```
 */
export const makeSlice = <State, Actions extends IActionMap>(
  slice: ISlice<State, Actions>
) => slice
