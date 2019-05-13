import { IStore } from '../interface'
import { useRef, useState, useEffect } from 'react'

export default <State, Actions>(store: IStore<State, Actions>) => {
  /**
   * Returns the store's action map
   */
  const useActions = () => store.actions
  /**
   * Returns the store's primitves' set
   */
  const usePrimitives = () => store.primitives
  /**
   * 
   * @param mapState - Function to retrieve the relevant section of the state
   * @remark
   * To avoid needless rerenders, return an unmodified subsection of the state
   * 
   * @example
    ```
    // General usage
    useStoreState((state) => state.penguin.name)

    // Avoid doing this
    useStoreState((state) => ({
      pandaName: state.panda.name
      penguinName: state.penguin.name
    }))

    // Do this instead
    const combined = {
      penguinName: useStoreState(state => state.penguin.name)
      pandaName: useStoreState(state => state.panda.name)
    }
    ```
   */
  const useStoreState = <Result>(mapState: (state: State) => Result) => {
    const mapStateRef = useRef(mapState)
    mapStateRef.current = mapState

    const result = mapState(store.primitives.get())
    const [lastResult, setLastResult] = useState(result)

    useEffect(
      () =>
        store.subscribe(state => {
          const newResult = mapStateRef.current(state)
          setLastResult(newResult)
        }),
      []
    )

    return result
  }
}
