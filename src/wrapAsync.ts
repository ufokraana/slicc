import { Machine } from './bindMachine'

type Start<Args extends any[], Result> = (
  state: AnyState<Args, Result>,
  ...args: Args
) => IDoing<Args, Result>

interface IIdle<Args extends any[], Result> {
  state: 'idle'
  start: Start<Args, Result>
}
interface IDoing<Args extends any[], Result> {
  state: 'doing'
  promise: Promise<() => IDone<Args, Result> | IFailed<Args, Result>>
}
interface IDone<Args extends any[], Result> {
  state: 'done'
  start: Start<Args, Result>
  result: Result
}
interface IFailed<Args extends any[], Result> {
  state: 'failed'
  start: Start<Args, Result>
  error: any
}

type AnyState<Args extends any[], Result> =
  | IIdle<Args, Result>
  | IDoing<Args, Result>
  | IDone<Args, Result>
  | IFailed<Args, Result>

export const wrapAsync = <Args extends any[], Result>(
  promiser: (...args: Args) => Promise<Result>
) => {
  const machine: Machine<AnyState<Args, Result>, IIdle<Args, Result>> = () => {
    const start: Start<Args, Result> = (
      state: AnyState<Args, Result>,
      ...args
    ) => ({
      state: 'doing',
      promise: promiser(...args).then(
        result => () => done(result),
        error => () => fail(error)
      )
    })

    const done = (result: Result): IDone<Args, Result> => ({
      state: 'done',
      start,
      result
    })

    const fail = (error: any): IFailed<Args, Result> => ({
      state: 'failed',
      start,
      error
    })

    return {
      state: 'idle',
      start
    } as const
  }

  return machine
}
