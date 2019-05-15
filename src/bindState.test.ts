import { bindState } from './bindState'
import { IStatePrimitives, Listener, makeState } from './makeState'

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

  let state: IStatePrimitives<IState>
  let bound: IStatePrimitives<IState['penguin']>
  let listener: Listener<IState>

  beforeEach(() => {
    listener = jest.fn()
    state = makeState(initialize, listener)

    bound = bindState('penguin', state, () => initialize().penguin)
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
      expect(state.get().penguin).toEqual({ drinks: 'beer', eats: 'ice cream' })
      expect(state.get().panda).toEqual(initialize().panda)
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
      state.update({
        panda: newPandaState
      })
      bound.reset()
      expect(state.get().panda).toEqual(newPandaState)
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
      expect(state.get().panda).toEqual(initialize().panda)
    })
    it(`returns the new substate`, () => {
      expect(bound.update({ drinks: 'beer' })).toEqual({
        eats: 'fish',
        drinks: 'beer'
      })
    })
  })
})
