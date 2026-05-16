import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGenerationStore } from '@/store/generationStore'
import { formatDate } from '@/utils/date'
import Pagination from '@/components/Pagination'
import { Search, Download, Eye, RefreshCw, Play, Loader2, AlertCircle, X } from 'lucide-react'
import type { TaskQueueStatus, GenerationMode, VideoGenerationTask } from '@/types/generation'

const statusMap: Record<TaskQueueStatus, { label: string; className: string }> = {
  submitting: { label: '提交中', className: 'badge-info' },
  in_queue: { label: '排队中', className: 'badge-warning' },
  generating: { label: '生成中', className: 'badge-info' },
  done: { label: '已完成', className: 'badge-success' },
  failed: { label: '失败', className: 'badge-error' },
  cancelled: { label: '已取消', className: 'badge-secondary' },
  expired: { label: '已过期', className: 'badge-error' },
  not_found: { label: '未找到', className: 'badge-warning' },
}

const modeMap: Record<GenerationMode, string> = {
  'text-to-video': '文生视频',
  'image-to-video-first': '首帧图生',
  'image-to-video-first-tail': '首尾帧图生',
}

const truncate = (text: string, maxLen = 60) =>
  text.length <= maxLen ? text : text.slice(0, maxLen) + '...'

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: '全部状态' },
  { value: 'done', label: '已完成' },
  { value: 'failed', label: '失败' },
  { value: 'expired', label: '已过期' },
  { value: 'in_queue', label: '排队中' },
  { value: 'generating', label: '生成中' },
]

const MODE_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: '全部模式' },
  { value: 'text-to-video', label: '文生视频' },
  { value: 'image-to-video-first', label: '首帧图生' },
  { value: 'image-to-video-first-tail', label: '首尾帧图生' },
]

const ACTIVE_STATUSES: TaskQueueStatus[] = ['submitting', 'in_queue', 'generating']

const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=640&h=360&fit=crop',
  'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=640&h=360&fit=crop',
  'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=640&h=360&fit=crop',
  'https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=640&h=360&fit=crop',
  'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=640&h=360&fit=crop',
]

