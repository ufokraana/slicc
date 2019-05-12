import { ISliceMap, IActionMap, IStorePrimitives, StateFromSlices, ActionsFromSlices } from "./interface";

import bindPrimitives from "./bindPrimitives";
import slice from "./slice";

/**
 * Combines a map of slice definitions into a single slice.
 *
 * @param slices Map of slice definitions to combine
 * @param makeActions Additional actions that run over the mapped state generated from the slices
 * 
 * @example
  ```
  const pandaSlice = slice( ... )
  const penguinSlice = slice( ... )
  const slothSlice = slice( ... )

  const combinedSlice = combine({
    panda: pandaSlice,
    penguin: penguinSlice,
    sloth: slothSlice
  })
  ```
 */
const combine = <
  Slices extends ISliceMap,
  MainActions extends IActionMap
>(
  slices: Slices,
  makeActions?: (
    prims: IStorePrimitives<StateFromSlices<Slices>>
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
      return Object.keys(slices).reduce(
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
        (makeActions ? makeActions(primitives) : {}) as MainActions &
          ActionsFromSlices<Slices>
      )
    }
  })
}

export default combine