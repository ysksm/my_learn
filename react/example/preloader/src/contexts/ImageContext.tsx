import { createContext, useState, useEffect, ReactNode, useContext } from 'react'
import reactLogo from '../assets/react.svg'
import viteLogo from '/vite.svg'

// Define image constants
const IMAGE_PATHS = {
  REACT_LOGO: reactLogo,
  VITE_LOGO: viteLogo
}

// Define the shape of our context
interface ImageContextType {
  isLoading: boolean
  loadingProgress: number
  preloadedImages: Record<string, string>
}

// Create the context with a default value
const ImageContext = createContext<ImageContextType>({
  isLoading: true,
  loadingProgress: 0,
  preloadedImages: {}
})

// Props for the ImageProvider component
interface ImageProviderProps {
  children: ReactNode
}

// Create the provider component
export const ImageProvider = ({ children }: ImageProviderProps) => {
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

  return (
    <ImageContext.Provider value={{ isLoading, loadingProgress, preloadedImages }}>
      {children}
    </ImageContext.Provider>
  )
}

// Custom hook to use the image context
export const useImages = () => useContext(ImageContext)

export default ImageContext
