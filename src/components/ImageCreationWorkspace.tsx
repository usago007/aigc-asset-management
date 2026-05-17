import { useState, useCallback, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Palette, Image as ImageIcon, Layers, Hash, Clock, Download, Loader2, AlertCircle, Eye, ExternalLink, X, CheckCircle2 } from 'lucide-react'
import { useAppStore } from '@/store/appStore'
import { useAIConfigStore } from '@/store/aiConfigStore'
import { getImageReqKeyForMode } from '@/services/imageGeneration'
import { fileToBase64 } from '@/utils/file'
import JimengInput from '@/components/JimengInput'
import ParamPanel from '@/components/ParamPanel'
import type { ImageGenerationMode, ImageGenerationTask, TaskQueueStatus } from '@/types/generation'

interface ImageCreationWorkspaceProps {
  defaultProjectId?: string
  defaultShotId?: string
  contextMode?: 'global' | 'shot-detail'
  hideContextSelector?: boolean
  filterTasksByShot?: boolean
}

const modeOptions: { value: ImageGenerationMode; label: string; icon: typeof Palette; desc: string }[] = [
  { value: 'text-to-image', label: '图片4.0', icon: Palette, desc: '最新一代，文生图/图生图一体化' },
  { value: 'image-to-image', label: '图生图', icon: ImageIcon, desc: '使用图片4.0引擎' },
  { value: 'text-to-image-31', label: '文生图3.1', icon: Layers, desc: '高质量文生图' },
  { value: 'text-to-image-30', label: '文生图3.0', icon: Hash, desc: '标准文生图' },
  { value: 'text-to-image-21', label: '文生图2.1', icon: Clock, desc: '基础文生图' },
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

export default function ImageCreationWorkspace({
  defaultProjectId = '',
  defaultShotId = '',
  contextMode = 'global',
  hideContextSelector = false,
  filterTasksByShot = false,
}: ImageCreationWorkspaceProps) {
  const navigate = useNavigate()
  const { imageTasks, projects, shots, submitImageTask: storeSubmitTask, cancelImageTask, updateShot } = useAppStore()
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
  const [projectId, setProjectId] = useState(defaultProjectId)
  const [shotId, setShotId] = useState(defaultShotId)
  const [uploadedImages, setUploadedImages] = useState<{ file: File; url: string; base64: string }[]>([])

  useEffect(() => {
    if (contextMode === 'shot-detail') {
      setProjectId(defaultProjectId)
      setShotId(defaultShotId)
    }
  }, [contextMode, defaultProjectId, defaultShotId])

  const scopedTasks = useMemo(() => {
    if (!filterTasksByShot) return imageTasks
    if (defaultShotId) return imageTasks.filter((task) => task.shotId === defaultShotId)
    if (defaultProjectId) return imageTasks.filter((task) => task.projectId === defaultProjectId)
    return imageTasks
  }, [imageTasks, filterTasksByShot, defaultProjectId, defaultShotId])

  const activeTasks = useMemo(
    () => scopedTasks.filter((task) => task.status !== 'done' && task.status !== 'failed'),
    [scopedTasks]
  )
  const completedTasks = useMemo(
    () => scopedTasks.filter((task) => task.status === 'done'),
    [scopedTasks]
  )
  const maxImages = forceSingle ? 1 : MAX_IMAGES[mode]
  const filteredShots = useMemo(() => shots.filter((shot) => shot.projectId === projectId), [shots, projectId])
  const currentContextShot = useMemo(
    () => (defaultShotId ? shots.find((shot) => shot.id === defaultShotId) || null : null),
    [defaultShotId, shots],
  )

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
    setUploadedImages((prev) => prev.filter((_, currentIndex) => currentIndex !== index))
  }, [])

  useEffect(() => {
    const reqKey = getImageReqKeyForMode(mode)
    updateImageEndpoint(mode, { reqKey })
  }, [mode, updateImageEndpoint])

  useEffect(() => {
    if (shotId && !filteredShots.some((shot) => shot.id === shotId)) {
      setShotId('')
    }
  }, [filteredShots, shotId])

  const handleSubmit = useCallback(async () => {
    if (!prompt.trim()) return
    if (maxImages > 0 && uploadedImages.length === 0 && mode === 'image-to-image') return

    const selectedShot = shotId ? shots.find((shot) => shot.id === shotId) : undefined
    if (shotId && !selectedShot) return
    if (selectedShot && selectedShot.projectId !== projectId) {
      setShotId('')
      return
    }

    const seedValue = useRandomSeed ? -1 : seed

    try {
      await storeSubmitTask(mode, {
        prompt: prompt.trim(),
        inputImageUrls: uploadedImages.map((image) => image.url),
        inputImageBase64: uploadedImages.map((image) => image.base64),
        seed: seedValue,
        size: resolution,
        width: parseInt(aspectRatio.split(':')[0], 10) * 256,
        height: parseInt(aspectRatio.split(':')[1], 10) * 256,
        scale,
        forceSingle,
        resolution: resolution >= 2048 * 2048 ? '4k' : '8k',
        projectId: projectId || undefined,
        shotId: shotId || undefined,
        frameType: frameType || undefined,
      })
      setPrompt('')
      setUploadedImages([])
    } catch (error) {
      console.error('Failed to submit image task:', error)
    }
  }, [prompt, mode, seed, useRandomSeed, resolution, forceSingle, scale, frameType, projectId, shotId, uploadedImages, maxImages, shots, storeSubmitTask, aspectRatio])

  const handleDownload = (url: string) => {
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'generated_image.png'
    anchor.target = '_blank'
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
  }

  const handleSelectFrame = useCallback((task: ImageGenerationTask, resultIndex: number, frameType: 'Opening' | 'Ending') => {
    if (!defaultShotId) return
    const keyFrameId = task.keyFrameIds[resultIndex]
    if (!keyFrameId) return
    updateShot(defaultShotId, frameType === 'Opening' ? { firstFrameId: keyFrameId } : { lastFrameId: keyFrameId })
  }, [defaultShotId, updateShot])

  const paramSections = [
    {
      id: 'mode',
      label: '生成模式',
      children: (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {modeOptions.map((option) => (
            <button
              key={option.value}
              className={`flex items-center gap-2 rounded-lg border-2 p-3 text-left transition-all ${
                mode === option.value
                  ? 'border-accent-500 bg-accent-50 dark:bg-accent-500/10'
                  : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
              }`}
              onClick={() => setMode(option.value)}
            >
              <option.icon size={18} className={mode === option.value ? 'text-accent-500' : 'text-gray-400'} />
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{option.label}</div>
                <div className="text-xs text-gray-500">{option.desc}</div>
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
          {RESOLUTION_OPTIONS.map((option) => (
            <button
              key={option.label}
              className={`flex-1 rounded-lg border-2 p-2 text-center transition-all ${
                resolution === option.size
                  ? 'border-accent-500 bg-accent-50 dark:bg-accent-500/10'
                  : 'border-gray-200 hover:border-gray-300 dark:border-gray-700'
              }`}
              onClick={() => setResolution(option.size)}
            >
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{option.label}</div>
              <div className="text-xs text-gray-500">{option.desc}</div>
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
              className={`rounded-lg border-2 px-4 py-2 text-sm transition-all ${
                aspectRatio === ratio
                  ? 'border-accent-500 bg-accent-50 text-accent-600 dark:bg-accent-500/10 dark:text-accent-400'
                  : 'border-gray-200 text-gray-700 hover:border-gray-300 dark:border-gray-700 dark:text-gray-300'
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
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={useRandomSeed}
              onChange={(event) => setUseRandomSeed(event.target.checked)}
              className="rounded border-gray-300 text-accent-500 focus:ring-accent-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">随机</span>
          </label>
          {!useRandomSeed && (
            <input
              type="number"
              value={seed}
              onChange={(event) => setSeed(Number(event.target.value))}
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
              onChange={(event) => setNumImages(Number(event.target.value))}
              className="flex-1 accent-accent-500"
            />
            <span className="w-8 text-sm font-mono">{numImages}</span>
          </div>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={forceSingle}
              onChange={(event) => setForceSingle(event.target.checked)}
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
              onChange={(event) => setScale(Number(event.target.value))}
              className="flex-1 accent-accent-500"
            />
            <span className="w-12 text-sm font-mono">{scale}</span>
          </div>
        </div>
      ),
    },
    {
      id: 'frame',
      label: '帧类型 / 归属上下文',
      children: (
        <div className="space-y-3">
          <div className="flex gap-2">
            {(['', 'Opening', 'Ending'] as const).map((value) => (
              <button
                key={value}
                className={`rounded-lg border-2 px-4 py-2 text-sm transition-all ${
                  frameType === value
                    ? 'border-accent-500 bg-accent-50 text-accent-600 dark:bg-accent-500/10 dark:text-accent-400'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300 dark:border-gray-700 dark:text-gray-300'
                }`}
                onClick={() => setFrameType(value)}
              >
                {value === '' ? '无' : value === 'Opening' ? '首图' : '尾图'}
              </button>
            ))}
          </div>
          {!hideContextSelector && (
            <>
              <div className="space-y-2">
                <label className="text-sm text-gray-700 dark:text-gray-300">项目</label>
                <select
                  className="input-field"
                  value={projectId}
                  onChange={(event) => {
                    setProjectId(event.target.value)
                    setShotId('')
                  }}
                >
                  <option value="">不绑定项目</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.projectName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-700 dark:text-gray-300">镜头</label>
                <select
                  className="input-field"
                  value={shotId}
                  onChange={(event) => setShotId(event.target.value)}
                  disabled={!projectId}
                >
                  <option value="">不关联镜头</option>
                  {filteredShots.map((shot) => (
                    <option key={shot.id} value={shot.id}>
                      {shot.shotName}
                    </option>
                  ))}
                </select>
                {!projectId && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">如需关联镜头，请先选择项目</p>
                )}
              </div>
            </>
          )}
        </div>
      ),
    },
  ]

  const renderImageTaskResult = (task: ImageGenerationTask, resultIndex: number, url: string) => (
    <div
      key={`${task.id}-${resultIndex}`}
      className="group relative aspect-square cursor-pointer overflow-hidden rounded-xl bg-gray-100 shadow-sm transition-all hover:ring-2 hover:ring-accent-500 hover:shadow-lg dark:bg-gray-800"
      onClick={() => navigate(`/content/image-detail/${task.id}/${resultIndex}`)}
    >
      {currentContextShot?.firstFrameId === task.keyFrameIds[resultIndex] && (
        <div className="absolute left-2 bottom-2 z-10">
          <span className="badge badge-info border-0 bg-accent-500/90 text-[10px] text-white">
            <CheckCircle2 size={10} />
            当前首图
          </span>
        </div>
      )}
      {currentContextShot?.lastFrameId === task.keyFrameIds[resultIndex] && (
        <div className="absolute right-2 bottom-2 z-10">
          <span className="badge badge-success border-0 bg-emerald-500/90 text-[10px] text-white">
            <CheckCircle2 size={10} />
            当前尾图
          </span>
        </div>
      )}
      <img src={url} alt="" className="h-full w-full object-cover" loading="lazy" />
      <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/60 via-transparent to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
        <p className="mb-1 line-clamp-1 text-xs text-white/90">{task.prompt}</p>
        <div className="flex items-center gap-1">
          <button
            className="flex flex-1 items-center justify-center gap-1 rounded border border-white/20 bg-white/15 py-1 text-xs text-white backdrop-blur-sm transition-colors hover:bg-white/25"
            onClick={(event) => {
              event.stopPropagation()
              navigate(`/content/image-detail/${task.id}/${resultIndex}`)
            }}
          >
            <Eye size={12} />
            详情
          </button>
          <button
            className="flex flex-1 items-center justify-center gap-1 rounded border border-accent-500/20 bg-accent-500/30 py-1 text-xs text-white backdrop-blur-sm transition-colors hover:bg-accent-500/50"
            onClick={(event) => {
              event.stopPropagation()
              handleDownload(url)
            }}
          >
            <Download size={12} />
            下载
          </button>
        </div>
        {contextMode === 'shot-detail' && defaultShotId && task.keyFrameIds[resultIndex] && (
          <div className="mt-1 flex items-center gap-1">
            <button
              className="flex flex-1 items-center justify-center gap-1 rounded border border-cyan-400/30 bg-cyan-500/30 py-1 text-xs text-white backdrop-blur-sm transition-colors hover:bg-cyan-500/50"
              onClick={(event) => {
                event.stopPropagation()
                handleSelectFrame(task, resultIndex, 'Opening')
              }}
            >
              设为首图
            </button>
            <button
              className="flex flex-1 items-center justify-center gap-1 rounded border border-emerald-400/30 bg-emerald-500/30 py-1 text-xs text-white backdrop-blur-sm transition-colors hover:bg-emerald-500/50"
              onClick={(event) => {
                event.stopPropagation()
                handleSelectFrame(task, resultIndex, 'Ending')
              }}
            >
              设为尾图
            </button>
          </div>
        )}
      </div>
      <div className="absolute left-2 top-2">
        <span className="badge badge-info border-0 bg-black/50 text-[10px] text-white">
          <ExternalLink size={10} />
          查看详情
        </span>
      </div>
      {task.tokensUsed ? (
        <div className="absolute right-2 top-2">
          <span className="badge badge-secondary border-0 bg-black/50 text-[10px] text-white">
            {task.tokensUsed} tokens
          </span>
        </div>
      ) : null}
    </div>
  )

  return (
    <div className="space-y-6">
      <JimengInput
        value={prompt}
        onChange={setPrompt}
        onSubmit={handleSubmit}
        disabled={activeTasks.length > 0}
        placeholder="描述你想生成的图片内容..."
        imageUpload={maxImages > 0 ? {
          images: uploadedImages.map((image) => ({ url: image.url, base64: image.base64 })),
          maxImages,
          onUpload: handleImageUpload,
          onRemove: handleRemoveImage,
        } : undefined}
      />

      <ParamPanel title="生成参数" sections={paramSections} defaultExpanded={contextMode === 'global'} />

      {activeTasks.length > 0 && (
        <div className="card space-y-3">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">活跃任务 ({activeTasks.length})</h3>
          {activeTasks.map((task) => (
            <div key={task.id} className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-white/5">
              {task.status === 'generating' || task.status === 'in_queue' ? (
                <Loader2 size={20} className="flex-shrink-0 animate-spin text-accent-500" />
              ) : (
                <AlertCircle size={20} className="flex-shrink-0 text-error" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-gray-700 dark:text-gray-300">{task.prompt}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  <span className={`badge ${statusMap[task.status].className} text-xs`}>
                    {statusMap[task.status].label}
                  </span>
                  {task.progress != null && ` · ${task.progress}%`}
                </p>
              </div>
              {task.status === 'in_queue' && (
                <button
                  className="p-1 text-gray-400 transition-colors hover:text-error"
                  onClick={() => cancelImageTask(task.id)}
                >
                  <X size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {completedTasks.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">生成结果 ({completedTasks.length})</h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {completedTasks.flatMap((task) => task.outputImageUrls.map((url, index) => renderImageTaskResult(task, index, url)))}
          </div>
        </div>
      )}
    </div>
  )
}
