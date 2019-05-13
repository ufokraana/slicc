import { bindPrimitives } from './bindPrimitives'
import { IStorePrimitives } from './interface'

describe(`bindPrimitives`, () => {
  interface IState {
    penguin: {
      eats: string
      drinks: string
    }
    panda: {
      eats: string
      drinks: string
    }
  }
  const initialize = (): IState => ({
    penguin: { eats: 'fish', drinks: 'cafe mocha' },
    panda: { eats: 'bamboo', drinks: 'tea' }
  })
  let state: IState
  let primitives: IStorePrimitives<IState> = {
    get: () => state,
    set: newState => (state = newState),
    reset: delta => (state = { ...initialize(), ...delta }),
    update: delta => (state = { ...state, ...delta })
  }

  let bound: IStorePrimitives<IState['penguin']>

  beforeEach(() => {
    state = initialize()

    primitives = {
      get: () => state,
      set: newState => (state = newState),
      reset: delta => (state = { ...initialize(), ...delta }),
      update: delta => (state = { ...state, ...delta })
    }

    bound = bindPrimitives('penguin', primitives, () => initialize().penguin)
  })

  describe(`get()`, () => {
    it(`returns the correct subslice`, () => {
      expect(bound.get().drinks).toEqual('cafe mocha')
      expect(bound.get().eats).toEqual('fish')
    })
  })

  describe(`set(newState)`, () => {
    it(`sets the correct subslice`, () => {
      bound.set({ drinks: 'beer', eats: 'ice cream' })
      expect(state.penguin).toEqual({ drinks: 'beer', eats: 'ice cream' })
      expect(state.panda).toEqual(initialize().panda)
    })
    it(`returns the updated slice`, () => {
      expect(bound.set({ drinks: 'beer', eats: 'ice cream' })).toEqual({
        drinks: 'beer',
        eats: 'ice cream'
      })
    })
  })

  describe(`reset(optionalDelta)`, () => {
    it(`resets the substate`, () => {
      bound.set({ drinks: 'beer', eats: 'ice cream' })
      bound.reset()
      expect(bound.get().drinks).toEqual('cafe mocha')
      expect(bound.get().eats).toEqual('fish')
    })
    it(`does not touch other substates`, () => {
      const newPandaState = { eats: 'cake', drinks: 'strawberry mango shake' }
      primitives.update({
        panda: newPandaState
      })
      bound.reset()
      expect(state.panda).toEqual(newPandaState)
    })
    it(`applies an update delta after the reset`, () => {
      bound.set({ drinks: 'beer', eats: 'ice cream' })
      bound.reset({ drinks: 'sake' })
      expect(bound.get().drinks).toEqual('sake')
      expect(bound.get().eats).toEqual('fish')
    })
    it(`returns the substate`, () => {
      bound.set({ drinks: 'beer', eats: 'ice cream' })
      expect(bound.reset({ drinks: 'sake' })).toEqual({
        eats: 'fish',
        drinks: 'sake'
      })
    })
  })

  describe(`update(delta)`, () => {
    it(`applies an update to the bound state`, () => {
      bound.update({ drinks: 'beer' })
      expect(bound.get().drinks).toEqual('beer')
      expect(bound.get().eats).toEqual('fish')
    })
    it(`does not touch other substates`, () => {
      bound.update({ drinks: 'beer' })
      expect(state.panda).toEqual(initialize().panda)
    })
    it(`returns the new substate`, () => {
      expect(bound.update({ drinks: 'beer' })).toEqual({
        eats: 'fish',
        drinks: 'beer'
      })
    })
  })
})
