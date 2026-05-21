import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AlertCircle, ArrowLeft, Clapperboard, Download, FolderOpen, Image, RefreshCw } from 'lucide-react'
import { useGenerationStore } from '@/store/generationStore'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PageShell } from '@/components/PageShell'
import FakeVideoFrame from '@/components/FakeVideoFrame'
import { getMediaDownloadName } from '@/utils/mediaLibrary'
import {
  detailBackButtonClass,
  detailHeaderClass,
  detailMediaShellClass,
  detailMediaStageClass,
  detailMetaPillClass,
  detailPageShellClass,
  detailPanelClass,
  detailPanelMutedClass,
  detailPanelTextClass,
  detailPanelTitleClass,
  detailStatusCardClass,
  detailSubtitleClass,
  detailTitleClass,
} from './detailStyles'

const MODE_LABELS: Record<string, string> = {
  'text-to-video': '文生视频',
  'image-to-video-first': '首帧图生',
  'image-to-video-first-tail': '首尾帧图生',
}

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'destructive' | 'info'> = {
  submitting: 'info',
  in_queue: 'info',
  generating: 'info',
  done: 'success',
  failed: 'destructive',
}

export default function TaskDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { tasks } = useGenerationStore()

  const task = useMemo(() => tasks.find((item) => item.id === id), [tasks, id])

  if (!task) {
    return (
      <PageShell>
        <div className="space-y-6">
          <button onClick={() => navigate('/content/assets')} className={detailBackButtonClass}>
            <ArrowLeft size={18} />
          </button>
          <div className="page-section text-center">
            <h1 className={detailTitleClass}>任务不存在</h1>
            <p className={detailSubtitleClass}>当前链接没有找到可用的任务记录。</p>
          </div>
        </div>
      </PageShell>
    )
  }

  const statusVariant = STATUS_VARIANT[task.status] || 'info'
  const modeLabel = MODE_LABELS[task.mode] || task.mode

  const handleDownload = () => {
    if (!task.videoUrl) return
    const anchor = document.createElement('a')
    anchor.href = task.videoUrl
    anchor.download = getMediaDownloadName(task.videoUrl, `video-poster_${task.taskId || task.id}`)
    anchor.click()
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
                <span className={detailMetaPillClass}>{task.frames === 241 ? '10 秒' : '5 秒'}</span>
                <span className={detailMetaPillClass}>{task.aspectRatio}</span>
              </div>
              <h1 className={detailTitleClass}>任务技术详情</h1>
              <p className={detailSubtitleClass}>更偏排查与追溯视角的任务详情页，集中查看输入、结果和技术状态。</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" className="gap-2" onClick={() => navigate('/content/video-generation')}>
              <RefreshCw size={14} />
              再次生成
            </Button>
            <Button className="gap-2" onClick={handleDownload} disabled={!task.videoUrl}>
              <Download size={14} />
              下载封面
            </Button>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-5">
          <div className="space-y-4 lg:col-span-3">
            <div className={detailMediaShellClass}>
              {task.status === 'done' && task.videoUrl ? (
                <FakeVideoFrame
                  src={task.videoUrl}
                  alt={task.prompt}
                  aspectRatio={task.aspectRatio}
                  modeLabel={modeLabel}
                  durationLabel={task.frames === 241 ? '10 秒' : '5 秒'}
                  className="w-full rounded-[24px]"
                />
              ) : task.status === 'failed' ? (
                <div className={`${detailMediaStageClass} flex-col gap-3 text-center`}>
                  <Badge variant="destructive">生成失败</Badge>
                  <p className="body-muted max-w-md">{task.errorMessage || '当前任务没有可用结果。'}</p>
                </div>
              ) : (
                <div className={`${detailMediaStageClass} flex-col gap-3 text-center`}>
                  <Badge variant="info">{task.status}</Badge>
                  <p className="body-muted">任务仍在处理中，完成后这里会出现结果媒体。</p>
                  {task.progress != null ? <span className={detailMetaPillClass}>{task.progress}%</span> : null}
                </div>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {task.firstFrameBase64 ? (
                <div className={detailPanelClass}>
                  <div className={`${detailPanelTitleClass} mb-2 flex items-center gap-2`}><Image size={14} /> 首帧</div>
                  <img src={task.firstFrameBase64} alt="首帧" className="h-40 w-full rounded-2xl object-cover" />
                </div>
              ) : null}
              {task.lastFrameBase64 ? (
                <div className={detailPanelClass}>
                  <div className={`${detailPanelTitleClass} mb-2 flex items-center gap-2`}><Image size={14} /> 尾帧</div>
                  <img src={task.lastFrameBase64} alt="尾帧" className="h-40 w-full rounded-2xl object-cover" />
                </div>
              ) : null}
            </div>
          </div>

          <aside className="space-y-4 lg:col-span-2">
            <div className={detailPanelMutedClass}>
              <div className={`${detailPanelTitleClass} mb-2`}>提示词</div>
              <p className={`${detailPanelTextClass} whitespace-pre-wrap`}>{task.prompt}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className={detailStatusCardClass}>
                <div className={`${detailPanelTitleClass} flex items-center gap-2`}><FolderOpen size={14} /> 项目 ID</div>
                <p className={`mt-2 ${detailPanelTextClass}`}>{task.projectId || '-'}</p>
              </div>
              <div className={detailStatusCardClass}>
                <div className={`${detailPanelTitleClass} flex items-center gap-2`}><Clapperboard size={14} /> 镜头 ID</div>
                <p className={`mt-2 ${detailPanelTextClass}`}>{task.shotId || '-'}</p>
              </div>
            </div>

            <div className={detailPanelClass}>
              <div className={`${detailPanelTitleClass} mb-3`}>输入参数</div>
              <div className="helper-text space-y-2">
                <div>时长：{task.frames === 241 ? '10秒(241帧)' : '5秒(121帧)'}</div>
                <div>宽高比：{task.aspectRatio}</div>
                <div>Seed：{task.seed === -1 ? '随机' : task.seed}</div>
                <div>首帧来源：{task.firstFrameBase64 || task.firstFrameUrl ? '已提供' : '无'}</div>
                <div>尾帧来源：{task.lastFrameBase64 || task.lastFrameUrl ? '已提供' : '无'}</div>
              </div>
            </div>

            <div className={detailPanelClass}>
              <div className={`${detailPanelTitleClass} mb-3`}>技术信息</div>
              <div className="helper-text space-y-2 font-mono">
                <div>任务ID: {task.id}</div>
                <div>业务任务ID: {task.taskId || '-'}</div>
                <div>请求ID: {task.requestId || '-'}</div>
                <div>reqKey: {task.reqKey}</div>
                <div>耗时: {task.timeElapsed || '-'}</div>
                <div>AIGC 元数据: {task.aigcMetaTagged ? '已标记' : '未标记'}</div>
              </div>
            </div>

            {task.status === 'failed' ? (
              <div className={detailPanelClass}>
                <div className="flex items-start gap-3 text-sm text-red-600 dark:text-red-300">
                  <AlertCircle size={16} className="mt-0.5" />
                  <div>
                    <div className="font-medium">错误信息</div>
                    <div className="mt-1 text-red-500 dark:text-red-400">{task.errorMessage || '未返回错误详情'}</div>
                  </div>
                </div>
              </div>
            ) : null}
          </aside>
        </div>
      </div>
    </PageShell>
  )
}
