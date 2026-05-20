import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Clapperboard, Clock, Download, Film, FolderOpen, MoreHorizontal, RefreshCw, Share2, Sparkles, Star, Volume2, VolumeX } from 'lucide-react'
import { useGenerationStore } from '@/store/generationStore'
import { useAppStore } from '@/store/appStore'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PageShell } from '@/components/PageShell'
import {
  detailActionTileClass,
  detailBackButtonClass,
  detailContentGridClass,
  detailFixedStageClass,
  detailFixedStageShellClass,
  detailHeaderClass,
  detailIconButtonClass,
  detailMediaColumnClass,
  detailMetaPillClass,
  detailPageShellClass,
  detailPanelClass,
  detailPanelMutedClass,
  detailPanelTextClass,
  detailPanelTitleClass,
  detailSidebarClass,
  detailStatusCardClass,
  detailSubtitleClass,
  detailTitleClass,
} from './detailStyles'

const VIDEO_MODE_LABELS: Record<string, string> = {
  'text-to-video': 'Seedsance 1.5 Pro',
  'image-to-video-first': 'Seedsance 1.5 Pro',
  'image-to-video-first-tail': 'Seedsance 1.5 Pro',
  'action-imitation': '动作模仿',
  'digital-human-fast': '数字人快速模式',
}

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'destructive' | 'info'> = {
  done: 'success',
  generating: 'info',
  in_queue: 'info',
  submitting: 'info',
  failed: 'destructive',
  expired: 'warning',
}

