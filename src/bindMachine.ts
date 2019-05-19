type StripStateArg<Action> = Action extends (
  state: any,
  ...args: infer Args
) => infer NextState
  ? (...args: Args) => OuterState<NextState>
  : never

type DethunkifyPromise<P> = P extends Promise<
  (...args: any[]) => infer NextState
>
  ? Promise<OuterState<NextState>>
  : never

export type OuterState<Inner> = { isCurrent: () => boolean } & {
  [key in keyof Inner]: Inner[key] extends Function
    ? StripStateArg<Inner[key]>
    : Inner[key] extends Promise<any>
    ? DethunkifyPromise<Inner[key]>
    : Inner[key]
}

export type StateMap<Map> = { [key in keyof Map]: Map[key] & { state: key } }

type IWithStateKey = {
  state: string
}
export type Machine<
  AnyState extends IWithStateKey,
  InitialState extends AnyState
> = () => InitialState

export const bindMachine = <
  AnyState extends IWithStateKey,
  InitialState extends AnyState
>(
  machine: Machine<AnyState, InitialState>,
  listener: (
    state: OuterState<AnyState>,
    stateKey: string,
    path: string
  ) => void,
  path?: string
): OuterState<InitialState> => {
  if (!path) {
    path = ''
  } else {
    path = path + '.'
  }

  const bindState = <State extends AnyState>(
    innerState: State
  ): OuterState<State> => {
    const boundState = {} as any
    const newActions: Function[] = []
    const newPromises: Promise<any>[] = []

    Object.entries(innerState).forEach(([key, value]: [any, any]) => {
      if (value instanceof Function) {
        boundState[key] = bindAction(innerState.state, key, value) as any
        newActions.push(value)
      } else if (value instanceof Promise) {
        boundState[key] = bindPromise(innerState.state, key, value) as any
        newPromises.push(value)
      } else {
        boundState[key] = value
      }
    })

    boundState.isCurrent = () => innerState === state;
    currentActions = newActions
    currentPromises = newPromises
    return boundState as OuterState<State>
  }

  const bindAction = (
    stateKey: string,
    key: string,
    action: Function
  ): Function => {
    return (...args: any[]) => {
      if (currentActions.includes(action)) {
        state = action(state, ...args)
        outerState = bindState(state)
        listener(outerState, stateKey, path + key)
        return outerState
      } else {
        throw new Error(`Stale action ${path + key} called.`)
      }
    }
  }
  const bindPromise = <State extends AnyState>(
    stateKey: string,
    key: string,
    promise: Promise<() => State>
  ): Promise<any> => {
    return new Promise((resolve, reject) => {
      const boundResolve = (stateThunk: (state: AnyState) => State) => {
        if (currentPromises.includes(promise)) {
          state = stateThunk(state)
          outerState = bindState(state)
          listener(outerState, stateKey, path + key)
          resolve(outerState)
        } else {
          reject(new Error(`Stale promise ${path + key} resolved.`))
        }
      }
      promise.then(boundResolve, boundResolve)
    })
  }

  let state: AnyState = machine()
  let outerState: OuterState<AnyState> = bindState(state)
  let currentActions: Function[]
  let currentPromises: Promise<() => any>[]

  return outerState as OuterState<InitialState>
}
