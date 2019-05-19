import { wrapAsync } from './wrapAsync'
import { bindMachine } from './bindMachine'
import { stat } from 'fs'
import { start } from 'repl'

describe(`wrapAsync`, () => {
  let resolve: any
  let reject: any
  let promise: Promise<() => string>
  let idleState = wrapAsync(() => {
    promise = new Promise((res, rej) => {
      resolve = res
      reject = rej
    })

    return promise
  })()

  it(`initialises to an idle state`, () => {
    expect(idleState).toEqual({
      state: 'idle',
      start: expect.any(Function)
    })
  })

  it(`has a 'doing' state whilst the async function is in progress.`, () => {
    expect(idleState.start(idleState)).toEqual({
      state: 'doing',
      promise: expect.any(Promise)
    })
  })
  it(`resolves to a done state when the async function resolves`, async () => {
    const doingState = idleState.start(idleState)
    const promise = doingState.promise
    resolve('A mighty fine result')
    const thunk = await promise
    expect(thunk()).toEqual({
      state: 'done',
      result: 'A mighty fine result',
      start: expect.any(Function)
    })
  })

  it(`resolves to a fail state when the async function rejects`, async () => {
    const doingState = idleState.start(idleState)
    const promise = doingState.promise
    reject('A mighty sad rejection')
    const thunk = await promise
    expect(thunk()).toEqual({
      state: 'failed',
      error: 'A mighty sad rejection',
      start: expect.any(Function)
    })
  })
})
