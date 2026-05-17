import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { useAppStore } from '@/store/appStore'
import { useAIConfigStore } from '@/store/aiConfigStore'
import { submitImageTask, getImageReqKeyForMode } from '@/services/imageGeneration'
import { fileToBase64 } from '@/utils/file'
import { formatDate } from '@/utils/date'
import JimengInput from '@/components/JimengInput'
import ParamPanel from '@/components/ParamPanel'
import CreationTypeMenu from '@/components/CreationTypeMenu'
import { Sparkles, Palette, Image as ImageIcon, Layers, Hash, Clock, Download, Maximize2, Loader2, AlertCircle, X, ImagePlus } from 'lucide-react'
import type { ImageGenerationMode, TaskQueueStatus } from '@/types/generation'

const modeOptions: { value: ImageGenerationMode; label: string; icon: typeof Palette; desc: string }[] = [
  { value: 'text-to-image', label: '图片4.0', icon: Palette, desc: '最新一代，文生图/图生图一体化' },
  { value: 'image-to-image', label: '图生图', icon: ImageIcon, desc: '使用图片4.0引擎' },
  { value: 'text-to-image-31', label: '文生图3.1', icon: Layers, desc: '高质量文生图' },
  { value: 'text-to-image-30', label: '文生图3.0', icon: Hash, desc: '标准文生图' },
  { value: 'text-to-image-21', label: '文生图2.1', icon: Clock, desc: '基础文生图' },
]

const creationTypeOptions = [
  {
    id: 'agent',
    label: '创作类型',
    icon: <Sparkles size={16} />,
    subOptions: [
      { id: 'agent-mode', label: 'Agent 模式', icon: <Sparkles size={16} />, description: '自由创作，AI 辅助' },
      { id: 'image-gen', label: '图片生成', icon: <ImageIcon size={16} />, description: 'AI 图片生成' },
      { id: 'video-gen', label: '视频生成', icon: <Layers size={16} />, description: 'AI 视频生成' },
    ],
  },
]

const statusMap: Record<TaskQueueStatus, { label: string; className: string }> = {
  submitting: { label: '提交中', className: 'badge-info' },
  in_queue: { label: '排队中', className: 'badge-warning' },
  generating: { label: '生成中', className: 'badge-info' },
  done: { label: '已完成', className: 'badge-success' },
  failed: { label: '失败', className: 'badge-error' },
  cancelled: { label: '已取消', className: 'badge-secondary' },
  expired: { label: '已过期', className: 'badge-error' },
  not_found: { label: '未找到', className: 'badge-warning' },
}

const RESOLUTION_OPTIONS = [
  { label: '1K', size: 1024 * 1024, desc: '1024×1024' },
  { label: '2K', size: 2048 * 2048, desc: '2048×2048' },
  { label: '4K', size: 4096 * 4096, desc: '4096×4096' },
]

const ASPECT_RATIOS = ['16:9', '4:3', '1:1', '3:4', '9:16', '21:9']

const MAX_IMAGES: Record<ImageGenerationMode, number> = {
  'text-to-image': 10,
  'image-to-image': 10,
  'text-to-image-31': 0,
  'text-to-image-30': 0,
  'text-to-image-21': 0,
}

