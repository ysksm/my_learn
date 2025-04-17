import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [preloadedReactLogo, setPreloadedReactLogo] = useState<string | null>(null)
  const [preloadedViteLogo, setPreloadedViteLogo] = useState<string | null>(null)

  useEffect(() => {
    // Preload React logo
    const reactImage = new Image()
    reactImage.src = reactLogo
    
    // Preload Vite logo
    const viteImage = new Image()
    viteImage.src = viteLogo
    
    // Wait for both images to load
    Promise.all([
      new Promise(resolve => {
        reactImage.onload = () => {
          setPreloadedReactLogo(reactLogo)
          resolve(null)
        }
      }),
      new Promise(resolve => {
        viteImage.onload = () => {
          setPreloadedViteLogo(viteLogo)
          resolve(null)
        }
      })
    ]).then(() => {
      // All images loaded
      setIsLoading(false)
    })
  }, []) // Empty dependency array ensures this runs only once on mount

  if (isLoading) {
    return (
      <div className="loading-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Loading images...</p>
      </div>
    )
  }

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank" rel="noopener noreferrer">
          <img src={preloadedViteLogo!} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank" rel="noopener noreferrer">
          <img src={preloadedReactLogo!} className="logo react" alt="React logo" />
        </a>
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
