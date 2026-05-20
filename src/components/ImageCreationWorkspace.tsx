import { useState, useCallback, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Palette, Image as ImageIcon, Layers, Hash, Clock, Loader2, AlertCircle, X } from 'lucide-react'
import { useAppStore } from '@/store/appStore'
import { useAIConfigStore } from '@/store/aiConfigStore'
import { getImageReqKeyForMode } from '@/services/imageGeneration'
import { fileToBase64 } from '@/utils/file'
import JimengInput from '@/components/JimengInput'
import ParamPanel from '@/components/ParamPanel'
import GenerationResultFeed, { type ResultFeedGroup } from '@/components/GenerationResultFeed'
import type { ImageGenerationMode, ImageGenerationTask, TaskQueueStatus } from '@/types/generation'

interface ImageCreationWorkspaceProps {
  defaultProjectId?: string
  defaultShotId?: string
  contextMode?: 'global' | 'shot-detail'
  hideContextSelector?: boolean
  filterTasksByShot?: boolean
  detailNavState?: {
    returnTo: string
    source: 'image-generation' | 'video-generation' | 'shot-detail' | 'assets'
  }
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
const IMAGE_COUNT_OPTIONS = [1, 2, 3, 4]
const IMAGE_DETAIL_NAV_STATE = { returnTo: '/content/image-generation', source: 'image-generation' } as const

const modeCapabilities: Record<ImageGenerationMode, { maxReferenceImages: number; supportsReferenceImages: boolean; hint: string }> = {
  'text-to-image': { maxReferenceImages: 10, supportsReferenceImages: true, hint: '可选添加参考图，最多 10 张。' },
  'image-to-image': { maxReferenceImages: 10, supportsReferenceImages: true, hint: '请至少添加 1 张参考图，最多 10 张。' },
  'text-to-image-31': { maxReferenceImages: 0, supportsReferenceImages: false, hint: '当前模式仅支持文本输入，不支持添加参考图。' },
  'text-to-image-30': { maxReferenceImages: 0, supportsReferenceImages: false, hint: '当前模式仅支持文本输入，不支持添加参考图。' },
  'text-to-image-21': { maxReferenceImages: 0, supportsReferenceImages: false, hint: '当前模式仅支持文本输入，不支持添加参考图。' },
}

export default function ImageCreationWorkspace({
  defaultProjectId = '',
  defaultShotId = '',
  contextMode = 'global',
  hideContextSelector = false,
  filterTasksByShot = false,
  detailNavState,
}: ImageCreationWorkspaceProps) {
  const navigate = useNavigate()
  const { imageTasks, projects, shots, submitImageTask: storeSubmitTask, retryImageTask, cancelImageTask } = useAppStore()
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
  const [uploadedImages, setUploadedImages] = useState<{ file?: File; url: string; base64: string }[]>([])

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
  const modeCapability = modeCapabilities[mode]
  const maxReferenceImages = forceSingle
    ? Math.min(1, modeCapability.maxReferenceImages)
    : modeCapability.maxReferenceImages
  const filteredShots = useMemo(() => shots.filter((shot) => shot.projectId === projectId), [shots, projectId])
  const currentContextShot = useMemo(
    () => (defaultShotId ? shots.find((shot) => shot.id === defaultShotId) || null : null),
    [defaultShotId, shots],
  )
  const resolvedDetailNavState = detailNavState ?? IMAGE_DETAIL_NAV_STATE

  const handleImageUpload = useCallback(async (files: FileList | null) => {
    if (!files) return
    const newImages = await Promise.all(
      Array.from(files).map(async (file) => ({
        file,
        url: URL.createObjectURL(file),
        base64: await fileToBase64(file),
      }))
    )
    setUploadedImages((prev) => [...prev, ...newImages].slice(0, maxReferenceImages))
  }, [maxReferenceImages])

  const handleRemoveImage = useCallback((index: number) => {
    setUploadedImages((prev) => prev.filter((_, currentIndex) => currentIndex !== index))
  }, [])

  useEffect(() => {
    const reqKey = getImageReqKeyForMode(mode)
    updateImageEndpoint(mode, { reqKey })
  }, [mode, updateImageEndpoint])

  useEffect(() => {
    setUploadedImages((prev) => prev.slice(0, maxReferenceImages))
  }, [maxReferenceImages])

  useEffect(() => {
    if (shotId && !filteredShots.some((shot) => shot.id === shotId)) {
      setShotId('')
    }
  }, [filteredShots, shotId])

  const handleSubmit = useCallback(async () => {
    if (!prompt.trim()) return
    if (mode === 'image-to-image' && uploadedImages.length === 0) return

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
        numImages,
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
  }, [prompt, mode, seed, useRandomSeed, resolution, forceSingle, numImages, scale, frameType, projectId, shotId, uploadedImages, shots, storeSubmitTask, aspectRatio])

  const mediaHint = useMemo(() => {
    if (modeCapability.supportsReferenceImages && forceSingle) {
      return '当前已启用强制单图，最多添加 1 张参考图。'
    }
    return modeCapability.hint
  }, [forceSingle, modeCapability])

  const loadTaskIntoEditor = useCallback((task: ImageGenerationTask) => {
    setPrompt(task.prompt)
    setMode(task.mode)
    setUseRandomSeed(task.seed == null || task.seed < 0)
    setSeed(task.seed ?? -1)
    setResolution(task.size ?? resolution)
    setAspectRatio(task.width && task.height ? `${Math.round(task.width / 256)}:${Math.round(task.height / 256)}` : aspectRatio)
    setScale(task.scale ?? 100)
    setNumImages(task.numImages ?? Math.max(task.outputImageUrls.length, 1))
    setForceSingle(Boolean(task.forceSingle))
    setFrameType(task.frameType ?? '')
    setProjectId(task.projectId ?? defaultProjectId)
    setShotId(task.shotId ?? defaultShotId)
    setUploadedImages(task.inputImageUrls.map((url, index) => ({
      url,
      base64: task.inputImageBase64[index] ?? '',
    })))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [aspectRatio, defaultProjectId, defaultShotId, resolution])

  const imageModeLabelMap = useMemo(
    () => Object.fromEntries(modeOptions.map((option) => [option.value, option.label])) as Record<ImageGenerationMode, string>,
    [],
  )

  const imageResultGroups = useMemo<ResultFeedGroup[]>(() => completedTasks.map((task) => {
    const resolutionLabel = task.resolution?.toUpperCase() || (task.size ? `${Math.round(Math.sqrt(task.size))}P` : '')
    const aspectLabel = task.width && task.height ? `${Math.round(task.width / 256)}:${Math.round(task.height / 256)}` : ''
    const meta = [
      imageModeLabelMap[task.mode],
      aspectLabel,
      resolutionLabel,
      task.tokensUsed ? `${task.tokensUsed.toLocaleString()} tokens` : '',
    ].filter(Boolean)

    return {
      id: task.id,
      createdAt: task.completedAt || task.createdAt,
      description: task.prompt,
      meta,
      media: task.outputImageUrls.map((url, index) => {
        const labels: string[] = []
        if (currentContextShot?.firstFrameId === task.keyFrameIds[index]) labels.push('当前首图')
        if (currentContextShot?.lastFrameId === task.keyFrameIds[index]) labels.push('当前尾图')

        return {
          id: `${task.id}-${index}`,
          type: 'image' as const,
          src: url,
          alt: task.prompt,
          aspectRatio: '1:1',
          labels,
          footerTag: task.tokensUsed ? `${task.tokensUsed} tokens` : undefined,
          onOpen: () => navigate(`/content/image-detail/${task.id}/${index}`, { state: resolvedDetailNavState }),
        }
      }),
      actions: [
        {
          label: '重新编辑',
          icon: 'edit',
          variant: 'outline',
          onClick: () => loadTaskIntoEditor(task),
        },
        {
          label: '再次生成',
          icon: 'retry',
          variant: 'secondary',
          onClick: () => retryImageTask(task.id),
        },
        {
          label: '更多操作',
          icon: 'more',
          variant: 'secondary',
          onClick: () => navigate(`/content/image-detail/${task.id}/0`, { state: resolvedDetailNavState }),
        },
      ],
    }
  }), [completedTasks, currentContextShot?.firstFrameId, currentContextShot?.lastFrameId, imageModeLabelMap, loadTaskIntoEditor, navigate, resolvedDetailNavState, retryImageTask])

  const paramSections = [
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
              className="rounded border-gray-300 text-gray-950 focus:ring-gray-950/10 dark:text-white dark:focus:ring-white/10"
            />
            <span className="body-text">随机</span>
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
      label: '补充控制',
      children: (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <label className="field-label">文本影响程度</label>
            <input
              type="range"
              min={0}
              max={100}
              value={scale}
              onChange={(event) => setScale(Number(event.target.value))}
              className="flex-1 accent-gray-950 dark:accent-white"
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
              className={`rounded-xl border px-4 py-2 text-sm transition-colors ${
                frameType === value
                    ? 'border-gray-950 bg-gray-50 text-gray-950 dark:border-white dark:bg-gray-800 dark:text-gray-50'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300 dark:border-gray-800 dark:text-gray-300'
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
                <label className="field-label">项目</label>
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
                <label className="field-label">镜头</label>
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
                  <p className="helper-text">如需关联镜头，请先选择项目</p>
                )}
              </div>
            </>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <JimengInput
        value={prompt}
        onChange={setPrompt}
        onSubmit={handleSubmit}
        disabled={activeTasks.length > 0}
        placeholder="描述你想生成的图片内容..."
        imageUpload={modeCapability.supportsReferenceImages ? {
          images: uploadedImages.map((image) => ({ url: image.url, base64: image.base64 })),
          maxImages: maxReferenceImages,
          onUpload: handleImageUpload,
          onRemove: handleRemoveImage,
        } : undefined}
        imageUploadLabel={mode === 'image-to-image' ? '添加参考图' : '添加参考图（可选）'}
        mediaHint={mediaHint}
        leftActions={!modeCapability.supportsReferenceImages ? (
          <div className="inline-flex items-center gap-2 rounded-xl border border-dashed border-gray-200 bg-gray-50 px-3 py-2 helper-text font-medium dark:border-gray-800 dark:bg-gray-900 dark:text-gray-500">
            <ImageIcon size={16} />
            当前模式不支持添加参考图
          </div>
        ) : undefined}
      />

      <div className="surface-subtle space-y-5 p-5">
        <div className="flex flex-col gap-2">
          <h3 className="panel-title text-gray-950 dark:text-gray-50">演示主控区</h3>
          <p className="helper-text">把最影响画面效果的选择放到第一屏，便于直接演示结果差异。</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="field-label">生成模式</label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {modeOptions.map((option) => (
                <button
                  key={option.value}
                  className={`flex items-center gap-2 rounded-2xl border p-3 text-left transition-colors ${
                    mode === option.value
                      ? 'border-gray-950 bg-gray-50 dark:border-white dark:bg-gray-800'
                      : 'border-gray-200 hover:border-gray-300 dark:border-gray-800 dark:hover:border-gray-700'
                  }`}
                  onClick={() => setMode(option.value)}
                >
                  <option.icon size={18} className={mode === option.value ? 'text-gray-950 dark:text-gray-50' : 'text-gray-400'} />
                  <div>
                    <div className="panel-value font-medium">{option.label}</div>
                    <div className="helper-text">{option.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr_0.9fr]">
            <div className="space-y-2">
              <label className="field-label">宽高比</label>
              <div className="flex flex-wrap gap-2">
                {ASPECT_RATIOS.map((ratio) => (
                  <button
                    key={ratio}
                    className={`rounded-xl border px-4 py-2 text-sm transition-colors ${
                      aspectRatio === ratio
                        ? 'border-gray-950 bg-gray-50 text-gray-950 dark:border-white dark:bg-gray-800 dark:text-gray-50'
                        : 'border-gray-200 text-gray-700 hover:border-gray-300 dark:border-gray-800 dark:text-gray-300'
                    }`}
                    onClick={() => setAspectRatio(ratio)}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="field-label">分辨率</label>
              <div className="flex gap-2">
                {RESOLUTION_OPTIONS.map((option) => (
                  <button
                    key={option.label}
                    className={`flex-1 rounded-2xl border p-3 text-center transition-colors ${
                      resolution === option.size
                        ? 'border-gray-950 bg-gray-50 dark:border-white dark:bg-gray-800'
                        : 'border-gray-200 hover:border-gray-300 dark:border-gray-800'
                    }`}
                    onClick={() => setResolution(option.size)}
                  >
                    <div className="panel-value font-medium">{option.label}</div>
                    <div className="helper-text">{option.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="field-label">生成数量</label>
              <div className="grid grid-cols-4 gap-2">
                {IMAGE_COUNT_OPTIONS.map((count) => (
                  <button
                    key={count}
                    className={`rounded-2xl border px-3 py-3 text-center text-sm font-medium transition-colors ${
                      numImages === count
                        ? 'border-gray-950 bg-gray-50 text-gray-950 dark:border-white dark:bg-gray-800 dark:text-gray-50'
                        : 'border-gray-200 text-gray-700 hover:border-gray-300 dark:border-gray-800 dark:text-gray-300'
                    }`}
                    onClick={() => {
                      setNumImages(count)
                      setForceSingle(count === 1)
                    }}
                  >
                    {count}张
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ParamPanel title="补充设置" sections={paramSections} defaultExpanded={contextMode === 'global'} />

      {activeTasks.length > 0 && (
        <div className="card space-y-3">
          <h3 className="panel-title text-gray-700 dark:text-gray-300">活跃任务 ({activeTasks.length})</h3>
          {activeTasks.map((task) => (
            <div key={task.id} className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-950">
              {task.status === 'generating' || task.status === 'in_queue' ? (
                <Loader2 size={20} className="flex-shrink-0 animate-spin text-gray-500 dark:text-gray-300" />
              ) : (
                <AlertCircle size={20} className="flex-shrink-0 text-error" />
              )}
              <div className="min-w-0 flex-1">
                <p className="body-text truncate">{task.prompt}</p>
                <p className="helper-text">
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
        <GenerationResultFeed
          title="生成结果"
          count={completedTasks.length}
          groups={imageResultGroups}
          variant="image-gallery"
        />
      )}
    </div>
  )
}
