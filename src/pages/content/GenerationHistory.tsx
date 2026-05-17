import { useState, useMemo, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store/appStore'
import { useGenerationStore } from '@/store/generationStore'
import { formatDate } from '@/utils/date'
import Pagination from '@/components/Pagination'
import TimelineGrid from '@/components/TimelineGrid'
import { Search, Download, RefreshCw, Maximize2, Trash2, Eye, Play, Loader2, AlertCircle, X } from 'lucide-react'
import type { ImageGenerationMode, TaskQueueStatus, VideoGenerationTask, GenerationMode } from '@/types/generation'

const statusMap: Record<TaskQueueStatus, { label: string; className: string }> = {
  submitting: { label: '提交中', className: 'badge-info' },
  in_queue: { label: '排队中', className: 'badge-warning' },
  generating: { label: '生成中', className: 'badge-info' },
  done: { label: '已完成', className: 'badge-success' },
  failed: { label: '失败', className: 'badge-error' },
  expired: { label: '已过期', className: 'badge-error' },
  not_found: { label: '未找到', className: 'badge-warning' },
  cancelled: { label: '已取消', className: 'badge-warning' },
}

const imageModeMap: Record<ImageGenerationMode, string> = {
  'text-to-image': '图片4.0',
  'image-to-image': '图生图',
  'text-to-image-31': '文生图3.1',
  'text-to-image-30': '文生图3.0',
  'text-to-image-21': '文生图2.1',
}

const videoModeMap: Record<GenerationMode, string> = {
  'text-to-video': '文生视频',
  'image-to-video-first': '首帧图生',
  'image-to-video-first-tail': '首尾帧图生',
  'action-imitation': '动作模仿',
  'digital-human-fast': '数字人快速模式',
}

const STATUS_OPTIONS: { value: TaskQueueStatus | ''; label: string }[] = [
  { value: '', label: '全部状态' },
  { value: 'done', label: '已完成' },
  { value: 'generating', label: '生成中' },
  { value: 'failed', label: '失败' },
  { value: 'in_queue', label: '排队中' },
]

const IMAGE_MODE_OPTIONS: { value: ImageGenerationMode | ''; label: string }[] = [
  { value: '', label: '全部模式' },
  { value: 'text-to-image', label: '图片4.0' },
  { value: 'image-to-image', label: '图生图' },
  { value: 'text-to-image-31', label: '文生图3.1' },
  { value: 'text-to-image-30', label: '文生图3.0' },
  { value: 'text-to-image-21', label: '文生图2.1' },
]

const VIDEO_STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: '全部状态' },
  { value: 'done', label: '已完成' },
  { value: 'failed', label: '失败' },
  { value: 'expired', label: '已过期' },
  { value: 'in_queue', label: '排队中' },
  { value: 'generating', label: '生成中' },
]

const VIDEO_MODE_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: '全部模式' },
  { value: 'text-to-video', label: '文生视频' },
  { value: 'image-to-video-first', label: '首帧图生' },
  { value: 'image-to-video-first-tail', label: '首尾帧图生' },
]

const PLACEHOLDER_IMAGES = [
  'https://picsum.photos/seed/history1/640/360',
  'https://picsum.photos/seed/history2/640/360',
  'https://picsum.photos/seed/history3/640/360',
]

const TABS = [
  { key: 'image', label: '图片' },
  { key: 'video', label: '视频' },
] as const

type TabKey = typeof TABS[number]['key']

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
  const isActive = ['submitting', 'in_queue', 'generating'].includes(task.status)
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
              {statusMap[task.status as TaskQueueStatus]?.label}
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
              <span className="text-gray-400 text-sm">{statusMap[task.status as TaskQueueStatus]?.label}</span>
            </div>
          </>
        )}

        <div className="absolute top-2 left-2 flex gap-1">
          <span className={`badge ${statusMap[task.status as TaskQueueStatus]?.className} text-[10px] px-2 py-0.5`}>
            {statusMap[task.status as TaskQueueStatus]?.label}
          </span>
        </div>
        <div className="absolute top-2 right-2 flex gap-1">
          <span className="badge badge-secondary text-[10px] px-2 py-0.5 bg-black/50 text-white border-0">
            {videoModeMap[task.mode]}
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

