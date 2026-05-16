import { Play, Download, Eye, AlertCircle, RefreshCw } from 'lucide-react'
import type { VideoGenerationTask } from '@/types/generation'
import { formatDate } from '@/utils/date'

interface TaskCardProps {
  task: VideoGenerationTask
  onViewDetail: () => void
  onDownload?: () => void
  onCancel?: () => void
  onRetry?: () => void
}

function getStatusBadge(status: VideoGenerationTask['status']) {
  const config = {
    in_queue: { label: '排队中', className: 'badge-warning', icon: null },
    generating: { label: '生成中', className: 'badge-info', icon: <Play size={12} /> },
    done: { label: '完成', className: 'badge-success', icon: null },
    failed: { label: '失败', className: 'badge-error', icon: <AlertCircle size={12} /> },
    cancelled: { label: '已取消', className: 'badge-secondary', icon: null },
    expired: { label: '已过期', className: 'badge-error', icon: null },
    submitting: { label: '提交中', className: 'badge-info', icon: null },
    not_found: { label: '未找到', className: 'badge-error', icon: <AlertCircle size={12} /> },
  } as const

  const { label, className, icon } = config[status] || config.not_found

  return (
    <span className={`badge ${className} gap-1`}>
      {icon}
      {label}
    </span>
  )
}

export default function TaskCard({ task, onViewDetail, onDownload, onCancel, onRetry }: TaskCardProps) {
  return (
    <div className="card space-y-4">
      {task.videoUrl && (
        <div className="relative w-full rounded-lg overflow-hidden bg-black" style={{ aspectRatio: task.aspectRatio?.replace(':', '/') || '16/9', maxHeight: '160px' }}>
          <video src={task.videoUrl} className="w-full h-full object-contain" muted />
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-gray-300 line-clamp-2">{task.prompt}</p>
            <p className="text-xs text-gray-500">
              {task.mode === 'text-to-video' ? '文生视频' : '图生视频'} · {task.aspectRatio}
            </p>
          </div>
          {getStatusBadge(task.status)}
        </div>

        {(task.status === 'in_queue' || task.status === 'generating') && (
          <div className="w-full bg-gray-700 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                task.status === 'in_queue'
                  ? 'bg-warning/70 animate-pulse w-1/2'
                  : 'bg-info'
              }`}
              style={task.status === 'generating' && task.progress ? { width: `${task.progress}%` } : undefined}
            />
          </div>
        )}

        {task.status === 'generating' && task.progress != null && (
          <p className="text-xs text-gray-600 dark:text-gray-400">{task.progress}%</p>
        )}

        {task.status === 'failed' && task.errorMessage && (
          <p className="text-xs text-error flex items-center gap-1">
            <AlertCircle size={12} />
            {task.errorMessage}
          </p>
        )}

        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{task.timeElapsed ? `已用 ${task.timeElapsed}` : ''}</span>
          {task.completedAt && <span>{formatDate(task.completedAt, 'full')}</span>}
        </div>
      </div>

      <div className="flex items-center gap-2 pt-2 border-t border-gray-700/50">
        <button onClick={onViewDetail} className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1">
          <Eye size={14} />
          详情
        </button>

        {task.status === 'done' && onDownload && (
          <button onClick={onDownload} className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1">
            <Download size={14} />
            下载
          </button>
        )}

        {task.status === 'in_queue' && onCancel && (
          <button onClick={onCancel} className="btn-danger text-xs px-3 py-1.5">
            取消
          </button>
        )}

        {task.status === 'failed' && onRetry && (
          <button onClick={onRetry} className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1">
            <RefreshCw size={14} />
            重试
          </button>
        )}
      </div>
    </div>
  )
}
