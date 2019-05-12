import slice from "./slice";

type PromiseSliceState<Result, Error> =
  | { status: "idle" }
  | { status: "doing"; promise: Promise<PromiseSliceState<Result, Error>> }
  | { status: "done"; finishedAt: Date; result: Result }
  | { status: "failed"; error: Error }

const fromPromise = <Args extends any[], Result, Error>(
  promiser: (...args: Args) => Promise<Result>
) =>
  slice({
    initialize: (): PromiseSliceState<Result, Error> => ({ status: "idle" }),
    makeActions: ({ get, set, reset }) => ({
      clear: () => {
        reset()
      },
      start: (...args: Args) => {
        if (get().status === "doing") {
          throw new Error("PromiseSlice started when already in progress.")
        }
        const promise = promiser(...args)
          .then(result => {
            return set({ status: "done", finishedAt: new Date(), result })
          })
          .catch((error: Error) => {
            return set({ status: "failed", error })
          })
        set({ status: "doing", promise })
      }
    })
  })