function ImageTab() {
  const navigate = useNavigate()
  const { imageTasks, retryImageTask, deleteImageTask } = useAppStore()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<TaskQueueStatus | ''>('')
  const [modeFilter, setModeFilter] = useState<ImageGenerationMode | ''>('')
  const [page, setPage] = useState(1)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const perPage = 12

  const filtered = useMemo(() => {
    return imageTasks.filter((t) => {
      if (search && !t.prompt.toLowerCase().includes(search.toLowerCase())) return false
      if (statusFilter && t.status !== statusFilter) return false
      if (modeFilter && t.mode !== modeFilter) return false
      return true
    })
  }, [imageTasks, search, statusFilter, modeFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))
  const pageData = filtered.slice((page - 1) * perPage, page * perPage)

  const handleDownload = (url: string) => {
    const a = document.createElement('a')
    a.href = url
    a.download = 'generated_image.png'
    a.target = '_blank'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const timelineItems = useMemo(() => pageData.map((task) => {
    const imageUrl = task.outputImageUrls?.[0] || task.outputImageBase64?.[0] || ''
    return {
      id: task.id,
      imageUrl,
      prompt: task.prompt,
      createdAt: task.createdAt,
      badge: statusMap[task.status]?.label,
      badgeClassName: statusMap[task.status]?.className,
      onOpen: () => navigate(`/content/image-detail/${task.id}`),
      onDownload: () => imageUrl && handleDownload(imageUrl),
      onDelete: () => deleteImageTask(task.id),
    }
  }), [pageData, navigate, deleteImageTask])

  return (
    <div className="space-y-4">
      <div className="card">
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input
              className="input-field pl-10"
              placeholder="搜索Prompt..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            />
          </div>
          <select
            className="input-field w-40"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value as TaskQueueStatus | ''); setPage(1) }}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <select
            className="input-field w-40"
            value={modeFilter}
            onChange={(e) => { setModeFilter(e.target.value as ImageGenerationMode | ''); setPage(1) }}
          >
            {IMAGE_MODE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Timeline Grid */}
      <TimelineGrid
        items={timelineItems}
        columns={4}
        emptyMessage="暂无图片作品"
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-400">
            共 {filtered.length} 条，第 {page}/{totalPages} 页
          </div>
          <div className="flex gap-2">
            <button
              className="btn-secondary text-xs"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              上一页
            </button>
            <button
              className="btn-secondary text-xs"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              下一页
            </button>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setPreviewUrl(null)}>
          <div className="relative max-w-4xl max-h-full" onClick={(e) => e.stopPropagation()}>
            <img src={previewUrl} alt="" className="max-w-full max-h-[90vh] object-contain rounded-lg" />
            <button
              className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
              onClick={() => setPreviewUrl(null)}
            >
              <X size={16} className="text-white" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function VideoTab() {
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
      const matchSearch = searchQuery === '' || task.prompt.toLowerCase().includes(searchQuery.toLowerCase())
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

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize))

  return (
    <div className="space-y-4">
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
            {VIDEO_STATUS_OPTIONS.map((opt) => (
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
            {VIDEO_MODE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Video Cards Grid */}
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
              onViewDetail={() => navigate(`/content/video-detail/${task.id}`)}
              onDownload={() => handleDownload(task)}
              onRetry={() => retryTask(task.id)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          pageSize={pageSize}
          totalItems={filteredItems.length}
          onPageChange={setCurrentPage}
        />
      )}

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

export default function GenerationHistory() {
  const [activeTab, setActiveTab] = useState<TabKey>('image')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-gray-100">作品库</h1>
      </div>

      <div className="flex gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-accent-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'image' && <ImageTab />}
      {activeTab === 'video' && <VideoTab />}
    </div>
  )
}
