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
var bindPrimitives = function (key, primitives, initialize) {
    var get = primitives.get, set = primitives.set;
    return {
        get: function () { return get()[key]; },
        set: function (state) {
            var _a;
            return set(__assign({}, get(), (_a = {}, _a[key] = state, _a)))[key];
        },
        reset: function (delta) {
            var _a;
            return set(__assign({}, get(), (_a = {}, _a[key] = __assign({}, initialize(), delta), _a)))[key];
        },
        update: function (delta) {
            var _a;
            var state = get()[key];
            return set(__assign({}, get(), (_a = {}, _a[key] = __assign({}, state, delta), _a)))[key];
        }
    };
};
exports["default"] = bindPrimitives;
