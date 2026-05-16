interface VideoPlayerProps {
  videoUrl: string
  aspectRatio?: string
}

export default function VideoPlayer({ videoUrl, aspectRatio }: VideoPlayerProps) {
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
        <video
          src={videoUrl}
          controls
          className="w-full h-full object-contain"
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
