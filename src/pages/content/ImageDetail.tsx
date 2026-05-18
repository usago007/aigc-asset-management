import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ChevronLeft, ChevronRight, Clapperboard, Download, FolderOpen, Image as ImageIcon, MoreHorizontal, Share2, Sparkles, Star, Video } from 'lucide-react'
import { useAppStore } from '@/store/appStore'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PageShell } from '@/components/PageShell'
import {
  detailActionTileClass,
  detailBackButtonClass,
  detailContentGridClass,
  detailHeaderClass,
  detailIconButtonClass,
  detailMediaColumnClass,
  detailMediaShellClass,
  detailMediaStageClass,
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

const IMAGE_MODE_LABELS: Record<string, string> = {
  'text-to-image': '图片4.0',
  'image-to-image': '图生图',
  'text-to-image-31': '文生图3.1',
  'text-to-image-30': '文生图3.0',
  'text-to-image-21': '文生图2.1',
}

export default function ImageDetail() {
  const { taskId, resultIndex } = useParams<{ taskId: string; resultIndex: string }>()
  const navigate = useNavigate()
  const { imageTasks, projects, shots } = useAppStore()
  const [showPromptExpanded, setShowPromptExpanded] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)

  const task = useMemo(() => imageTasks.find((item) => item.id === taskId), [imageTasks, taskId])
  const parsedIndex = Number(resultIndex)
  const currentIndex = Number.isInteger(parsedIndex) && parsedIndex >= 0 ? parsedIndex : -1
  const totalResults = task?.outputImageUrls.length || task?.outputImageBase64.length || 0
  const currentImageUrl = currentIndex >= 0 ? task?.outputImageUrls[currentIndex] || task?.outputImageBase64[currentIndex] || '' : ''

  if (!task) {
    return (
      <PageShell>
        <div className="space-y-6">
          <button onClick={() => navigate('/content/assets')} className={detailBackButtonClass}>
            <ArrowLeft size={18} />
          </button>
          <div className="page-section text-center">
            <h1 className={detailTitleClass}>图片任务不存在</h1>
            <p className={detailSubtitleClass}>当前链接没有找到可用的图片结果。</p>
          </div>
        </div>
      </PageShell>
    )
  }

  if (!currentImageUrl) {
    return (
      <PageShell>
        <div className="space-y-6">
          <button onClick={() => navigate('/content/assets')} className={detailBackButtonClass}>
            <ArrowLeft size={18} />
          </button>
          <div className="page-section text-center">
            <h1 className={detailTitleClass}>结果索引无效</h1>
            <p className={detailSubtitleClass}>当前图片结果不存在，请返回资产库重新选择。</p>
          </div>
        </div>
      </PageShell>
    )
  }

  const projectName = projects.find((project) => project.id === task.projectId)?.projectName || '未绑定项目'
  const shotName = shots.find((shot) => shot.id === task.shotId)?.shotName || '未绑定镜头'
  const modeLabel = IMAGE_MODE_LABELS[task.mode] || task.mode
  const promptNeedsExpand = task.prompt.length > 160

  const handleDownload = () => {
    const anchor = document.createElement('a')
    anchor.href = currentImageUrl
    anchor.download = `image_${task.taskId || task.id}_${currentIndex + 1}.png`
    anchor.target = '_blank'
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
  }

  const goToResult = (nextIndex: number) => navigate(`/content/image-detail/${task.id}/${nextIndex}`)

  const actionTiles = [
    { icon: <Video size={16} />, label: '生成视频', action: () => navigate('/content/video-generation') },
    { icon: <Sparkles size={16} />, label: '重新编辑', action: () => navigate('/content/image-generation') },
    { icon: <ImageIcon size={16} />, label: '再次生成', action: () => navigate('/content/image-generation') },
    { icon: <Sparkles size={16} />, label: '超清修复', disabled: true, note: '即将开放' },
    { icon: <Sparkles size={16} />, label: '局部消除', disabled: true, note: '即将开放' },
    { icon: <Sparkles size={16} />, label: '扩图延展', disabled: true, note: '即将开放' },
  ]

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
                <Badge variant="outline">图片详情</Badge>
                <span className={detailMetaPillClass}>第 {currentIndex + 1} 张 / 共 {totalResults} 张</span>
                {task.resolution ? <span className={detailMetaPillClass}>{task.resolution}</span> : null}
              </div>
              <h1 className={detailTitleClass}>图片结果详情</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className={detailIconButtonClass} title="下载" onClick={handleDownload}>
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

        <div className={detailContentGridClass}>
          <div className={detailMediaColumnClass}>
            <div className={detailMediaShellClass}>
              <div className={detailMediaStageClass}>
                <img src={currentImageUrl} alt={task.prompt} className="max-h-[72vh] w-full object-contain" />
                {totalResults > 1 ? (
                  <>
                    <button
                      className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/38 p-2 text-white disabled:opacity-30"
                      onClick={() => goToResult(currentIndex - 1)}
                      disabled={currentIndex <= 0}
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/38 p-2 text-white disabled:opacity-30"
                      onClick={() => goToResult(currentIndex + 1)}
                      disabled={currentIndex >= totalResults - 1}
                    >
                      <ChevronRight size={18} />
                    </button>
                  </>
                ) : null}
              </div>
              {totalResults > 1 ? (
                <div className="border-t border-gray-200 p-4 dark:border-gray-800">
                  <div className="grid grid-cols-4 gap-3 sm:grid-cols-6">
                    {task.outputImageUrls.map((url, index) => (
                      <button
                        key={`${task.id}-${index}`}
                        className={`aspect-square overflow-hidden rounded-2xl border transition-colors ${index === currentIndex ? 'border-gray-950 ring-2 ring-gray-900/10 dark:border-white dark:ring-white/10' : 'border-gray-200 hover:border-gray-300 dark:border-gray-800 dark:hover:border-gray-700'}`}
                        onClick={() => goToResult(index)}
                      >
                        <img src={url} alt="" className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
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

            <div className={detailPanelClass}>
              <div className="flex flex-wrap items-center gap-2">
                <span className={detailMetaPillClass}>{modeLabel}</span>
                {task.tokensUsed ? <span className={detailMetaPillClass}>{task.tokensUsed} tokens</span> : null}
                <span className={detailMetaPillClass}>{task.status}</span>
              </div>
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
              <div className={`${detailPanelTitleClass} mb-3`}>技术信息</div>
              <div className="helper-text space-y-2 font-mono">
                <div>任务ID: {task.id}</div>
                <div>请求ID: {task.requestId}</div>
                <div>模式: {task.mode}</div>
                <div>结果索引: {currentIndex}</div>
                <div>Seed: {task.seed ?? '随机'}</div>
                <div>项目ID: {task.projectId || '-'}</div>
                <div>镜头ID: {task.shotId || '-'}</div>
                <div>帧类型: {task.frameType || '无'}</div>
                <div>创建时间: {task.createdAt}</div>
                <div>完成时间: {task.completedAt || '-'}</div>
                <div>耗时: {task.timeElapsed || '-'}</div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </PageShell>
  )
}
