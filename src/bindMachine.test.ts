import { Machine, bindMachine, StateMap } from './bindMachine'

describe(`bindMachine`, () => {
  interface IShared {
    count: number
  }

  interface IRed extends IShared {
    state: 'red'
    goGreen: (state: IRed) => IGreen
    goPurple: (state: IRed) => IPurple
  }
  interface IGreen extends IShared {
    state: 'green'
    goRed: (state: IRed) => IRed
  }
  interface IPurple extends IShared {
    state: 'purple'
    eventually: Promise<(state: AnyState) => IRed>
    goGreen: (state: IPurple) => IGreen
  }

  type AnyState = IRed | IGreen | IPurple

  type TestMachine = Machine<AnyState, IRed>

  const machine: TestMachine = () => {
    const goGreen = ({ count }: IShared): IGreen =>
      ({
        state: 'green',
        goRed,
        count: count + 1
      } as const)

    const goRed = ({ count }: IShared): IRed => ({
      state: 'red',
      goGreen,
      goPurple,
      count: count + 1
    })

    const goPurple = ({ count }: IShared): IPurple => ({
      state: 'purple',
      count: count + 1,
      goGreen,
      eventually: new Promise(res => {
        setTimeout(() => {
          res(goRed)
        }, 1000)
      })
    })

    return {
      state: 'red',
      goGreen,
      goPurple,
      count: 0
    }
  }
  const path = 'test.machine.path'
  let listener = jest.fn()
  let boundMachine = bindMachine(machine, listener, path)

  beforeEach(() => {
    listener = jest.fn()
    boundMachine = bindMachine(machine, listener, path)
  })

  it(`initializes to the initial state and transitions when calling an action`, () => {
    expect(boundMachine).toEqual({
      state: 'red',
      count: 0,
      goGreen: expect.anything(),
      goPurple: expect.anything(),
      isCurrent: expect.anything()
    })
    expect(boundMachine.goGreen()).toEqual({
      state: 'green',
      count: 1,
      goRed: expect.anything(),
      isCurrent: expect.anything()
    })
  })
  it(`calls the listener with the next state and action path when transitioning`, () => {
    boundMachine.goGreen()
    expect(listener).toBeCalledWith(
      {
        state: 'green',
        count: 1,
        goRed: expect.anything(),
        isCurrent: expect.anything()
      },
      'red',
      'test.machine.path.goGreen'
    )
  })
  it(`throws an error if an action from a stale state is called`, () => {
    const staleAction = boundMachine.goGreen
    boundMachine.goGreen()

    expect(staleAction).toThrow()
  })
  it(`resolves top level promises into the next state`, async () => {
    const promise = boundMachine.goPurple().eventually

    const nextState = await promise

    expect(nextState).toEqual({
      state: 'red',
      count: 2,
      goGreen: expect.anything(),
      goPurple: expect.anything(),
      isCurrent: expect.anything()
    })

    expect(listener).toBeCalledWith(
      nextState,
      'purple',
      'test.machine.path.eventually'
    )
  })
  it(`provides a isCurrent method to check if the state is current`, () => {
    const newState = boundMachine.goGreen()
    expect(boundMachine.isCurrent()).toBe(false)
    expect(newState.isCurrent()).toBe(true)
  })
  it(`rejects promises that belong to a stale state`, () => {
    const nextState = boundMachine.goPurple()
    nextState.goGreen()
    expect(nextState.eventually).rejects.toBeInstanceOf(Error)
  })
})