export default function VideoDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { tasks, updateTask } = useGenerationStore()
  const { projects, shots } = useAppStore()

  const task = useMemo(() => tasks.find((item) => item.id === id), [tasks, id])
  const [showPromptExpanded, setShowPromptExpanded] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState<string | null>(null)
  const [isExpired, setIsExpired] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
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
    const anchor = document.createElement('a')
    anchor.href = task.videoUrl
    anchor.download = `video_${task.taskId}.mp4`
    anchor.click()
  }, [task])

  if (!task) {
    return (
      <PageShell>
        <div className="space-y-6">
          <button onClick={() => navigate('/content/assets')} className={detailBackButtonClass}>
            <ArrowLeft size={18} />
          </button>
          <div className="page-section text-center">
            <h1 className={detailTitleClass}>视频任务不存在</h1>
            <p className={detailSubtitleClass}>当前链接没有找到可用的视频详情。</p>
          </div>
        </div>
      </PageShell>
    )
  }

  const modeLabel = VIDEO_MODE_LABELS[task.mode] || task.mode
  const frameLabel = task.frames === 241 ? '10 秒' : '5 秒'
  const projectName = projects.find((project) => project.id === task.projectId)?.projectName || '未绑定项目'
  const shotName = shots.find((shot) => shot.id === task.shotId)?.shotName || '未绑定镜头'
  const promptNeedsExpand = task.prompt.length > 160
  const statusVariant = STATUS_VARIANT[task.status] || 'info'

  const actionTiles = [
    { icon: <RefreshCw size={16} />, label: '再次生成', action: () => navigate('/content/video-generation') },
    { icon: <Sparkles size={16} />, label: '重新编辑', action: () => navigate('/content/video-generation') },
    { icon: <Film size={16} />, label: '补帧', disabled: true, note: '即将开放' },
    { icon: <Sparkles size={16} />, label: '智能超清', disabled: true, note: '即将开放' },
  ]

  const videoDetailContentGridClass = detailContentGridClass
  const videoDetailMediaColumnClass = detailMediaColumnClass
  const videoDetailStageClass = detailFixedStageClass

  const renderVideoState = () => {
    if (task.status === 'done' && task.videoUrl && !isExpired) {
      return (
        <div className={videoDetailStageClass}>
          <video
            ref={videoRef}
            src={task.videoUrl}
            controls
            muted={isMuted}
            preload="metadata"
            className="block h-auto max-h-full w-auto max-w-full rounded-[24px] bg-black object-contain shadow-[0_18px_40px_rgba(15,23,42,0.16)]"
            onTimeUpdate={(event) => {
              setProgress(event.currentTarget.currentTime)
              setDuration(event.currentTarget.duration || 0)
            }}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
        </div>
      )
    }

    if (task.status === 'failed') {
      return (
        <div className={`${videoDetailStageClass} flex-col gap-3 text-center`}>
          <Badge variant="destructive">生成失败</Badge>
          <p className="body-muted max-w-md">{task.errorMessage || '当前任务未返回可播放视频。'}</p>
          <Button className="gap-2" onClick={() => navigate('/content/video-generation')}>
            <RefreshCw size={14} />
            重新生成
          </Button>
        </div>
      )
    }

    if (isExpired || task.status === 'expired') {
      return (
        <div className={`${videoDetailStageClass} flex-col gap-3 text-center`}>
          <Badge variant="warning">视频已过期</Badge>
          <p className="body-muted max-w-md">视频链接已失效，请返回创作页重新生成。</p>
          <Button className="gap-2" onClick={() => navigate('/content/video-generation')}>
            <RefreshCw size={14} />
            返回重新生成
          </Button>
        </div>
      )
    }

    return (
      <div className={`${videoDetailStageClass} flex-col gap-3 text-center`}>
        <Badge variant="info">{task.status === 'in_queue' ? '排队中' : task.status === 'submitting' ? '提交中' : '生成中'}</Badge>
        <p className="body-muted">视频任务正在处理中，生成完成后可在这里预览。</p>
        {task.progress != null ? <span className={detailMetaPillClass}>{task.progress}%</span> : null}
      </div>
    )
  }

  return (
    <PageShell>
      <div className={detailPageShellClass}>
        <section className={detailHeaderClass}>
          <div className="space-y-3">
            <button onClick={() => navigate('/content/assets')} className={detailBackButtonClass}>
              <ArrowLeft size={18} />
            </button>
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Badge variant={statusVariant}>{task.status}</Badge>
                <span className={detailMetaPillClass}>{modeLabel}</span>
                <span className={detailMetaPillClass}>{frameLabel}</span>
                <span className={detailMetaPillClass}>{task.aspectRatio}</span>
              </div>
              <h1 className={detailTitleClass}>视频结果详情</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className={detailIconButtonClass} title="下载" onClick={handleDownload} disabled={!task.videoUrl || isExpired}>
              <Download size={18} />
            </button>
            <button className={detailIconButtonClass} title="收藏" onClick={() => setIsFavorited(!isFavorited)}>
              <Star size={18} className={isFavorited ? 'fill-amber-400 text-amber-400' : ''} />
            </button>
            <button className={detailIconButtonClass} title="分享">
              <Share2 size={18} />
            </button>
            <button className={detailIconButtonClass} title="更多操作">
              <MoreHorizontal size={18} />
            </button>
          </div>
        </section>

        <div className={videoDetailContentGridClass}>
          <div className={videoDetailMediaColumnClass}>
            <div className={detailFixedStageShellClass}>
              {renderVideoState()}
            </div>
          </div>

          <aside className={detailSidebarClass}>
            <div className={detailPanelMutedClass}>
              <div className={`${detailPanelTitleClass} mb-2`}>提示词</div>
              <div className={`${detailPanelTextClass} whitespace-pre-wrap`}>
                {showPromptExpanded || !promptNeedsExpand ? task.prompt : `${task.prompt.slice(0, 160)}...`}
              </div>
              {promptNeedsExpand ? (
                <button className="helper-text mt-2 transition-colors hover:text-gray-900 dark:hover:text-gray-50" onClick={() => setShowPromptExpanded(!showPromptExpanded)}>
                  {showPromptExpanded ? '收起' : '展开完整提示词'}
                </button>
              ) : null}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className={detailStatusCardClass}>
                <div className={`${detailPanelTitleClass} flex items-center gap-2`}><FolderOpen size={14} /> 项目</div>
                <p className={`mt-2 ${detailPanelTextClass}`}>{projectName}</p>
              </div>
              <div className={detailStatusCardClass}>
                <div className={`${detailPanelTitleClass} flex items-center gap-2`}><Clapperboard size={14} /> 镜头</div>
                <p className={`mt-2 ${detailPanelTextClass}`}>{shotName}</p>
              </div>
            </div>

            {task.status === 'done' && timeRemaining && !isExpired ? (
              <div className={detailPanelClass}>
                <div className="panel-value flex items-center gap-2">
                  <Clock size={14} />
                  视频将在 {timeRemaining} 后过期
                </div>
              </div>
            ) : null}

            {task.status === 'done' && task.videoUrl && !isExpired ? (
              <div className={detailPanelClass}>
                <div className={`${detailPanelTitleClass} mb-3`}>播放控制</div>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    className={detailIconButtonClass}
                    onClick={() => {
                      if (!videoRef.current) return
                      if (isPlaying) videoRef.current.pause()
                      else videoRef.current.play()
                    }}
                  >
                    <Film size={16} />
                  </button>
                  <button className={detailIconButtonClass} onClick={() => setIsMuted(!isMuted)}>
                    {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                  </button>
                  <select
                    value={playbackSpeed}
                    onChange={(event) => {
                      const next = Number(event.target.value)
                      setPlaybackSpeed(next)
                      if (videoRef.current) videoRef.current.playbackRate = next
                    }}
                    className="input-field h-10 px-3"
                  >
                    {[0.5, 1, 1.5, 2].map((value) => (
                      <option key={value} value={value}>{value}x</option>
                    ))}
                  </select>
                </div>
                <div className="mt-4 space-y-2">
                  <input
                    type="range"
                    min={0}
                    max={duration || 0}
                    value={progress}
                    onChange={(event) => {
                      const next = Number(event.target.value)
                      if (videoRef.current) videoRef.current.currentTime = next
                      setProgress(next)
                    }}
                    className="w-full accent-gray-950 dark:accent-white"
                  />
                  <div className="helper-text">
                    {Math.floor(progress)}s / {Math.floor(duration)}s
                  </div>
                </div>
              </div>
            ) : null}

            <div className="grid grid-cols-2 gap-3">
              {actionTiles.map((item) => (
                <button key={item.label} className={detailActionTileClass} disabled={item.disabled} onClick={item.action}>
                  <div className="flex items-center gap-2">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  <span className="helper-text">{item.note || '可直接跳转'}</span>
                </button>
              ))}
            </div>

            <div className={detailPanelClass}>
              <div className={`${detailPanelTitleClass} mb-3`}>生成参数</div>
              <div className="helper-text space-y-2">
                <div>时长: {task.frames === 241 ? '10秒(241帧)' : '5秒(121帧)'}</div>
                <div>宽高比: {task.aspectRatio}</div>
                <div>Seed: {task.seed === -1 ? '随机' : task.seed}</div>
                <div>首帧: {task.firstFrameUrl || task.firstFrameBase64 ? '已提供' : '无'}</div>
                <div>尾帧: {task.lastFrameUrl || task.lastFrameBase64 ? '已提供' : '无'}</div>
              </div>
            </div>

            <div className={detailPanelClass}>
              <div className={`${detailPanelTitleClass} mb-3`}>技术信息</div>
              <div className="helper-text space-y-2 font-mono">
                <div>任务ID: {task.id}</div>
                <div>请求ID: {task.requestId}</div>
                <div>reqKey: {task.reqKey}</div>
                <div>模式: {task.mode}</div>
                <div>AIGC 元数据: {task.aigcMetaTagged ? '已标记' : '未标记'}</div>
                <div>创建时间: {task.createdAt}</div>
                <div>完成时间: {task.completedAt || '-'}</div>
                <div>耗时: {task.timeElapsed || '-'}</div>
                <div>消耗 Token: {task.tokensUsed ?? '-'}</div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </PageShell>
  )
}
