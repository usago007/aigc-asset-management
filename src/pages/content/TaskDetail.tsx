import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Download, RefreshCw, AlertCircle, Clock, Loader2, Video, Image } from 'lucide-react'
import { useGenerationStore } from '@/store/generationStore'
import VideoPlayer from '@/components/VideoPlayer'
import { formatDate } from '@/utils/date'
import { Button } from '@/components/ui/button'

const MODE_LABELS: Record<string, string> = {
  'text-to-video': '文生视频',
  'image-to-video-first': '首帧图生',
  'image-to-video-first-tail': '首尾帧图生',
}

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  submitting: { label: '提交中', className: 'badge-info' },
  in_queue: { label: '排队中', className: 'badge-info' },
  generating: { label: '生成中', className: 'badge-info' },
  done: { label: '已完成', className: 'badge-success' },
  failed: { label: '失败', className: 'badge-error' },
  expired: { label: '已过期', className: 'badge-warning' },
}

export default function TaskDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { tasks, updateTask } = useGenerationStore()

  const [timeRemaining, setTimeRemaining] = useState<string | null>(null)
  const [isExpired, setIsExpired] = useState(false)

  const task = tasks.find((t) => t.id === id)

  useEffect(() => {
    if (!task?.videoExpiresAt || task.status !== 'done') return

    const updateCountdown = () => {
      const remaining = new Date(task.videoExpiresAt!).getTime() - Date.now()
      if (remaining <= 0) {
        setIsExpired(true)
        updateTask(task.id, { status: 'expired' })
        setTimeRemaining(null)
        return
      }
      const minutes = Math.floor(remaining / 60000)
      const seconds = Math.floor((remaining % 60000) / 1000)
      setTimeRemaining(`${minutes}分${seconds}秒`)
    }

    updateCountdown()
    const timer = setInterval(updateCountdown, 1000)
    return () => clearInterval(timer)
  }, [task?.videoExpiresAt, task?.status, task?.id, updateTask])

  const handleDownload = useCallback(() => {
    if (!task?.videoUrl) return
    const a = document.createElement('a')
    a.href = task.videoUrl
    a.download = `video_${task.taskId}.mp4`
    a.click()
  }, [task])

  const handleRetry = useCallback(() => {
    if (!task) return
    updateTask(task.id, { status: 'expired' })
  }, [task, updateTask])

  if (!task) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-800 dark:text-gray-300">任务不存在或已被删除</p>
      </div>
    )
  }

  const statusInfo = STATUS_BADGE[task.status] || { label: task.status, className: 'badge-info' }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          onClick={() => navigate('/content/assets')}
          variant="ghost"
          size="icon"
        >
          <ArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
        </Button>
        <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-gray-100">任务详情</h1>
        <span className={`badge ${statusInfo.className}`}>{statusInfo.label}</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <span className="text-gray-700 dark:text-gray-400">任务ID</span>
          <p className="text-gray-800 dark:text-gray-200 font-mono text-xs mt-1">{task.taskId || '-'}</p>
        </div>
        <div>
          <span className="text-gray-700 dark:text-gray-400">请求ID</span>
          <p className="text-gray-800 dark:text-gray-200 font-mono text-xs mt-1">{task.requestId || '-'}</p>
        </div>
        <div>
          <span className="text-gray-700 dark:text-gray-400">创建时间</span>
          <p className="text-gray-800 dark:text-gray-200 text-xs mt-1">{formatDate(task.createdAt)}</p>
        </div>
        <div>
          <span className="text-gray-700 dark:text-gray-400">完成时间</span>
          <p className="text-gray-800 dark:text-gray-200 text-xs mt-1">{task.completedAt ? formatDate(task.completedAt) : '-'}</p>
        </div>
      </div>

      <div className="card space-y-4">
        <h2 className="font-display font-bold text-gray-900 dark:text-gray-100 text-lg">输入参数</h2>

        <div className="space-y-3">
          <div>
            <span className="text-gray-700 dark:text-gray-400 text-sm">生成模式</span>
            <p className="text-gray-800 dark:text-gray-200 mt-1">{MODE_LABELS[task.mode] || task.mode}</p>
          </div>

          <div>
            <span className="text-gray-700 dark:text-gray-400 text-sm">提示词</span>
            <div className="mt-1 p-3 bg-gray-900/50 dark:bg-gray-900/50 rounded-lg border border-gray-300 dark:border-gray-700/50">
              <p className="text-gray-800 dark:text-gray-200 text-sm whitespace-pre-wrap">{task.prompt}</p>
            </div>
          </div>

          {task.firstFrameBase64 && (
            <div>
              <span className="text-gray-700 dark:text-gray-400 text-sm">首帧图像</span>
              <div className="mt-2 relative inline-block">
                <img
                  src={task.firstFrameBase64}
                  alt="首帧"
                  className="w-32 h-32 object-cover rounded border border-gray-300 dark:border-gray-700"
                />
                <span className="absolute top-1 left-1 badge badge-info text-xs">首帧</span>
                {task.aspectRatio && (
                  <span className="absolute bottom-1 right-1 badge badge-info text-xs">{task.aspectRatio}</span>
                )}
              </div>
            </div>
          )}

          {task.lastFrameBase64 && (
            <div>
              <span className="text-gray-700 dark:text-gray-400 text-sm">尾帧图像</span>
              <div className="mt-2 relative inline-block">
                <img
                  src={task.lastFrameBase64}
                  alt="尾帧"
                  className="w-32 h-32 object-cover rounded border border-gray-300 dark:border-gray-700"
                />
                <span className="absolute top-1 left-1 badge badge-info text-xs">尾帧</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-700 dark:text-gray-400">时长</span>
              <p className="text-gray-800 dark:text-gray-200 mt-1">{task.frames === 241 ? '10秒(241帧)' : '5秒(121帧)'}</p>
            </div>
            <div>
              <span className="text-gray-700 dark:text-gray-400">宽高比</span>
              <p className="text-gray-800 dark:text-gray-200 mt-1">{task.aspectRatio}</p>
            </div>
            <div>
              <span className="text-gray-700 dark:text-gray-400">Seed</span>
              <p className="text-gray-800 dark:text-gray-200 mt-1 font-mono">{task.seed === -1 ? '随机' : task.seed}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card space-y-4">
        <h2 className="font-display font-bold text-gray-900 dark:text-gray-100 text-lg">生成结果</h2>

        {task.status === 'done' && task.videoUrl && (
          <div className="space-y-3">
            <VideoPlayer videoUrl={task.videoUrl} aspectRatio={task.aspectRatio} />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <Clock size={16} className="text-warning" />
                <span className="text-gray-800 dark:text-gray-300">
                  {isExpired ? '视频已过期' : `视频过期倒计时: ${timeRemaining}`}
                </span>
              </div>
              {!isExpired && (
                <Button onClick={handleDownload} variant="secondary" className="gap-2">
                  <Download size={16} />
                  下载视频
                </Button>
              )}
            </div>
          </div>
        )}

        {task.status === 'failed' && (
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-4 bg-error/10 border border-error/20 rounded-lg">
              <AlertCircle size={20} className="text-error mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-error font-medium">生成失败</p>
                {task.errorMessage && (
                  <p className="text-gray-800 dark:text-gray-300 text-sm mt-1">{task.errorMessage}</p>
                )}
              </div>
            </div>
            <Button variant="secondary" className="gap-2" onClick={() => window.location.reload()}>
              <RefreshCw size={16} />
              重试生成
            </Button>
          </div>
        )}

        {task.status === 'expired' && (
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-4 bg-warning/10 border border-warning/20 rounded-lg">
              <Clock size={20} className="text-warning mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-warning font-medium">视频已过期</p>
                <p className="text-gray-800 dark:text-gray-300 text-sm mt-1">视频链接已失效，请重新生成</p>
              </div>
            </div>
            <Button variant="secondary" className="gap-2" onClick={() => navigate('/content/video-generation')}>
              <RefreshCw size={16} />
              重新生成
            </Button>
          </div>
        )}

        {(task.status === 'in_queue' || task.status === 'generating') && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-3">
              <Loader2 size={32} className="text-accent-500 animate-spin mx-auto" />
              <p className="text-gray-800 dark:text-gray-300">
                {task.status === 'in_queue' ? '任务排队中...' : '视频生成中...'}
              </p>
              {task.progress != null && task.progress > 0 && (
                <p className="text-accent-500 text-sm">{task.progress}%</p>
              )}
            </div>
          </div>
        )}

        {task.status === 'submitting' && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-3">
              <Loader2 size={32} className="text-accent-500 animate-spin mx-auto" />
              <p className="text-gray-800 dark:text-gray-300">任务提交中...</p>
            </div>
          </div>
        )}
      </div>

      <div className="card space-y-4">
        <h2 className="font-display font-bold text-gray-900 dark:text-gray-100 text-lg">技术信息</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-700 dark:text-gray-400">reqKey</span>
            <p className="text-gray-800 dark:text-gray-200 font-mono text-xs mt-1 break-all">{task.reqKey}</p>
          </div>
          <div>
            <span className="text-gray-700 dark:text-gray-400">耗时</span>
            <p className="text-gray-800 dark:text-gray-200 mt-1">{task.timeElapsed || '-'}</p>
          </div>
          <div>
            <span className="text-gray-700 dark:text-gray-400">AIGC元数据标记</span>
            <p className="mt-1">
              <span className={`badge ${task.aigcMetaTagged ? 'badge-success' : 'badge-warning'}`}>
                {task.aigcMetaTagged ? '已标记' : '未标记'}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
