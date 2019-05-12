"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
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
exports["default"] = (function (slice) { return (__assign({}, slice)); });
