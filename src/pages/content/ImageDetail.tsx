import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store/appStore'
import { ArrowLeft, Download, Star, Share2, MoreHorizontal, Sparkles, Image as ImageIcon, Clock, Hash, Layers, Palette, Wand2, PenTool, Scissors, Mic, Video } from 'lucide-react'

const IMAGE_MODE_LABELS: Record<string, string> = {
  'text-to-image': '图片4.0',
  'image-to-image': '图生图',
  'text-to-image-31': '文生图3.1',
  'text-to-image-30': '文生图3.0',
  'text-to-image-21': '文生图2.1',
}

export default function ImageDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { imageTasks, retryImageTask, deleteImageTask } = useAppStore()

  const task = useMemo(() => imageTasks.find((t) => t.id === id), [imageTasks, id])
  const [showPromptExpanded, setShowPromptExpanded] = useState(false)
  const [showTechInfo, setShowTechInfo] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)

  if (!task) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">图片不存在或已被删除</p>
      </div>
    )
  }

  const imageUrl = task.outputImageUrls?.[0] || task.outputImageBase64?.[0] || ''
  const modeLabel = IMAGE_MODE_LABELS[task.mode] || task.mode
  const resolution = task.resolution || ''

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/content/generation-history')}
          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft size={20} className="text-accent-500" />
        </button>
        <h1 className="text-xl font-display font-bold text-gray-900 dark:text-gray-100">图片详情</h1>
      </div>

      {/* Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: Image Display */}
        <div className="lg:col-span-3 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden ring-1 ring-gray-200 dark:ring-accent-500/10">
          <div className="relative min-h-[400px] flex items-center justify-center">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={task.prompt}
                className="max-w-full max-h-[70vh] object-contain"
              />
            ) : (
              <div className="flex flex-col items-center gap-3 text-gray-400 dark:text-gray-500">
                <ImageIcon size={48} />
                <span>图片不可用</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Info Panel */}
        <div className="lg:col-span-2 space-y-4">
          {/* Top Actions */}
          <div className="flex items-center justify-end gap-2">
            <button className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" title="下载">
              <Download size={18} className="text-gray-600 dark:text-gray-400" />
            </button>
            <button
              className={`p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${isFavorited ? 'text-yellow-400' : ''}`}
              onClick={() => setIsFavorited(!isFavorited)}
              title="收藏"
            >
              <Star size={18} className={isFavorited ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600 dark:text-gray-400'} />
            </button>
            <button className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" title="分享">
              <Share2 size={18} className="text-gray-600 dark:text-gray-400" />
            </button>
            <button className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" title="更多操作">
              <MoreHorizontal size={18} className="text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Prompt */}
          <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">提示词</div>
            <div className="text-gray-700 dark:text-gray-200 text-sm whitespace-pre-wrap line-clamp-3">
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
          <div className="flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <Sparkles size={16} className="text-accent-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{modeLabel}</span>
            {task.outputImageBase64?.[0] && (
              <span className="text-xs text-gray-600 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded">1:1</span>
            )}
            {resolution && (
              <span className="text-xs text-gray-600 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded">{resolution}</span>
            )}
          </div>

          {/* Action Buttons Grid */}
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
                className="flex items-center gap-2 p-3 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm transition-colors text-left disabled:opacity-40 disabled:cursor-not-allowed border border-gray-200 dark:border-gray-700"
                disabled={btn.disabled}
                onClick={btn.action}
              >
                {btn.icon}
                <span>{btn.label}</span>
              </button>
            ))}
          </div>

          {/* Technical Info */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
            <button
              className="w-full flex items-center justify-between px-4 py-3 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              onClick={() => setShowTechInfo(!showTechInfo)}
            >
              <Hash size={14} />
              <span>技术信息</span>
            </button>
            {showTechInfo && (
              <div className="px-4 pb-4 space-y-2 text-xs text-gray-500 dark:text-gray-500 font-mono">
                <div>任务ID: {task.id}</div>
                <div>请求ID: {task.requestId}</div>
                <div>模式: {task.mode}</div>
                <div>Seed: {task.seed ?? '随机'}</div>
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
