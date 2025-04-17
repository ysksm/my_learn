import { useImages } from '../contexts/ImageContext'

interface ImageDisplayProps {
  imageKey: string
  size?: number
  alt?: string
}

const ImageDisplay = ({ imageKey, size = 100, alt = 'Image' }: ImageDisplayProps) => {
  const { preloadedImages, isLoading } = useImages()
  
  if (isLoading) {
    return <div>Loading image...</div>
  }
  
  if (!preloadedImages[imageKey]) {
    return <div>Image not found: {imageKey}</div>
  }
  
  return (
    <div style={{ margin: '20px 0' }}>
      <img 
        src={preloadedImages[imageKey]} 
        alt={alt} 
        style={{ 
          width: `${size}px`, 
          height: `${size}px`,
          objectFit: 'contain'
        }} 
      />
      <p style={{ fontSize: '14px', color: '#666' }}>{imageKey}</p>
    </div>
  )
}

export default ImageDisplay