export default function ImageGeneration() {
  const { imageTasks, submitImageTask: storeSubmitTask, cancelImageTask, retryImageTask, deleteImageTask } = useAppStore()
  const { updateImageEndpoint } = useAIConfigStore()

  const [prompt, setPrompt] = useState('')
  const [mode, setMode] = useState<ImageGenerationMode>('text-to-image')
  const [seed, setSeed] = useState(-1)
  const [useRandomSeed, setUseRandomSeed] = useState(true)
  const [resolution, setResolution] = useState<number>(1024 * 1024)
  const [aspectRatio, setAspectRatio] = useState('1:1')
  const [numImages, setNumImages] = useState(1)
  const [forceSingle, setForceSingle] = useState(false)
  const [scale, setScale] = useState(100)
  const [frameType, setFrameType] = useState<'Opening' | 'Ending' | ''>('')
  const [shotId, setShotId] = useState('')
  const [uploadedImages, setUploadedImages] = useState<{ file: File; url: string; base64: string }[]>([])

  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const activeTasks = useMemo(() => imageTasks.filter((t) => t.status !== 'done' && t.status !== 'failed'), [imageTasks])
  const completedTasks = useMemo(() => imageTasks.filter((t) => t.status === 'done'), [imageTasks])
  const maxImages = forceSingle ? 1 : MAX_IMAGES[mode]

  // Image upload handling
  const handleImageUpload = useCallback(async (files: FileList | null) => {
    if (!files) return
    const newImages = await Promise.all(
      Array.from(files).map(async (file) => ({
        file,
        url: URL.createObjectURL(file),
        base64: await fileToBase64(file),
      }))
    )
    setUploadedImages((prev) => [...prev, ...newImages].slice(0, maxImages))
  }, [maxImages])

  const handleRemoveImage = useCallback((index: number) => {
    setUploadedImages((prev) => {
      const next = prev.filter((_, i) => i !== index)
      return next
    })
  }, [])

  // Auto-resolve reqKey on mode change
  useEffect(() => {
    const reqKey = getImageReqKeyForMode(mode)
    updateImageEndpoint(mode, { reqKey })
  }, [mode])

  const handleSubmit = useCallback(async () => {
    if (!prompt.trim()) return
    if (maxImages > 0 && uploadedImages.length === 0 && mode === 'image-to-image') return

    const seedValue = useRandomSeed ? -1 : seed

    // Prepare uploaded images
    const uploadFiles = uploadedImages.map((img) => img.file)

    // Submit to service
    try {
      await submitImageTask(mode, {
        prompt: prompt.trim(),
        seed: seedValue,
        size: resolution,
        width: parseInt(aspectRatio.split(':')[0]) * 256,
        height: parseInt(aspectRatio.split(':')[1]) * 256,
        scale,
        force_single: forceSingle,
        resolution: resolution >= 2048 * 2048 ? '4k' : '8k',
        binary_data_base64: uploadedImages.length > 0 ? uploadedImages.map((img) => img.base64) : undefined,
      })
      setPrompt('')
      setUploadedImages([])
    } catch (error) {
      console.error('Failed to submit image task:', error)
    }
  }, [prompt, mode, seed, useRandomSeed, resolution, numImages, forceSingle, scale, frameType, shotId, uploadedImages, maxImages])

  const handleDownload = (url: string) => {
    const a = document.createElement('a')
    a.href = url
    a.download = 'generated_image.png'
    a.target = '_blank'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const paramSections = [
    {
      id: 'mode',
      label: '生成模式',
      children: (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {modeOptions.map((opt) => (
            <button
              key={opt.value}
              className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all text-left ${
                mode === opt.value
                  ? 'border-accent-500 bg-accent-50 dark:bg-accent-500/10'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
              onClick={() => setMode(opt.value)}
            >
              <opt.icon size={18} className={mode === opt.value ? 'text-accent-500' : 'text-gray-400'} />
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{opt.label}</div>
                <div className="text-xs text-gray-500">{opt.desc}</div>
              </div>
            </button>
          ))}
        </div>
      ),
    },
    {
      id: 'resolution',
      label: '分辨率',
      children: (
        <div className="flex gap-2">
          {RESOLUTION_OPTIONS.map((opt) => (
            <button
              key={opt.label}
              className={`flex-1 p-2 rounded-lg border-2 text-center transition-all ${
                resolution === opt.size
                  ? 'border-accent-500 bg-accent-50 dark:bg-accent-500/10'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setResolution(opt.size)}
            >
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{opt.label}</div>
              <div className="text-xs text-gray-500">{opt.desc}</div>
            </button>
          ))}
        </div>
      ),
    },
    {
      id: 'aspect',
      label: '宽高比',
      children: (
        <div className="flex flex-wrap gap-2">
          {ASPECT_RATIOS.map((ratio) => (
            <button
              key={ratio}
              className={`px-4 py-2 rounded-lg border-2 text-sm transition-all ${
                aspectRatio === ratio
                  ? 'border-accent-500 bg-accent-50 dark:bg-accent-500/10 text-accent-600 dark:text-accent-400'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 text-gray-700 dark:text-gray-300'
              }`}
              onClick={() => setAspectRatio(ratio)}
            >
              {ratio}
            </button>
          ))}
        </div>
      ),
    },
    {
      id: 'seed',
      label: 'Seed 随机种子',
      children: (
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={useRandomSeed}
              onChange={(e) => setUseRandomSeed(e.target.checked)}
              className="rounded border-gray-300 text-accent-500 focus:ring-accent-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">随机</span>
          </label>
          {!useRandomSeed && (
            <input
              type="number"
              value={seed}
              onChange={(e) => setSeed(Number(e.target.value))}
              className="input-field w-40"
              min={0}
              max={2147483647}
            />
          )}
        </div>
      ),
    },
    {
      id: 'advanced',
      label: '高级选项',
      children: (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <label className="text-sm text-gray-700 dark:text-gray-300">生成数量</label>
            <input
              type="range"
              min={1}
              max={maxImages}
              value={numImages}
              onChange={(e) => setNumImages(Number(e.target.value))}
              className="flex-1 accent-accent-500"
            />
            <span className="text-sm font-mono w-8">{numImages}</span>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={forceSingle}
              onChange={(e) => setForceSingle(e.target.checked)}
              className="rounded border-gray-300 text-accent-500 focus:ring-accent-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">强制单图</span>
          </label>
          <div className="flex items-center gap-4">
            <label className="text-sm text-gray-700 dark:text-gray-300">文本影响程度</label>
            <input
              type="range"
              min={0}
              max={100}
              value={scale}
              onChange={(e) => setScale(Number(e.target.value))}
              className="flex-1 accent-accent-500"
            />
            <span className="text-sm font-mono w-12">{scale}</span>
          </div>
        </div>
      ),
    },
    {
      id: 'frame',
      label: '帧类型 / 关联镜头',
      children: (
        <div className="space-y-3">
          <div className="flex gap-2">
            {(['', 'Opening', 'Ending'] as const).map((ft) => (
              <button
                key={ft}
                className={`px-4 py-2 rounded-lg border-2 text-sm transition-all ${
                  frameType === ft
                    ? 'border-accent-500 bg-accent-50 dark:bg-accent-500/10 text-accent-600 dark:text-accent-400'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 text-gray-700 dark:text-gray-300'
                }`}
                onClick={() => setFrameType(ft)}
              >
                {ft === '' ? '无' : ft === 'Opening' ? '首图' : '尾图'}
              </button>
            ))}
          </div>
          <select
            className="input-field"
            value={shotId}
            onChange={(e) => setShotId(e.target.value)}
          >
            <option value="">不关联镜头</option>
            {/* Shot options would be populated from store */}
          </select>
        </div>
      ),
    },
  ]

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Agent Input */}
      <JimengInput
        value={prompt}
        onChange={setPrompt}
        onSubmit={handleSubmit}
        disabled={activeTasks.length > 0}
        placeholder="描述你想生成的图片内容..."
        imageUpload={maxImages > 0 ? {
          images: uploadedImages.map((img) => ({ url: img.url, base64: img.base64 })),
          maxImages,
          onUpload: handleImageUpload,
          onRemove: handleRemoveImage,
        } : undefined}
        bottomActions={undefined}
      />

      {/* Param Panel */}
      <ParamPanel title="生成参数" sections={paramSections} defaultExpanded />

      {/* Active Tasks */}
      {activeTasks.length > 0 && (
        <div className="card space-y-3">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">活跃任务 ({activeTasks.length})</h3>
          {activeTasks.map((task) => (
            <div key={task.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-200 dark:border-gray-700">
              {task.status === 'generating' || task.status === 'in_queue' ? (
                <Loader2 size={20} className="text-accent-500 animate-spin flex-shrink-0" />
              ) : (
                <AlertCircle size={20} className="text-error flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700 dark:text-gray-300 truncate">{task.prompt}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  <span className={`badge ${statusMap[task.status].className} text-xs`}>
                    {statusMap[task.status].label}
                  </span>
                  {task.progress != null && ` · ${task.progress}%`}
                </p>
              </div>
              {task.status === 'in_queue' && (
                <button
                  className="p-1 text-gray-400 hover:text-error transition-colors"
                  onClick={() => cancelImageTask(task.id)}
                >
                  <X size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Generated Results */}
      {completedTasks.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">生成结果 ({completedTasks.length})</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {completedTasks.flatMap((task) =>
              task.outputImageUrls.map((url, idx) => (
                <div
                  key={`${task.id}-${idx}`}
                  className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 cursor-pointer hover:ring-2 hover:ring-accent-500 transition-all shadow-sm hover:shadow-lg"
                  onClick={() => setPreviewUrl(url)}
                >
                  <img src={url} alt="" className="w-full h-full object-cover" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                    <p className="text-xs text-white/90 line-clamp-1 mb-1">{task.prompt}</p>
                    <div className="flex items-center gap-1">
                      <button
                        className="flex-1 py-1 bg-accent-500/30 hover:bg-accent-500/50 rounded text-xs text-white backdrop-blur-sm transition-colors border border-accent-500/20"
                        onClick={(e) => { e.stopPropagation(); handleDownload(url) }}
                      >
                        下载
                      </button>
                    </div>
                  </div>
                  {task.tokensUsed && (
                    <div className="absolute top-2 right-2">
                      <span className="badge badge-secondary text-[10px] bg-black/50 text-white border-0">
                        {task.tokensUsed} tokens
                      </span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setPreviewUrl(null)}>
          <div className="relative max-w-5xl max-h-full" onClick={(e) => e.stopPropagation()}>
            <img src={previewUrl} alt="" className="max-w-full max-h-[90vh] object-contain rounded-lg" />
            <button
              className="absolute -top-3 -right-3 p-2 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full shadow-lg transition-colors"
              onClick={() => setPreviewUrl(null)}
            >
              <X size={16} className="text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
