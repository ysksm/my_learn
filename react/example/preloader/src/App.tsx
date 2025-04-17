import { useState } from 'react'
import './App.css'
import { useImages } from './contexts/ImageContext'
import ImageDisplay from './components/ImageDisplay'

function App() {
  const [count, setCount] = useState(0)
  const { isLoading, loadingProgress, preloadedImages } = useImages()

  if (isLoading) {
    return (
      <div className="loading-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
        <p>Loading images... {loadingProgress}%</p>
        <div style={{ width: '200px', height: '20px', border: '1px solid #ccc', borderRadius: '10px', overflow: 'hidden' }}>
          <div style={{ width: `${loadingProgress}%`, height: '100%', backgroundColor: '#4caf50', transition: 'width 0.3s ease' }}></div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank" rel="noopener noreferrer">
          <img src={preloadedImages['VITE_LOGO']} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank" rel="noopener noreferrer">
          <img src={preloadedImages['REACT_LOGO']} className="logo react" alt="React logo" />
        </a>
      </div>
      
      <div style={{ marginTop: '2rem', padding: '1rem', border: '1px dashed #ccc', borderRadius: '8px' }}>
        <h2>Images from ImageDisplay Component</h2>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem' }}>
          <ImageDisplay imageKey="REACT_LOGO" size={80} alt="React Logo from Component" />
          <ImageDisplay imageKey="VITE_LOGO" size={80} alt="Vite Logo from Component" />
        </div>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
