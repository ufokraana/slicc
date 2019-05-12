export interface IStorePrimitives<State> {
    get: () => Readonly<State>;
    update: (delta: Partial<State>) => State;
    set: (state: State) => State;
    reset: (delta?: Partial<State>) => State;
}
export interface IActionMap {
    [key: string]: ((...args: any[]) => any) | IActionMap;
}
export interface ISlice<State, Actions extends IActionMap> {
    initialize: () => State;
    makeActions: (prims: IStorePrimitives<State>) => Actions;
}
export interface ISliceMap {
    [key: string]: ISlice<any, any>;
}
export declare type StateFromSlice<Slice> = Slice extends ISlice<infer State, any> ? State : never;
export declare type StateFromSlices<Slices extends ISliceMap> = {
    [key in keyof Slices]: StateFromSlice<Slices[key]>;
};
export declare type ActionsFromSlice<Slice> = Slice extends ISlice<any, infer Actions> ? Actions : never;
export declare type ActionsFromSlices<Slices extends ISliceMap> = {
    [key in keyof Slices]: ActionsFromSlice<Slices[key]>;
};
export declare type Listener<State> = (state: State) => void;
export interface IStore<State, Actions> {
    primitives: IStorePrimitives<State>;
    actions: Actions;
    setListener: (listener?: Listener<State>) => void;
}
