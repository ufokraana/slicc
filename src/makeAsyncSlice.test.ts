import { makeAsyncSlice } from './makeAsyncSlice'
import { IStateHandlers, makeState } from './makeState'

describe(`makeAsyncSlice`, () => {
  type Result = { name: string; food: string }
  type Error = { code: number }
  let mockPromiser = jest.fn<Promise<Result>, [string, string]>()
  let slice = makeAsyncSlice(mockPromiser)
  let { initialize, makeActions } = slice
  let listener = jest.fn<void, [ReturnType<typeof initialize>]>()
  let state = makeState(initialize, listener)
  let actions = makeActions(state)

  beforeEach(() => {
    mockPromiser = jest.fn()
    slice = makeAsyncSlice(mockPromiser)
    makeActions = slice.makeActions
    initialize = slice.initialize
    listener = jest.fn()
    state = makeState(initialize, listener)
    actions = makeActions(state)
  })

  it(`initializes to an idle state`, () => {
    expect(state.get()).toEqual({ status: 'idle' })
  })

  it(`has a reset action`, () => {
    actions.reset()
    expect(listener).toBeCalledWith({ status: 'idle' })
  })

  it(`updates state according to lifetime`, async () => {
    const result = { name: 'penguin', food: 'fish' }
    const promise = Promise.resolve(result)

    mockPromiser.mockReturnValue(promise)

    actions.start('arg1', 'arg2')

    expect(state.get()).toEqual({
      status: 'doing',
      args: ['arg1', 'arg2'],
      lastResult: undefined,
      promise: promise
    })

    await promise

    expect(state.get()).toEqual({
      status: 'done',
      args: ['arg1', 'arg2'],
      lastResult: undefined,
      result,
      finishedAt: expect.anything()
    })
  })

  it(`sets error state on failure`, async () => {
    mockPromiser.mockRejectedValue({ code: 123 })

    actions.start('arg1', 'arg2')

    await (state.get() as any).promise

    expect(state.get()).toEqual({
      status: 'failed',
      args: ['arg1', 'arg2'],
      lastResult: undefined,
      error: {
        code: 123
      }
    })
  })

  it(`keeps last good result in lastResult whilst rerunning or on failure`, async () => {
    const result = { name: 'penguin', food: 'fish' }
    const error = { code: 123 }

    mockPromiser.mockResolvedValue(result)

    actions.start('arg1', 'arg2')

    await (state.get() as any).promise

    const lastResult = state.get()

    mockPromiser.mockRejectedValue(error)

    actions.start('arg1', 'arg2')

    await (state.get() as any).promise

    expect((state.get() as any).lastResult).toEqual(lastResult)
  })

  it(`throws an error if started a second time whilst running`, () => {
    const result = { name: 'penguin', food: 'fish' }

    mockPromiser.mockResolvedValue(result)

    actions.start('arg1', 'arg2')

    expect(actions.start).toThrowError('AsyncSlice started')
  })
})
