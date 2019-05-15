
import { bindState } from './bindState'
import { makeSlice, ISlice, IActionMap } from './makeSlice'
import { IStateHandlers } from './makeState'

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


/**
 * Combines a map of slice definitions into a single slice.
 *
 * @param slices Map of slice definitions to combine
 * @param makeActions
 * Additional actions that run over the mapped state generated from the slices
 * Note that in addition to the store primitives, you also get access to the
 * action map of the combined slice.
 * 
 * @example
  ```
  const pandaSlice = createSlice( ... )
  const penguinSlice = createSlice( ... )
  const slothSlice = createSlice( ... )

  const combinedSlice = combine({
    panda: pandaSlice,
    penguin: penguinSlice,
    sloth: slothSlice
  }, (prims) => ({
    doEverything: () => {
      prims.actions.panda.somePandaAction()
      prims.actions.penguin.somePenguinAction()
      prims.actions.sloth.someSlothAction()
    }
  })
  ```
 */
export const combineSlices = <
  Slices extends ISliceMap,
  MainActions extends IActionMap
>(
  slices: Slices,
  makeActions?: (
    handlersAndActions: IStateHandlers<StateFromSlices<Slices>> & {
      actions: ActionsFromSlices<Slices>
    }
  ) => MainActions
) => {
  return makeSlice({
    initialize: () => {
      return Object.entries(slices).reduce(
        (state, [key, slice]) => {
          state[key] = slice.initialize()
          return state
        },
        {} as StateFromSlices<Slices>
      )
    },
    makeActions: primitives => {
      const { get, set } = primitives
      const actions = Object.keys(slices).reduce(
        (actions, key) => {
          const slice = slices[key]
          const boundPrimitives = bindState(key, primitives, slice.initialize)
          actions[key] = slice.makeActions(boundPrimitives)
          return actions
        },
        {} as ActionsFromSlices<Slices>
      )
      const ownActions = makeActions
        ? makeActions({ ...primitives, actions })
        : ({} as MainActions)

      return {
        ...actions,
        ...ownActions
      }
    }
  })
}

export const combine = combineSlices
