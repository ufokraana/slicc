import { ISlice, StateFromSlice, ActionsFromSlice, IStore } from "./interface";
declare const store: <Slice extends ISlice<any, any>, State extends StateFromSlice<Slice>, Actions extends ActionsFromSlice<Slice>>(slice: Slice) => IStore<State, Actions>;
export default store;
