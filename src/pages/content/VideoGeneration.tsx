import { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Film, Image, ImagePlus } from 'lucide-react'
import { useGenerationStore } from '@/store/generationStore'
import { GenerationMode } from '@/types/generation'
import ImageUploader from '@/components/ImageUploader'
import PromptInput from '@/components/PromptInput'
import TaskCard from '@/components/TaskCard'
import { showToast } from '@/utils/toast'

const ASPECT_RATIOS = ['16:9', '4:3', '1:1', '3:4', '9:16', '21:9']
const ACTIVE_STATUSES = ['submitting', 'in_queue', 'generating']

export default function VideoGeneration() {
  const navigate = useNavigate()
  const { tasks, submitTask, retryTask, cancelTask } = useGenerationStore()

  const [mode, setMode] = useState<GenerationMode>('image-to-video-first-tail')
  const [prompt, setPrompt] = useState('')
  const [firstFrameBase64, setFirstFrameBase64] = useState<string | null>(null)
  const [lastFrameBase64, setLastFrameBase64] = useState<string | null>(null)
  const [frames, setFrames] = useState<121 | 241>(121)
  const [aspectRatio, setAspectRatio] = useState('16:9')
  const [useCustomSeed, setUseCustomSeed] = useState(false)
  const [seed, setSeed] = useState(-1)
  const [firstAspectRatio, setFirstAspectRatio] = useState<number | null>(null)
  const [lastAspectRatio, setLastAspectRatio] = useState<number | null>(null)
  const [aspectRatioMismatch, setAspectRatioMismatch] = useState(false)

  useEffect(() => {
    if (mode !== 'image-to-video-first-tail' || firstAspectRatio == null || lastAspectRatio == null) {
      setAspectRatioMismatch(false)
      return
    }
    const diff = Math.abs(firstAspectRatio - lastAspectRatio)
    setAspectRatioMismatch(diff > 0.1)
  }, [mode, firstAspectRatio, lastAspectRatio])

  const handleModeChange = useCallback((newMode: GenerationMode) => {
    setMode(newMode)
    if (newMode === 'text-to-video') {
      setFirstFrameBase64(null)
      setLastFrameBase64(null)
      setFirstAspectRatio(null)
      setLastAspectRatio(null)
    } else if (newMode === 'image-to-video-first') {
      setLastFrameBase64(null)
      setLastAspectRatio(null)
    }
  }, [])

  const isFormValid = useCallback(() => {
    if (!prompt.trim()) return false
    if (mode === 'image-to-video-first' && !firstFrameBase64) return false
    if (mode === 'image-to-video-first-tail' && (!firstFrameBase64 || !lastFrameBase64)) return false
    return true
  }, [mode, prompt, firstFrameBase64, lastFrameBase64])

  const handleSubmit = useCallback(async () => {
    if (!isFormValid()) return

    if (mode === 'image-to-video-first-tail' && aspectRatioMismatch) {
      showToast('warning', '首尾帧宽高比差异较大，可能影响生成效果')
    }

    const binary_data_base64: string[] = []
    if (firstFrameBase64) binary_data_base64.push(firstFrameBase64)
    if (lastFrameBase64) binary_data_base64.push(lastFrameBase64)

    await submitTask(mode, {
      prompt: prompt.trim(),
      binary_data_base64: binary_data_base64.length > 0 ? binary_data_base64 : undefined,
      seed: useCustomSeed ? seed : -1,
      frames,
      aspect_ratio: aspectRatio,
    })

    setPrompt('')
    setFirstFrameBase64(null)
    setLastFrameBase64(null)
    setFirstAspectRatio(null)
    setLastAspectRatio(null)
    setAspectRatioMismatch(false)
  }, [isFormValid, mode, aspectRatioMismatch, firstFrameBase64, lastFrameBase64, prompt, useCustomSeed, seed, frames, aspectRatio, submitTask])

  const activeTasks = tasks.filter((t) => ACTIVE_STATUSES.includes(t.status))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-gray-100">视频生成</h1>
      </div>

      <div className="card space-y-6">
        <div>
          <h2 className="font-display font-bold text-gray-100 mb-3">生成模式</h2>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="mode"
                value="text-to-video"
                checked={mode === 'text-to-video'}
                onChange={() => handleModeChange('text-to-video')}
                className="accent-accent-500"
              />
              <Film size={16} className="text-gray-400" />
              <span className="text-sm text-gray-300">文生视频</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="mode"
                value="image-to-video-first"
                checked={mode === 'image-to-video-first'}
                onChange={() => handleModeChange('image-to-video-first')}
                className="accent-accent-500"
              />
              <Image size={16} className="text-gray-400" />
              <span className="text-sm text-gray-300">首帧图生视频</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="mode"
                value="image-to-video-first-tail"
                checked={mode === 'image-to-video-first-tail'}
                onChange={() => handleModeChange('image-to-video-first-tail')}
                className="accent-accent-500"
              />
              <ImagePlus size={16} className="text-gray-400" />
              <span className="text-sm text-gray-300">首尾帧图生视频</span>
            </label>
          </div>
        </div>

        {(mode === 'image-to-video-first' || mode === 'image-to-video-first-tail') && (
          <div>
            <h2 className="font-display font-bold text-gray-100 mb-3">参考图像</h2>
            {mode === 'image-to-video-first-tail' ? (
              <div className="grid grid-cols-2 gap-4">
                <ImageUploader
                  label="首帧图像"
                  value={firstFrameBase64}
                  onChange={setFirstFrameBase64}
                  aspectRatio={firstAspectRatio}
                  onAspectRatioChange={setFirstAspectRatio}
                />
                <ImageUploader
                  label="尾帧图像"
                  value={lastFrameBase64}
                  onChange={setLastFrameBase64}
                  aspectRatio={lastAspectRatio}
                  onAspectRatioChange={setLastAspectRatio}
                />
              </div>
            ) : (
              <ImageUploader
                label="首帧图像"
                value={firstFrameBase64}
                onChange={setFirstFrameBase64}
                aspectRatio={firstAspectRatio}
                onAspectRatioChange={setFirstAspectRatio}
              />
            )}
            {aspectRatioMismatch && (
              <p className="text-warning text-xs mt-2">
                警告：首尾帧宽高比差异较大
              </p>
            )}
          </div>
        )}

        <div>
          <h2 className="font-display font-bold text-gray-100 mb-3">提示词</h2>
          <PromptInput value={prompt} onChange={setPrompt} />
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div>
            <h2 className="font-display font-bold text-gray-100 mb-3">时长</h2>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="frames"
                  value={121}
                  checked={frames === 121}
                  onChange={() => setFrames(121)}
                  className="accent-accent-500"
                />
                <span className="text-sm text-gray-300">5秒(121帧)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="frames"
                  value={241}
                  checked={frames === 241}
                  onChange={() => setFrames(241)}
                  className="accent-accent-500"
                />
                <span className="text-sm text-gray-300">10秒(241帧)</span>
              </label>
            </div>
          </div>

          <div>
            <h2 className="font-display font-bold text-gray-100 mb-3">宽高比</h2>
            <div className="flex flex-wrap gap-2">
              {ASPECT_RATIOS.map((ratio) => (
                <button
                  key={ratio}
                  onClick={() => setAspectRatio(ratio)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-all duration-200 ${
                    aspectRatio === ratio
                      ? 'bg-accent-500 text-white'
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  }`}
                >
                  {ratio}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-display font-bold text-gray-100 mb-3">Seed</h2>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="seed"
                  value="random"
                  checked={!useCustomSeed}
                  onChange={() => setUseCustomSeed(false)}
                  className="accent-accent-500"
                />
                <span className="text-sm text-gray-300">随机</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="seed"
                  value="custom"
                  checked={useCustomSeed}
                  onChange={() => setUseCustomSeed(true)}
                  className="accent-accent-500"
                />
                <span className="text-sm text-gray-300">自定义</span>
              </label>
            </div>
            {useCustomSeed && (
              <input
                type="number"
                value={seed}
                onChange={(e) => setSeed(Number(e.target.value))}
                className="input-field mt-2"
                placeholder="输入种子值"
              />
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-gray-700/50">
          <button
            onClick={handleSubmit}
            disabled={!isFormValid()}
            className="btn-primary w-full sm:w-auto"
          >
            提交生成任务
          </button>
        </div>
      </div>

      {activeTasks.length > 0 && (
        <div>
          <h2 className="font-display font-bold text-gray-100 mb-4">
            活跃任务 ({activeTasks.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onViewDetail={() => navigate(`/content/task/${task.id}`)}
                onRetry={() => retryTask(task.id)}
                onCancel={() => cancelTask(task.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
