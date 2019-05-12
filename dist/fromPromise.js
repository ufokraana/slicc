"use strict";
exports.__esModule = true;
var slice_1 = require("./slice");
var fromPromise = function (promiser) {
    return slice_1["default"]({
        initialize: function () { return ({ status: "idle" }); },
        makeActions: function (_a) {
            var get = _a.get, set = _a.set, reset = _a.reset;
            return ({
                clear: function () {
                    reset();
                },
                start: function () {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i] = arguments[_i];
                    }
                    if (get().status === "doing") {
                        throw new Error("PromiseSlice started when already in progress.");
                    }
                    var promise = promiser.apply(void 0, args).then(function (result) {
                        return set({ status: "done", finishedAt: new Date(), result: result });
                    })["catch"](function (error) {
                        return set({ status: "failed", error: error });
                    });
                    set({ status: "doing", promise: promise });
                }
            });
        }
    });
};
