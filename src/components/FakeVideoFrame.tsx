import { Maximize2, Play, Volume2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FakeVideoFrameProps {
  src?: string | null
  alt: string
  aspectRatio?: string
  className?: string
  imageClassName?: string
  durationLabel?: string
  modeLabel?: string
  showChrome?: boolean
}

export default function FakeVideoFrame({
  src,
  alt,
  aspectRatio = '16:9',
  className,
  imageClassName,
  durationLabel,
  modeLabel,
  showChrome = true,
}: FakeVideoFrameProps) {
  return (
    <div
      className={cn('relative isolate overflow-hidden bg-gray-950', className)}
      style={{ aspectRatio: aspectRatio.replace(':', '/') }}
    >
      {src ? (
        <img src={src} alt={alt} className={cn('h-full w-full object-cover', imageClassName)} loading="lazy" />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gray-900 text-center text-sm text-gray-400">
          暂无视频预览
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-black/35" />

      <div className="absolute left-4 top-4 flex flex-wrap gap-2">
        {modeLabel ? (
          <span className="rounded-full border border-white/10 bg-black/55 px-3 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
            {modeLabel}
          </span>
        ) : null}
        {aspectRatio ? (
          <span className="rounded-full border border-white/10 bg-black/45 px-3 py-1 text-[11px] font-medium text-white/90 backdrop-blur-sm">
            {aspectRatio}
          </span>
        ) : null}
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-white/18 text-white shadow-[0_18px_40px_rgba(15,23,42,0.3)] backdrop-blur-md">
          <Play size={24} className="ml-1 fill-current" />
        </div>
      </div>

      {showChrome ? (
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-4 border-t border-white/10 bg-black/50 px-4 py-3 text-white backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/16">
              <Play size={15} className="ml-0.5 fill-current" />
            </div>
            <div className="h-1.5 w-28 overflow-hidden rounded-full bg-white/20 sm:w-36">
              <div className="h-full w-1/3 rounded-full bg-white" />
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs font-medium text-white/85">
            {durationLabel ? <span>{durationLabel}</span> : null}
            <Volume2 size={14} />
            <Maximize2 size={14} />
          </div>
        </div>
      ) : null}
    </div>
  )
}
