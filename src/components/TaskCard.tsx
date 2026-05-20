import type { ReactNode } from 'react'
import { Play, Download, Eye, AlertCircle, RefreshCw, Zap } from 'lucide-react'
import type { VideoGenerationTask } from '@/types/generation'
import { formatDate } from '@/utils/date'
import { Button } from '@/components/ui/button'

interface TaskCardProps {
  task: VideoGenerationTask
  onViewDetail: () => void
  onDownload?: () => void
  onCancel?: () => void
  onRetry?: () => void
  extraActions?: ReactNode
}

function getStatusBadge(status: VideoGenerationTask['status']) {
  const config = {
    in_queue: { label: '排队中', className: 'badge-warning', icon: null },
    generating: { label: '生成中', className: 'badge-info', icon: <Play size={12} /> },
    done: { label: '完成', className: 'badge-success', icon: null },
    failed: { label: '失败', className: 'badge-error', icon: <AlertCircle size={12} /> },
    cancelled: { label: '已取消', className: 'badge-secondary', icon: null },
    submitting: { label: '提交中', className: 'badge-info', icon: null },
    not_found: { label: '未找到', className: 'badge-error', icon: <AlertCircle size={12} /> },
  } as const

  const normalizedStatus = status === 'expired' ? 'done' : status
  const { label, className, icon } = config[normalizedStatus] || config.not_found

  return (
    <span className={`badge ${className} gap-1`}>
      {icon}
      {label}
    </span>
  )
}

export default function TaskCard({ task, onViewDetail, onDownload, onCancel, onRetry, extraActions }: TaskCardProps) {
  return (
    <div className="page-section-tight space-y-4">
      {task.videoUrl && (
        <div className="media-tile" style={{ aspectRatio: task.aspectRatio?.replace(':', '/') || '16/9', maxHeight: '160px' }}>
          <video src={task.videoUrl} className="w-full h-full object-contain" muted />
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="body-text line-clamp-2">{task.prompt}</p>
            <p className="helper-text">
              {task.mode === 'text-to-video' ? '文生视频' : '图生视频'} · {task.aspectRatio}
            </p>
          </div>
          {getStatusBadge(task.status)}
        </div>

        {(task.status === 'in_queue' || task.status === 'generating') && (
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                task.status === 'in_queue'
                  ? 'w-1/2 animate-pulse bg-gray-500'
                  : 'bg-gray-950 dark:bg-white'
              }`}
              style={task.status === 'generating' && task.progress ? { width: `${task.progress}%` } : undefined}
            />
          </div>
        )}

        {task.status === 'generating' && task.progress != null && (
          <p className="helper-text">{task.progress}%</p>
        )}

        {task.status === 'failed' && task.errorMessage && (
          <p className="flex items-center gap-1 text-xs text-error">
            <AlertCircle size={12} />
            {task.errorMessage}
          </p>
        )}

        {task.status === 'done' && task.tokensUsed != null && task.tokensUsed > 0 && (
          <p className="helper-text flex items-center gap-1">
            <Zap size={12} />
            消耗 Token: {task.tokensUsed.toLocaleString()}
          </p>
        )}

        <div className="helper-text flex items-center justify-between">
          <span>{task.timeElapsed ? `已用 ${task.timeElapsed}` : ''}</span>
          {task.completedAt && <span>{formatDate(task.completedAt, 'full')}</span>}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-gray-200 pt-3 dark:border-gray-800">
        <Button onClick={onViewDetail} variant="outline" size="sm" className="gap-1">
          <Eye size={14} />
          详情
        </Button>

        {task.status === 'done' && onDownload && (
          <Button onClick={onDownload} size="sm" className="gap-1">
            <Download size={14} />
            下载
          </Button>
        )}

        {task.status === 'in_queue' && onCancel && (
          <Button onClick={onCancel} variant="destructive" size="sm">
            取消
          </Button>
        )}

        {task.status === 'failed' && onRetry && (
          <Button onClick={onRetry} size="sm" className="gap-1">
            <RefreshCw size={14} />
            重试
          </Button>
        )}

        {extraActions}
      </div>
    </div>
  )
}
