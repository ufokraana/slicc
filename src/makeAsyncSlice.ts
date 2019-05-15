import { makeSlice } from './makeSlice'

type DoneState<Args, Result> = {
  status: 'done'
  result: Result
  finishedAt: Date
  args: Args
}

type PromiseSliceState<Args, Result, Error> =
  | { status: 'idle' }
  | {
      lastResult?: DoneState<Args, Result>
      args: Args
    } & (
      | {
          status: 'doing'
          promise: Promise<PromiseSliceState<Args, Result, Error>>
        }
      | { status: 'failed'; error: Error }
      | DoneState<Args, Result>)

export const makeAsyncSlice = <Args extends any[], Result, Error>(
  promiser: (...args: Args) => Promise<Result>
) =>
  makeSlice({
    initialize: (): PromiseSliceState<Args, Result, Error> => ({
      status: 'idle'
    }),
    makeActions: ({ get, set, reset }) => ({
      reset,
      start: (...args: Args) => {
        const state = get()

        let lastResult: DoneState<Args, Result> | undefined = undefined

        if (state.status === 'doing') {
          throw new Error('AsyncSlice started whilst already in progress.')
        } else if (state.status === 'done') {
          let { lastResult: discard, ...currentResult } = state
          lastResult = currentResult
        }

        const promise = promiser(...args)
          .then(result => {
            return set({
              status: 'done',
              finishedAt: new Date(),
              result,
              args,
              lastResult
            })
          })
          .catch((error: Error) => {
            return set({ status: 'failed', error, args, lastResult })
          })

        set({ status: 'doing', promise, args, lastResult })
      }
    })
  })
