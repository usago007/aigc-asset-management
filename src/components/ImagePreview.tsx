import { useState, forwardRef } from 'react'
import { Loader2, AlertCircle, Maximize2 } from 'lucide-react'

interface ImagePreviewProps {
  src: string
  alt?: string
  className?: string
  placeholderSrc?: string
  onClick?: () => void
  showOverlay?: boolean
  aspectRatio?: string
}

const ImagePreview = forwardRef<HTMLImageElement, ImagePreviewProps>(
  ({ src, alt = '', className = '', placeholderSrc, onClick, showOverlay = true, aspectRatio }, ref) => {
    const [isLoading, setIsLoading] = useState(true)
    const [hasError, setHasError] = useState(false)

    return (
      <div
        className="relative w-full overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900"
        style={aspectRatio ? { aspectRatio } : undefined}
      >
        {isLoading && !hasError && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <Loader2 size={24} className="animate-spin text-gray-500 dark:text-gray-400" />
          </div>
        )}

        {hasError && placeholderSrc ? (
          <img
            src={placeholderSrc}
            alt={alt}
            className={`w-full h-full object-cover ${className}`}
            loading="lazy"
          />
        ) : hasError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <AlertCircle size={24} className="text-error" />
            <span className="helper-text">图片加载失败</span>
          </div>
        ) : null}

        <img
          ref={ref}
          src={src}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'} ${className}`}
          loading="lazy"
          onLoad={() => setIsLoading(false)}
          onError={() => { setHasError(true); setIsLoading(false) }}
        />

        {showOverlay && !isLoading && !hasError && onClick && (
          <div
            className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/0 opacity-0 transition-all duration-300 hover:bg-black/30 hover:opacity-100"
            onClick={onClick}
          >
            <div className="rounded-full border border-white/20 bg-white/20 p-2 backdrop-blur-sm transition-colors hover:bg-white/30">
              <Maximize2 size={16} className="text-white" />
            </div>
          </div>
        )}
      </div>
    )
  }
)

ImagePreview.displayName = 'ImagePreview'

export default ImagePreview