function VideoThumbnailCard({
  task,
  onPlay,
  onViewDetail,
  onDownload,
  onRetry,
}: {
  task: VideoGenerationTask
  onPlay: () => void
  onViewDetail: () => void
  onDownload: () => void
  onRetry: () => void
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [hasError, setHasError] = useState(false)
  const isActive = ACTIVE_STATUSES.includes(task.status)
  const isDone = task.status === 'done'
  const isFailed = task.status === 'failed'

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true)
    if (videoRef.current && task.videoUrl) {
      videoRef.current.currentTime = 0
      videoRef.current.play().catch(() => {})
    }
  }, [task.videoUrl])

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false)
    if (videoRef.current) {
      videoRef.current.pause()
    }
  }, [])

  const thumbnailUrl = task.firstFrameUrl || PLACEHOLDER_IMAGES[task.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % PLACEHOLDER_IMAGES.length]

  return (
    <div
      className="card p-0 overflow-hidden group hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className="relative w-full bg-gray-900 cursor-pointer"
        style={{ aspectRatio: task.aspectRatio?.replace(':', '/') || '16/9' }}
        onClick={() => { if (isDone && task.videoUrl) onPlay() }}
      >
        {isDone && task.videoUrl && !hasError ? (
          <>
            <video
              ref={videoRef}
              src={task.videoUrl}
              className="w-full h-full object-cover"
              muted
              loop
              preload="metadata"
              playsInline
              onError={() => setHasError(true)}
            />
            {!isHovered && (
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/50 transition-all">
                <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/50">
                  <Play size={24} className="text-white ml-1" />
                </div>
              </div>
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 pointer-events-none">
              <div className="pointer-events-auto flex items-center gap-2">
                <button
                  className="p-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full transition-colors"
                  title="查看"
                  onClick={(e) => { e.stopPropagation(); onViewDetail() }}
                >
                  <Eye size={16} className="text-white" />
                </button>
                <button
                  className="p-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full transition-colors"
                  title="下载"
                  onClick={(e) => { e.stopPropagation(); onDownload() }}
                >
                  <Download size={16} className="text-white" />
                </button>
              </div>
            </div>
          </>
        ) : isDone && (!task.videoUrl || hasError) ? (
          <>
            <img
              src={thumbnailUrl}
              alt={task.prompt}
              className="w-full h-full object-cover opacity-60"
              loading="lazy"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="badge badge-warning">视频不可用</span>
            </div>
          </>
        ) : isActive ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gray-900">
            <Loader2 size={32} className="text-primary-500 animate-spin" />
            <span className="text-sm text-gray-400">
              {statusMap[task.status].label}
              {task.progress != null ? ` ${task.progress}%` : ''}
            </span>
            <div className="w-3/4 bg-gray-700 rounded-full h-1.5">
              <div
                className="h-1.5 rounded-full bg-primary-500 transition-all"
                style={{ width: `${task.progress || 20}%` }}
              />
            </div>
          </div>
        ) : isFailed ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-red-950/50">
            <AlertCircle size={32} className="text-error" />
            <span className="text-xs text-error px-2 text-center">{task.errorMessage || '生成失败'}</span>
          </div>
        ) : (
          <>
            <img
              src={thumbnailUrl}
              alt={task.prompt}
              className="w-full h-full object-cover opacity-40"
              loading="lazy"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-gray-400 text-sm">{statusMap[task.status].label}</span>
            </div>
          </>
        )}

        <div className="absolute top-2 left-2 flex gap-1">
          <span className={`badge ${statusMap[task.status].className} text-[10px] px-2 py-0.5`}>
            {statusMap[task.status].label}
          </span>
        </div>
        <div className="absolute top-2 right-2 flex gap-1">
          <span className="badge badge-secondary text-[10px] px-2 py-0.5 bg-black/50 text-white border-0">
            {modeMap[task.mode]}
          </span>
          <span className="badge badge-secondary text-[10px] px-2 py-0.5 bg-black/50 text-white border-0">
            {task.aspectRatio}
          </span>
        </div>

        {isDone && task.videoUrl && (
          <div className="absolute bottom-2 right-2">
            <span className="badge badge-info text-[10px] px-2 py-0.5 bg-black/50 text-white border-0">
              {task.frames}帧
            </span>
          </div>
        )}
      </div>

      <div className="p-3 space-y-2">
        <p className="text-xs text-gray-800 dark:text-gray-200 line-clamp-2 leading-relaxed" title={task.prompt}>
          {task.prompt}
        </p>
        <div className="flex items-center justify-between text-[10px] text-gray-500 dark:text-gray-400">
          <span>{formatDate(task.createdAt)}</span>
          {task.timeElapsed && <span>{task.timeElapsed}</span>}
        </div>
        <div className="flex items-center gap-1 pt-2 border-t border-gray-100 dark:border-gray-700/50">
          {isDone && task.videoUrl && (
            <button
              className="flex-1 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors flex items-center justify-center gap-1"
              title="查看"
              onClick={onViewDetail}
            >
              <Eye size={12} />
              查看
            </button>
          )}
          {isDone && task.videoUrl && (
            <button
              className="flex-1 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors flex items-center justify-center gap-1"
              title="下载"
              onClick={onDownload}
            >
              <Download size={12} />
              下载
            </button>
          )}
          {isFailed && (
            <button
              className="flex-1 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors flex items-center justify-center gap-1"
              title="重试"
              onClick={onRetry}
            >
              <RefreshCw size={12} />
              重试
            </button>
          )}
          {!isDone && !isFailed && (
            <button
              className="flex-1 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors flex items-center justify-center gap-1"
              title="查看详情"
              onClick={onViewDetail}
            >
              <Eye size={12} />
              详情
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function GenerationHistory() {
  const navigate = useNavigate()
  const { tasks, retryTask } = useGenerationStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [modeFilter, setModeFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [playVideoUrl, setPlayVideoUrl] = useState<string | null>(null)
  const pageSize = 12

  const filteredItems = useMemo(() => {
    return tasks.filter((task) => {
      const matchSearch =
        searchQuery === '' || task.prompt.toLowerCase().includes(searchQuery.toLowerCase())
      const matchStatus = statusFilter === 'all' || task.status === statusFilter
      const matchMode = modeFilter === 'all' || task.mode === modeFilter
      return matchSearch && matchStatus && matchMode
    })
  }, [tasks, searchQuery, statusFilter, modeFilter])

  const paginatedItems = useMemo(
    () => filteredItems.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [filteredItems, currentPage],
  )

  const handleDownload = (task: VideoGenerationTask) => {
    if (task.videoUrl) {
      const a = document.createElement('a')
      a.href = task.videoUrl
      a.download = `video_${task.taskId}.mp4`
      a.target = '_blank'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-gray-100">生成历史</h1>
      </div>

      <div className="card">
        <div className="flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
            <input
              type="text"
              placeholder="搜索提示词..."
              className="input-field pl-10"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
            />
          </div>
          <select
            className="input-field w-40"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setCurrentPage(1)
            }}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <select
            className="input-field w-40"
            value={modeFilter}
            onChange={(e) => {
              setModeFilter(e.target.value)
              setCurrentPage(1)
            }}
          >
            {MODE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {paginatedItems.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-gray-600 dark:text-gray-500">暂无数据</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedItems.map((task) => (
            <VideoThumbnailCard
              key={task.id}
              task={task}
              onPlay={() => task.videoUrl && setPlayVideoUrl(task.videoUrl)}
              onViewDetail={() => navigate(`/content/task/${task.id}`)}
              onDownload={() => handleDownload(task)}
              onRetry={() => retryTask(task.id)}
            />
          ))}
        </div>
      )}

      <Pagination
        currentPage={currentPage}
        pageSize={pageSize}
        totalItems={filteredItems.length}
        onPageChange={setCurrentPage}
      />

      {playVideoUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPlayVideoUrl(null)}
        >
          <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <video
              src={playVideoUrl}
              controls
              autoPlay
              className="w-full rounded-lg shadow-2xl"
              style={{ maxHeight: '80vh' }}
            />
            <button
              className="absolute -top-3 -right-3 p-2 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full shadow-lg transition-colors"
              onClick={() => setPlayVideoUrl(null)}
            >
              <X size={16} className="text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
