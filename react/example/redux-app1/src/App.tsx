import './App.css'
import { useAppSelector, useAppDispatch } from './store/hooks'
import { increment } from './store/slices/counterSlice'

function App() {
  const count = useAppSelector((state) => state.counter.value)
  const model = useAppSelector((state) => state.model.root)
  const dispatch = useAppDispatch()

  return (
    <>

      <button onClick={() => dispatch({ type: 'model/create', payload: 'new account' })}>
        追加
      </button>
      {model.accounts.map((account) => (
        <div key={account.id}>
          {account.name}
        </div>
      ))}
      {/* <button onClick={() => dispatch(increment())}>
        count is {count}
      </button> */}
    </>
  )
}
export default App