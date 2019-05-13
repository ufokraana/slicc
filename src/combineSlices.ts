import {
  ISliceMap,
  IActionMap,
  IStorePrimitives,
  StateFromSlices,
  ActionsFromSlices
} from './interface'

import { bindPrimitives } from './bindPrimitives'
import { slice } from './createSlice'

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
    primsWithActions: IStorePrimitives<StateFromSlices<Slices>> & {
      actions: ActionsFromSlices<Slices>
    }
  ) => MainActions
) => {
  return slice({
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
          const boundPrimitives = bindPrimitives(
            key,
            primitives,
            slice.initialize
          )
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
