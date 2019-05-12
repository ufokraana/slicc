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
var store = function (slice) {
    var state = slice.initialize();
    var listener;
    var setListener = function (newListener) { return (listener = newListener); };
    var trigger = function () { return listener && listener(state); };
    var primitives = {
        get: function () { return state; },
        set: function (newState) {
            state = newState;
            trigger();
            return state;
        },
        reset: function (delta) {
            state = __assign({}, slice.initialize(), delta);
            trigger();
            return state;
        },
        update: function (delta) {
            state = __assign({}, state, delta);
            trigger();
            return state;
        }
    };
    var actions = slice.makeActions(primitives);
    return {
        actions: actions,
        primitives: primitives,
        setListener: setListener
    };
};
exports["default"] = store;
