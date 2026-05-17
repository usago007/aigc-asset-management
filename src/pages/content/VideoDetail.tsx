import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useGenerationStore } from '@/store/generationStore'
import { useAppStore } from '@/store/appStore'
import { ArrowLeft, Download, Star, Share2, MoreHorizontal, Sparkles, Film, Clock, Hash, Mic, Music, Wand2, RefreshCw, Video, Play, Pause, Volume2, VolumeX, Maximize, FolderOpen, Clapperboard } from 'lucide-react'
import {
  detailAccordionClass,
  detailAccordionContentClass,
  detailAccordionTriggerClass,
  detailActionTileClass,
  detailBackButtonClass,
  detailIconButtonClass,
  detailMediaShellClass,
  detailMetaPillClass,
  detailPanelClass,
  detailPanelMutedClass,
  detailPanelTextClass,
  detailPanelTitleClass,
} from './detailStyles'

const VIDEO_MODE_LABELS: Record<string, string> = {
  'text-to-video': 'Seedsance 1.5 Pro',
  'image-to-video-first': 'Seedsance 1.5 Pro',
  'image-to-video-first-tail': 'Seedsance 1.5 Pro',
  'action-imitation': '动作模仿',
  'digital-human-fast': '数字人快速模式',
}

export default function VideoDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { tasks, updateTask } = useGenerationStore()
  const { projects, shots } = useAppStore()

  const task = useMemo(() => tasks.find((t) => t.id === id), [tasks, id])
  const [showPromptExpanded, setShowPromptExpanded] = useState(false)
  const [showTechInfo, setShowTechInfo] = useState(false)
  const [showParams, setShowParams] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState<string | null>(null)
  const [isExpired, setIsExpired] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const videoRef = useRef<HTMLVideoElement | null>(null)

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

  const handleTimeUpdate = useCallback((e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget
    setProgress(video.currentTime)
    setDuration(video.duration)
  }, [])

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value)
    if (videoRef.current) {
      videoRef.current.currentTime = time
      setProgress(time)
    }
  }, [])

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!task) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">视频不存在或已被删除</p>
      </div>
    )
  }

  const modeLabel = VIDEO_MODE_LABELS[task.mode] || task.mode
  const frameLabel = task.frames === 241 ? '10s' : '5s'
  const projectName = projects.find((project) => project.id === task.projectId)?.projectName || '未绑定项目'
  const shotName = shots.find((shot) => shot.id === task.shotId)?.shotName || '未绑定镜头'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/content/assets')}
          className={detailBackButtonClass}
        >
          <ArrowLeft size={20} className="text-accent-500" />
        </button>
        <h1 className="text-xl font-display font-bold text-gray-900 dark:text-gray-100">视频详情</h1>
      </div>

      {/* Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: Video Player */}
        <div className={`lg:col-span-3 ${detailMediaShellClass}`}>
          <div className="relative bg-black aspect-video">
            {task.status === 'done' && task.videoUrl && !isExpired ? (
              <>
                <video
                  ref={videoRef}
                  src={task.videoUrl}
                  className="w-full h-full object-contain"
                  muted={isMuted}
                  onTimeUpdate={handleTimeUpdate}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />
                {/* Player Controls Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  {/* Progress Bar */}
                  <input
                    type="range"
                    min={0}
                    max={duration || 100}
                    value={progress}
                    onChange={handleSeek}
                    className="w-full h-1 bg-gray-600 rounded-full appearance-none cursor-pointer mb-3 accent-accent-500"
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button onClick={() => {
                        if (!videoRef.current) return
                        if (isPlaying) videoRef.current.pause()
                        else videoRef.current.play()
                      }}>
                        {isPlaying ? <Pause size={20} className="text-white" /> : <Play size={20} className="text-white" />}
                      </button>
                      <button onClick={() => setIsMuted(!isMuted)}>
                        {isMuted ? <VolumeX size={16} className="text-white" /> : <Volume2 size={16} className="text-white" />}
                      </button>
                      <select
                        value={playbackSpeed}
                        onChange={(e) => {
                          const speed = parseFloat(e.target.value)
                          setPlaybackSpeed(speed)
                          if (videoRef.current) videoRef.current.playbackRate = speed
                        }}
                        className="bg-transparent text-white text-xs border border-gray-500 rounded px-1"
                      >
                        {[0.5, 1, 1.5, 2].map((speed) => (
                          <option key={speed} value={speed} className="bg-gray-900">{speed}x</option>
                        ))}
                      </select>
                      <span className="text-white text-xs">{formatTime(progress)} / {formatTime(duration)}</span>
                    </div>
                    <button onClick={() => {
                      if (!videoRef.current) return
                      setIsFullscreen(!isFullscreen)
                      if (isFullscreen) {
                        if (document.exitFullscreen) document.exitFullscreen()
                      } else {
                        videoRef.current.requestFullscreen()
                      }
                    }}>
                      <Maximize size={16} className="text-white" />
                    </button>
                  </div>
                </div>
              </>
            ) : task.status === 'failed' ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-red-950/50">
                <Film size={48} className="text-error" />
                <p className="text-error font-medium">生成失败</p>
                {task.errorMessage && (
                  <p className="text-gray-200 text-sm">{task.errorMessage}</p>
                )}
                <button
                  className="mt-2 px-4 py-2 bg-error hover:bg-red-600 text-white rounded-lg text-sm transition-colors flex items-center gap-2"
                  onClick={() => navigate('/content/video-generation')}
                >
                  <RefreshCw size={14} />
                  重新生成
                </button>
              </div>
            ) : isExpired ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-yellow-950/50">
                <Clock size={48} className="text-warning" />
                <p className="text-warning font-medium">视频已过期</p>
                <p className="text-gray-200 text-sm">视频链接已失效，请重新生成</p>
                <button
                  className="mt-2 px-4 py-2 bg-warning hover:bg-yellow-600 text-black rounded-lg text-sm transition-colors flex items-center gap-2"
                  onClick={() => navigate('/content/video-generation')}
                >
                  <RefreshCw size={14} />
                  重新生成
                </button>
              </div>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <div className="w-10 h-10 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-400 text-sm">视频生成中...</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Info Panel */}
        <div className="lg:col-span-2 space-y-4">
          {/* Top Actions */}
          <div className="flex items-center justify-end gap-2">
            <button className={detailIconButtonClass} title="下载" onClick={handleDownload}>
              <Download size={18} className="text-gray-600 dark:text-gray-400" />
            </button>
            <button
              className={`${detailIconButtonClass} ${isFavorited ? 'text-yellow-400' : ''}`}
              onClick={() => setIsFavorited(!isFavorited)}
              title="收藏"
            >
              <Star size={18} className={isFavorited ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600 dark:text-gray-400'} />
            </button>
            <button className={detailIconButtonClass} title="分享">
              <Share2 size={18} className="text-gray-600 dark:text-gray-400" />
            </button>
            <button className={detailIconButtonClass} title="更多操作">
              <MoreHorizontal size={18} className="text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Prompt */}
          <div className={detailPanelMutedClass}>
            <div className={`${detailPanelTitleClass} mb-2`}>提示词</div>
            <div className={`${detailPanelTextClass} whitespace-pre-wrap line-clamp-3`}>
              {showPromptExpanded ? task.prompt : task.prompt.slice(0, 150)}
            </div>
            {task.prompt.length > 150 && (
              <button
                className="text-accent-500 text-xs mt-1 hover:underline"
                onClick={() => setShowPromptExpanded(!showPromptExpanded)}
              >
                {showPromptExpanded ? '收起' : '展开'}
              </button>
            )}
          </div>

          {/* Model Info */}
          <div className={`flex items-center gap-3 p-3 ${detailPanelClass}`}>
            <Sparkles size={16} className="text-accent-500" />
            <span className={`${detailPanelTextClass} font-medium`}>{modeLabel}</span>
            <span className={detailMetaPillClass}>{frameLabel}</span>
            <span className={detailMetaPillClass}>{task.aspectRatio}</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className={`p-3 ${detailPanelClass}`}>
              <div className={`flex items-center gap-2 ${detailPanelTitleClass}`}><FolderOpen size={14} /> 项目</div>
              <p className={`mt-2 ${detailPanelTextClass}`}>{projectName}</p>
            </div>
            <div className={`p-3 ${detailPanelClass}`}>
              <div className={`flex items-center gap-2 ${detailPanelTitleClass}`}><Clapperboard size={14} /> 镜头</div>
              <p className={`mt-2 ${detailPanelTextClass}`}>{shotName}</p>
            </div>
          </div>

          {/* Generation Params */}
          <div className={detailAccordionClass}>
            <button
              className={detailAccordionTriggerClass}
              onClick={() => setShowParams(!showParams)}
            >
              <span>生成参数</span>
            </button>
            {showParams && (
              <div className={detailAccordionContentClass}>
                <div>时长: {task.frames === 241 ? '10秒(241帧)' : '5秒(121帧)'}</div>
                <div>宽高比: {task.aspectRatio}</div>
                <div>Seed: {task.seed === -1 ? '随机' : task.seed}</div>
                {task.firstFrameUrl && <div>首帧图: 已上传</div>}
                {task.lastFrameUrl && <div>尾帧图: 已上传</div>}
              </div>
            )}
          </div>

          {/* Expiration Countdown */}
          {task.status === 'done' && timeRemaining && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 dark:bg-yellow-500/10 dark:border-yellow-500/30 rounded-xl text-sm text-yellow-800 dark:text-yellow-300 flex items-center gap-2">
              <Clock size={14} />
              <span>视频将在 {timeRemaining} 后过期</span>
            </div>
          )}

          {/* Action Buttons Grid */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: <Mic size={16} />, label: '对口型', disabled: true, soon: true },
              { icon: <Video size={16} />, label: 'AI 音效', disabled: true, soon: true },
              { icon: <Music size={16} />, label: 'AI 配乐', disabled: true, soon: true },
              { icon: <Film size={16} />, label: '补帧', disabled: true, soon: true },
              { icon: <Wand2 size={16} />, label: '智能超清', disabled: true, soon: true },
              { icon: <Sparkles size={16} />, label: '重新编辑', action: () => navigate('/content/video-generation') },
              { icon: <RefreshCw size={16} />, label: '再次生成', action: () => navigate('/content/video-generation') },
            ].map((btn) => (
              <button
                key={btn.label}
                className={detailActionTileClass}
                disabled={btn.disabled && !btn.action}
                onClick={btn.action}
              >
                {btn.icon}
                <span>{btn.label}</span>
                {btn.soon && (
                  <span className="absolute top-1 right-1 text-[9px] text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-1 rounded">即将开放</span>
                )}
              </button>
            ))}
          </div>

          {/* Technical Info */}
          <div className={detailAccordionClass}>
            <button
              className={detailAccordionTriggerClass}
              onClick={() => setShowTechInfo(!showTechInfo)}
            >
              <Hash size={14} />
              <span>技术信息</span>
            </button>
            {showTechInfo && (
              <div className={`${detailAccordionContentClass} font-mono`}>
                <div>任务ID: {task.id}</div>
                <div>请求ID: {task.requestId}</div>
                <div>模式: {task.mode}</div>
                <div>Seed: {task.seed}</div>
                <div>创建时间: {task.createdAt}</div>
                <div>完成时间: {task.completedAt || '-'}</div>
                {task.timeElapsed && <div>耗时: {task.timeElapsed}</div>}
                <div>AIGC元数据: {task.aigcMetaTagged ? '已标记' : '未标记'}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
