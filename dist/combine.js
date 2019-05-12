"use strict";
exports.__esModule = true;
var bindPrimitives_1 = require("./bindPrimitives");
var slice_1 = require("./slice");
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
var combine = function (slices, makeActions) {
    return slice_1["default"]({
        initialize: function () {
            return Object.entries(slices).reduce(function (state, _a) {
                var key = _a[0], slice = _a[1];
                state[key] = slice.initialize();
                return state;
            }, {});
        },
        makeActions: function (primitives) {
            var get = primitives.get, set = primitives.set;
            return Object.keys(slices).reduce(function (actions, key) {
                var slice = slices[key];
                var boundPrimitives = bindPrimitives_1["default"](key, primitives, slice.initialize);
                actions[key] = slice.makeActions(boundPrimitives);
                return actions;
            }, (makeActions ? makeActions(primitives) : {}));
        }
    });
};
exports["default"] = combine;
