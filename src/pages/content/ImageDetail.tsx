import { useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store/appStore'
import { ArrowLeft, Download, Star, Share2, MoreHorizontal, Sparkles, Image as ImageIcon, Clock, Hash, Layers, Palette, Wand2, Scissors, Mic, Video, ChevronLeft, ChevronRight, FolderOpen, Clapperboard } from 'lucide-react'
import {
  detailAccordionClass,
  detailAccordionContentClass,
  detailAccordionTriggerClass,
  detailActionButtonClass,
  detailBackButtonClass,
  detailIconButtonClass,
  detailMediaShellClass,
  detailMetaPillClass,
  detailPanelClass,
  detailPanelMutedClass,
  detailPanelTextClass,
  detailPanelTitleClass,
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
  const [showTechInfo, setShowTechInfo] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)

  const task = useMemo(() => imageTasks.find((t) => t.id === taskId), [imageTasks, taskId])
  const parsedIndex = Number(resultIndex)
  const currentIndex = Number.isInteger(parsedIndex) && parsedIndex >= 0 ? parsedIndex : -1
  const currentImageUrl = currentIndex >= 0 ? task?.outputImageUrls?.[currentIndex] || task?.outputImageBase64?.[currentIndex] || '' : ''

  const projectName = projects.find((project) => project.id === task?.projectId)?.projectName || '未绑定项目'
  const shotName = shots.find((shot) => shot.id === task?.shotId)?.shotName || '未绑定镜头'
  const modeLabel = task ? IMAGE_MODE_LABELS[task.mode] || task.mode : ''
  const resolution = task?.resolution || ''
  const totalResults = task?.outputImageUrls?.length || task?.outputImageBase64?.length || 0

  if (!task) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">图片任务不存在或已被删除</p>
      </div>
    )
  }

  if (!currentImageUrl) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/content/assets')}
            className={detailBackButtonClass}
          >
            <ArrowLeft size={20} className="text-accent-500" />
          </button>
          <h1 className="text-xl font-display font-bold text-gray-900 dark:text-gray-100">图片详情</h1>
        </div>
        <div className="flex items-center justify-center h-64 rounded-xl bg-gray-100 dark:bg-gray-800">
          <p className="text-gray-500">当前图片结果不存在或索引无效</p>
        </div>
      </div>
    )
  }

  const handleDownload = () => {
    const a = document.createElement('a')
    a.href = currentImageUrl
    a.download = `image_${task.taskId || task.id}_${currentIndex + 1}.png`
    a.target = '_blank'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const goToResult = (nextIndex: number) => navigate(`/content/image-detail/${task.id}/${nextIndex}`)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/content/assets')}
          className={detailBackButtonClass}
        >
          <ArrowLeft size={20} className="text-accent-500" />
        </button>
        <h1 className="text-xl font-display font-bold text-gray-900 dark:text-gray-100">图片详情</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className={`lg:col-span-3 ${detailMediaShellClass}`}>
          <div className="relative min-h-[400px] flex items-center justify-center">
            <img
              src={currentImageUrl}
              alt={task.prompt}
              className="max-w-full max-h-[70vh] object-contain"
            />
            {totalResults > 1 && (
              <>
                <button
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white disabled:opacity-30"
                  onClick={() => goToResult(currentIndex - 1)}
                  disabled={currentIndex <= 0}
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white disabled:opacity-30"
                  onClick={() => goToResult(currentIndex + 1)}
                  disabled={currentIndex >= totalResults - 1}
                >
                  <ChevronRight size={18} />
                </button>
              </>
            )}
          </div>
          {totalResults > 1 && (
            <div className="border-t border-gray-200 dark:border-gray-700 p-4">
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                {task.outputImageUrls.map((url, index) => (
                  <button
                    key={`${task.id}-${index}`}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${index === currentIndex ? 'border-accent-500 ring-2 ring-accent-500/20' : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'}`}
                    onClick={() => goToResult(index)}
                  >
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-4">
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

          <div className={`flex items-center gap-3 p-3 ${detailPanelClass}`}>
            <Sparkles size={16} className="text-accent-500" />
            <span className={`${detailPanelTextClass} font-medium`}>{modeLabel}</span>
            <span className={detailMetaPillClass}>
              第 {currentIndex + 1} 张 / 共 {totalResults} 张
            </span>
            {resolution && (
              <span className={detailMetaPillClass}>{resolution}</span>
            )}
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

          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: <Video size={16} />, label: '生成视频', action: () => navigate('/content/video-generation') },
              { icon: <Palette size={16} />, label: '编辑超清', disabled: true },
              { icon: <Wand2 size={16} />, label: '细节修复', disabled: true },
              { icon: <Layers size={16} />, label: '扩图', disabled: true },
              { icon: <Scissors size={16} />, label: '消除笔', disabled: true },
              { icon: <Mic size={16} />, label: '对口型', disabled: true },
              { icon: <ImageIcon size={16} />, label: '图片编辑器', disabled: true },
              { icon: <Sparkles size={16} />, label: '重新编辑', action: () => navigate('/content/image-generation') },
              { icon: <Clock size={16} />, label: '再次生成', action: () => navigate('/content/image-generation') },
            ].map((btn) => (
              <button
                key={btn.label}
                className={detailActionButtonClass}
                disabled={btn.disabled}
                onClick={btn.action}
              >
                {btn.icon}
                <span>{btn.label}</span>
              </button>
            ))}
          </div>

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
                <div>结果索引: {currentIndex}</div>
                <div>Seed: {task.seed ?? '随机'}</div>
                <div>项目ID: {task.projectId || '-'}</div>
                <div>镜头ID: {task.shotId || '-'}</div>
                <div>帧类型: {task.frameType || '无'}</div>
                <div>创建时间: {task.createdAt}</div>
                <div>完成时间: {task.completedAt || '-'}</div>
                {task.tokensUsed && <div>消耗Token: {task.tokensUsed}</div>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
