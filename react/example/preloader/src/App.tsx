import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

// Define image constants
const IMAGE_PATHS = {
  REACT_LOGO: reactLogo,
  VITE_LOGO: viteLogo
}

function App() {
  const [count, setCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [preloadedImages, setPreloadedImages] = useState<Record<string, string>>({})
  const [loadingProgress, setLoadingProgress] = useState(0)

  useEffect(() => {
    // Helper function to create a delay
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    
    // Sequential image loading function
    const loadImagesSequentially = async () => {
      const imagesToLoad = [
        { key: 'REACT_LOGO', src: IMAGE_PATHS.REACT_LOGO },
        { key: 'VITE_LOGO', src: IMAGE_PATHS.VITE_LOGO }
      ]
      
      const loadedImages: Record<string, string> = {}
      
      // Load images one by one
      for (let i = 0; i < imagesToLoad.length; i++) {
        const { key, src } = imagesToLoad[i]
        
        // Update loading progress
        setLoadingProgress(Math.round(((i) / imagesToLoad.length) * 100))
        
        console.log(`Loading image: ${key}`)
        
        // Add a delay to make the sequential loading more visible (1 second)
        await delay(1000)
        
        // Load current image
        await new Promise<void>(resolve => {
          const img = new Image()
          img.onload = () => {
            console.log(`Image loaded: ${key}`)
            loadedImages[key] = src
            setPreloadedImages(prev => ({ ...prev, [key]: src }))
            resolve()
          }
          img.src = src
        })
      }
      
      // All images loaded
      setLoadingProgress(100)
      setIsLoading(false)
    }
    
    loadImagesSequentially()
  }, []) // Empty dependency array ensures this runs only once on mount

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
