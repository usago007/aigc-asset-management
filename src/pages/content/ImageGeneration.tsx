import { useState, useCallback, useMemo } from 'react'
import { useAppStore } from '@/store/appStore'
import { showToast } from '@/utils/toast'
import type { ImageGenerationMode } from '@/types/generation'
import type { TaskQueueStatus } from '@/types/generation'
import { IMAGE_API_CONFIG } from '@/services/imageGeneration'
import { Palette, Image, Wand2, Zap, Eraser, Download, Maximize2 } from 'lucide-react'

const modeOptions: { value: ImageGenerationMode; label: string; icon: typeof Palette }[] = [
  { value: 'text-to-image', label: '文生图', icon: Palette },
  { value: 'image-to-image', label: '图生图', icon: Image },
  { value: 'stylization-edit', label: '风格化编辑', icon: Wand2 },
  { value: 'super-resolution', label: '智能超清', icon: Zap },
  { value: 'inpainting', label: '局部重绘', icon: Eraser },
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
  'text-to-image': 0,
  'image-to-image': 10,
  'stylization-edit': 14,
  'super-resolution': 1,
  'inpainting': 1,
}

export default function ImageGeneration() {
  const { shots, imageTasks, submitImageTask, retryImageTask, cancelImageTask, deleteImageTask } = useAppStore()

  const [mode, setMode] = useState<ImageGenerationMode>('text-to-image')
  const [prompt, setPrompt] = useState('')
  const [frameType, setFrameType] = useState<'Opening' | 'Ending'>('Opening')
  const [selectedShotId, setSelectedShotId] = useState('')
  const [uploadedImages, setUploadedImages] = useState<{ url: string; base64: string }[]>([])
  const [resolution, setResolution] = useState(2048 * 2048)
  const [aspectRatio, setAspectRatio] = useState('16:9')
  const [useCustomSeed, setUseCustomSeed] = useState(false)
  const [seed, setSeed] = useState(-1)
  const [forceSingle, setForceSingle] = useState(false)
  const [scale, setScale] = useState(50)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const maxImages = MAX_IMAGES[mode]

  const handleImageUpload = useCallback((files: FileList | null) => {
    if (!files) return
    const remaining = maxImages - uploadedImages.length
    if (remaining <= 0) {
      showToast('warning', `最多上传 ${maxImages} 张图片`)
      return
    }
    const filesToProcess = Array.from(files).slice(0, remaining)
    filesToProcess.forEach((file) => {
      if (!file.type.match(/image\/(jpeg|png)/)) {
        showToast('error', `${file.name} 格式不支持，仅支持JPEG/PNG`)
        return
      }
      if (file.size > 15 * 1024 * 1024) {
        showToast('error', `${file.name} 超过15MB限制`)
        return
      }
      const reader = new FileReader()
      reader.onload = (e) => {
        const base64 = e.target?.result as string
        setUploadedImages((prev) => [...prev, { url: base64, base64 }])
      }
      reader.readAsDataURL(file)
    })
  }, [maxImages, uploadedImages.length])

  const removeImage = useCallback((index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const handleSubmit = useCallback(() => {
    if (!prompt.trim()) {
      showToast('warning', '请输入Prompt')
      return
    }
    if (maxImages > 0 && uploadedImages.length === 0 && mode !== 'text-to-image') {
      showToast('warning', '请上传图片')
      return
    }
    submitImageTask(mode, {
      prompt: prompt.trim(),
      inputImageUrls: [],
      inputImageBase64: uploadedImages.map((img) => img.base64),
      size: resolution,
      scale,
      seed: useCustomSeed ? seed : -1,
      forceSingle,
      shotId: selectedShotId || undefined,
      frameType,
    })
    setPrompt('')
  }, [mode, prompt, uploadedImages, resolution, scale, useCustomSeed, seed, forceSingle, selectedShotId, frameType, submitImageTask, maxImages])

  const activeTasks = useMemo(() =>
    imageTasks.filter((t) => ['submitting', 'in_queue', 'generating'].includes(t.status)),
    [imageTasks]
  )

  const doneTasks = useMemo(() =>
    imageTasks.filter((t) => t.status === 'done' && t.outputImageUrls.length > 0),
    [imageTasks]
  )

  const latestDone = doneTasks.length > 0 ? doneTasks[doneTasks.length - 1] : null

  const handleDownload = useCallback((url: string) => {
    const a = document.createElement('a')
    a.href = url
    a.download = 'generated_image.png'
    a.target = '_blank'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-gray-100">图片生成工作台</h1>
      </div>

      <div className="card space-y-6">
        <div>
          <label className="label-field">生成模式</label>
          <div className="flex flex-wrap gap-2">
            {modeOptions.map((opt) => {
              const Icon = opt.icon
              return (
                <button
                  key={opt.value}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                    mode === opt.value
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => { setMode(opt.value); setUploadedImages([]) }}
                >
                  <Icon size={16} />
                  {opt.label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-field">帧类型</label>
            <div className="flex gap-2">
              <button
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  frameType === 'Opening' ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
                onClick={() => setFrameType('Opening')}
              >
                首图 (Opening)
              </button>
              <button
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  frameType === 'Ending' ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
                onClick={() => setFrameType('Ending')}
              >
                尾图 (Ending)
              </button>
            </div>
          </div>
          <div>
            <label className="label-field">关联镜头（可选）</label>
            <select
              className="input-field"
              value={selectedShotId}
              onChange={(e) => setSelectedShotId(e.target.value)}
            >
              <option value="">不关联镜头</option>
              {shots.map((s) => (
                <option key={s.id} value={s.id}>{s.shotName}</option>
              ))}
            </select>
          </div>
        </div>

        {maxImages > 0 && (
          <div>
            <label className="label-field">上传图片 {uploadedImages.length}/{maxImages}</label>
            <div className="flex flex-wrap gap-3">
              {uploadedImages.map((img, idx) => (
                <div key={idx} className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700 group">
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                  <button
                    className="absolute top-0 right-0 bg-red-600 text-white rounded-bl p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeImage(idx)}
                  >
                    ✕
                  </button>
                </div>
              ))}
              {uploadedImages.length < maxImages && (
                <label className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-primary-500 flex items-center justify-center cursor-pointer transition-colors">
                  <input
                    type="file"
                    accept="image/jpeg,image/png"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e.target.files)}
                    multiple={maxImages > 1}
                  />
                  <span className="text-gray-600 dark:text-gray-500 text-2xl">+</span>
                </label>
              )}
            </div>
          </div>
        )}

        <div>
          <label className="label-field">Prompt</label>
          <textarea
            className="input-field min-h-[80px]"
            placeholder="描述你想要生成的图片内容..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            maxLength={800}
          />
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {prompt.length}/800 {prompt.length > 400 && prompt.length <= 800 && '(较长，可能影响生成效果)'}
            {prompt.length > 800 && '(超出最大长度)'}
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
          <label className="label-field">高级参数</label>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label-field text-xs text-gray-600 dark:text-gray-400">分辨率</label>
              <div className="flex gap-2">
                {RESOLUTION_OPTIONS.map((opt) => (
                  <button
                    key={opt.label}
                    className={`flex-1 py-1.5 rounded text-xs transition-all ${
                      resolution === opt.size ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                    onClick={() => setResolution(opt.size)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label-field text-xs text-gray-600 dark:text-gray-400">宽高比</label>
              <div className="flex flex-wrap gap-1">
                {ASPECT_RATIOS.map((ar) => (
                  <button
                    key={ar}
                    className={`px-2 py-1 rounded text-xs transition-all ${
                      aspectRatio === ar ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                    onClick={() => setAspectRatio(ar)}
                  >
                    {ar}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="label-field text-xs text-gray-600 dark:text-gray-400">其他</label>
              <label className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                <input type="checkbox" checked={forceSingle} onChange={(e) => setForceSingle(e.target.checked)} />
                强制单图
              </label>
              <label className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                <input type="checkbox" checked={useCustomSeed} onChange={(e) => setUseCustomSeed(e.target.checked)} />
                自定义Seed
              </label>
            </div>
          </div>
          {useCustomSeed && (
            <input
              type="number"
              className="input-field mt-2"
              value={seed}
              onChange={(e) => setSeed(parseInt(e.target.value) || -1)}
              placeholder="随机种子"
            />
          )}
          <div className="mt-2">
            <label className="label-field text-xs text-gray-600 dark:text-gray-400">文本影响程度 (Scale): {scale}</label>
            <input
              type="range"
              min="0"
              max="100"
              value={scale}
              onChange={(e) => setScale(parseInt(e.target.value))}
              className="w-full accent-primary-500"
            />
          </div>
        </div>

        <button
          className="btn-primary w-full py-3 text-lg font-medium"
          onClick={handleSubmit}
          disabled={!prompt.trim() || (maxImages > 0 && uploadedImages.length === 0 && mode !== 'text-to-image')}
        >
          提交生成
        </button>
      </div>

      {activeTasks.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">生成中的任务</h3>
          <div className="space-y-3">
            {activeTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 bg-gray-100/50 dark:bg-gray-800/50 rounded-lg">
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-800 dark:text-gray-200">{task.prompt.slice(0, 40)}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">{modeOptions.find(m => m.value === task.mode)?.label} · {statusMap[task.status].label}</div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-2">
                    <div
                      className={`h-1.5 rounded-full transition-all ${task.status === 'generating' ? 'bg-primary-500' : 'bg-yellow-500'}`}
                      style={{ width: task.status === 'generating' ? `${task.progress || 50}%` : '20%' }}
                    />
                  </div>
                </div>
                <button
                  className="ml-3 px-3 py-1 text-xs bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded transition-colors"
                  onClick={() => cancelImageTask(task.id)}
                >
                  取消
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {latestDone && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">生成结果</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {latestDone.outputImageUrls.map((url, idx) => (
              <div key={idx} className="relative group rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700">
                <img src={url} alt="" className="w-full aspect-square object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                    onClick={() => setPreviewUrl(url)}
                  >
                    <Maximize2 size={16} className="text-white" />
                  </button>
                  <button
                    className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                    onClick={() => handleDownload(url)}
                  >
                    <Download size={16} className="text-white" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {previewUrl && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setPreviewUrl(null)}>
          <div className="relative max-w-4xl max-h-full" onClick={(e) => e.stopPropagation()}>
            <img src={previewUrl} alt="" className="max-w-full max-h-[90vh] object-contain rounded-lg" />
            <button
              className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
              onClick={() => setPreviewUrl(null)}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
