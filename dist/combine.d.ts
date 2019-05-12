import { ISliceMap, IActionMap, IStorePrimitives, StateFromSlices, ActionsFromSlices } from "./interface";
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
declare const combine: <Slices extends ISliceMap, MainActions extends IActionMap>(slices: Slices, makeActions?: ((prims: IStorePrimitives<StateFromSlices<Slices>>) => MainActions) | undefined) => {
    initialize: () => StateFromSlices<Slices>;
    makeActions: (prims: IStorePrimitives<StateFromSlices<Slices>>) => MainActions & ActionsFromSlices<Slices>;
};
export default combine;
