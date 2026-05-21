import { useCallback, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Clapperboard, Download, Film, FolderOpen, MoreHorizontal, RefreshCw, Share2, Sparkles, Star } from 'lucide-react'
import { useGenerationStore } from '@/store/generationStore'
import { useAppStore } from '@/store/appStore'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PageShell } from '@/components/PageShell'
import FakeVideoFrame from '@/components/FakeVideoFrame'
import { getMediaDownloadName } from '@/utils/demoMedia'
import {
  detailActionTileClass,
  detailBackButtonClass,
  detailContentGridClass,
  detailFixedStageClass,
  detailFixedStageShellClass,
  detailHeaderActionsClass,
  detailHeaderBackRowClass,
  detailHeaderClass,
  detailHeaderContentRowClass,
  detailHeaderIntroClass,
  detailHeaderMetaRowClass,
  detailHeaderMetaTextClass,
  detailHeaderTopBarClass,
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
}

const STATUS_LABELS: Record<string, string> = {
  done: '已完成',
  generating: '生成中',
  in_queue: '排队中',
  submitting: '提交中',
  failed: '生成失败',
}

export default function VideoDetail() {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const { tasks } = useGenerationStore()
  const { projects, shots } = useAppStore()

  const task = useMemo(() => tasks.find((item) => item.id === id), [tasks, id])
  const [showPromptExpanded, setShowPromptExpanded] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)
  const navState = location.state as { returnTo?: string; source?: string } | null

  const handleBack = useCallback(() => {
    if (navState?.returnTo) {
      navigate(navState.returnTo)
      return
    }
    if (window.history.length > 1) {
      navigate(-1)
      return
    }
    navigate('/content/assets')
  }, [navState, navigate])

  const handleDownload = useCallback(() => {
    if (!task?.videoUrl) return
    const anchor = document.createElement('a')
    anchor.href = task.videoUrl
    anchor.download = getMediaDownloadName(task.videoUrl, `video-poster_${task.taskId || task.id}`)
    anchor.click()
  }, [task])

  if (!task) {
    return (
      <PageShell>
        <div className="space-y-6">
          <button onClick={handleBack} className={detailBackButtonClass}>
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
  const statusLabel = STATUS_LABELS[task.status] || task.status

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
    if (task.status === 'done' && task.videoUrl) {
      return (
        <div className={videoDetailStageClass}>
          <FakeVideoFrame
            src={task.videoUrl}
            alt={task.prompt}
            aspectRatio={task.aspectRatio}
            modeLabel={modeLabel}
            durationLabel={frameLabel}
            className="block h-auto max-h-full w-full max-w-full rounded-[24px] shadow-[0_18px_40px_rgba(15,23,42,0.16)]"
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
          <div className="w-full space-y-3">
            <div className={detailHeaderTopBarClass}>
              <div className={detailHeaderBackRowClass}>
                <Button variant="secondary" className="gap-2" onClick={handleBack}>
                  <ArrowLeft size={16} />
                  返回上一页
                </Button>
              </div>
            </div>
            <div className={detailHeaderContentRowClass}>
              <div className={detailHeaderIntroClass}>
                <h1 className={detailTitleClass}>视频详情</h1>
                <div className={detailHeaderMetaRowClass}>
                  {statusLabel ? <Badge variant={statusVariant}>{statusLabel}</Badge> : null}
                  <span className={detailHeaderMetaTextClass}>{modeLabel}</span>
                  <span aria-hidden="true">·</span>
                  <span className={detailHeaderMetaTextClass}>{frameLabel}</span>
                  <span aria-hidden="true">·</span>
                  <span className={detailHeaderMetaTextClass}>{task.aspectRatio}</span>
                </div>
              </div>
              <div className={detailHeaderActionsClass}>
                <button className={detailIconButtonClass} title="下载" onClick={handleDownload} disabled={!task.videoUrl}>
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
            </div>
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

            {task.status === 'done' && task.videoUrl ? (
              <div className={detailPanelClass}>
                <div className={`${detailPanelTitleClass} mb-3`}>演示预览</div>
                <div className="helper-text space-y-2">
                  <div>当前页展示的是本地静态封面，用于演示视频位的真实观感。</div>
                  <div>画面、比例、模式标签和播放器外观均已保留，避免出现空黑框或失效链接。</div>
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
