import { Machine } from "./bindMachine";
import { statement } from "@babel/template";

interface IMachineMap {
  [key: string]: Machine<any, any>
}

interface IActionMap {
  [key: string]: 
}

type MachineStateMap<Machines extends IMachineMap> = {
  [key in keyof Machines]: Machines[key] extends Machine<infer State, any> ? State : never
}

interface ICombinedMachineState<Machines extends IMachineMap> {
  state: 'only',
} 
export const mapMachines = <MachineMap extends IMachineMap>(machineMap: MachineMap): Machine => () => {

}