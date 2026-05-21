import FakeVideoFrame from '@/components/FakeVideoFrame'

interface VideoPlayerProps {
  videoUrl: string
  aspectRatio?: string
}

export default function VideoPlayer({ videoUrl, aspectRatio }: VideoPlayerProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-3 shadow-[0_10px_28px_rgba(15,23,42,0.04)] dark:border-gray-800 dark:bg-gray-900">
      <FakeVideoFrame
        src={videoUrl}
        alt="视频预览"
        aspectRatio={aspectRatio}
        className="w-full rounded-2xl border border-gray-200 dark:border-gray-800"
      />
    </div>
  )
}
