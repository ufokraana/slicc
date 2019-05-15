import { combineSlices } from './combineSlices'
import { makeSlice } from './makeSlice'

const fakePrimitives = Symbol('fake primitives')
jest.mock('./bindPrimitives', () => {
  return {
    bindPrimitives: (key: string) => ({ key, fakePrimitives })
  }
})

describe(`combineSlices`, () => {
  const penguinSlice = makeSlice({
    initialize: () => ({ name: 'penguin' }),
    makeActions: primitives => ({
      returnFood: () => 'fish',
      spyOnPrimitives: () => primitives
    })
  })

  const pandaSlice = makeSlice({
    initialize: () => ({ name: 'panda' }),
    makeActions: primitives => ({
      returnFood: () => 'bamboo',
      spyOnPrimitives: () => primitives
    })
  })

  let combined: any
  let actions: any

  beforeEach(() => {
    combined = combineSlices({
      penguin: penguinSlice,
      panda: pandaSlice
    })
    actions = combined.makeActions({})
  })

  it(`combines initialize calls into a mapped state`, () => {
    const result = combined.initialize()

    expect(result).toEqual({
      panda: { name: 'panda' },
      penguin: { name: 'penguin' }
    })
  })

  it(`combines makeActions calls into a mapped action set`, () => {
    expect(actions.penguin.returnFood()).toEqual('fish')
    expect(actions.panda.returnFood()).toEqual('bamboo')
  })

  it(`uses bindPrimitives to supply each makeActions with substate primitives`, () => {
    expect(actions.penguin.spyOnPrimitives()).toEqual({
      key: 'penguin',
      fakePrimitives
    })

    expect(actions.panda.spyOnPrimitives()).toEqual({
      key: 'panda',
      fakePrimitives
    })
  })
})
