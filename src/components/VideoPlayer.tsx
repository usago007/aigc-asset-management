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
    <div className="rounded-2xl border border-gray-200 bg-white p-3 shadow-[0_10px_28px_rgba(15,23,42,0.04)] dark:border-gray-800 dark:bg-gray-900">
      <div
        className="relative w-full overflow-hidden rounded-2xl border border-gray-200 bg-gray-950 dark:border-gray-800"
        style={
          aspectRatio
            ? { aspectRatio: aspectRatio.replace(':', '/'), maxHeight: '480px' }
            : { maxHeight: '480px' }
        }
      >
        {isLoading && !hasError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gray-950">
            <Loader2 size={32} className="animate-spin text-gray-300" />
            <span className="body-muted">视频加载中...</span>
          </div>
        )}

        {hasError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gray-900">
            <AlertCircle size={32} className="text-error" />
            <span className="body-muted">视频加载失败</span>
            <span className="helper-text">请检查视频链接是否有效</span>
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
            <span className="badge border-white/15 bg-black/55 text-white">{aspectRatio}</span>
          </div>
        )}
      </div>
    </div>
  )
}
