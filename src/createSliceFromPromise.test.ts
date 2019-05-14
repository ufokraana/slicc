import { createSliceFromPromise } from './createSliceFromPromise'
import { IStorePrimitives } from './interface'

describe(`createSliceFromPromise`, () => {
  let mockPrimitives = {
    get: jest.fn(),
    set: jest.fn(),
    reset: jest.fn(),
    update: jest.fn()
  }
  let mockPromiser = jest.fn()
  let slice = createSliceFromPromise(mockPromiser)
  let actions = slice.makeActions({} as any)

  beforeEach(() => {
    mockPrimitives = {
      get: jest.fn(),
      set: jest.fn(),
      reset: jest.fn(),
      update: jest.fn()
    }

    mockPromiser = jest.fn()

    slice = createSliceFromPromise(mockPromiser)
    actions = slice.makeActions(mockPrimitives)
  })

  it(`initializes to an idle state`, () => {
    expect(slice.initialize()).toEqual({ status: 'idle' })
  })
  it(`has a reset action`, () => {
    actions.reset()
    expect(mockPrimitives.reset).toBeCalled()
  })

  it(`sets the correct running state`, () => {
    const promise = new Promise(() => {})
    mockPromiser.mockReturnValueOnce(promise)

    mockPrimitives.get.mockReturnValue({ status: 'idle' })

    actions.start('arg1', 'arg2')

    expect(mockPrimitives.set).toBeCalledWith({
      status: 'doing',
      args: ['arg1', 'arg2'],
      promise
    })
  })
})
