import { useState } from 'react'
import { Loader2, AlertCircle } from 'lucide-react'

interface VideoPlayerProps {
  videoUrl: string
  aspectRatio?: string
}

export default function VideoPlayer({ videoUrl, aspectRatio }: VideoPlayerProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  return (
    <div className="card p-2">
      <div
        className="relative w-full rounded-lg overflow-hidden bg-black"
        style={
          aspectRatio
            ? { aspectRatio: aspectRatio.replace(':', '/'), maxHeight: '480px' }
            : { maxHeight: '480px' }
        }
      >
        {isLoading && !hasError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gray-900">
            <Loader2 size={32} className="text-primary-500 animate-spin" />
            <span className="text-sm text-gray-400">视频加载中...</span>
          </div>
        )}

        {hasError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gray-900">
            <AlertCircle size={32} className="text-error" />
            <span className="text-sm text-gray-400">视频加载失败</span>
            <span className="text-xs text-gray-500">请检查视频链接是否有效</span>
          </div>
        ) : null}

        <video
          src={videoUrl}
          controls
          className="w-full h-full object-contain"
          preload="metadata"
          onLoadedData={() => setIsLoading(false)}
          onError={() => { setHasError(true); setIsLoading(false) }}
        />

        {aspectRatio && (
          <div className="absolute top-2 right-2">
            <span className="badge badge-info">{aspectRatio}</span>
          </div>
        )}
      </div>
    </div>
  )
}
