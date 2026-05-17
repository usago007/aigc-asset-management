import { useState, useCallback, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Film, ImageIcon, ImagePlus, Clock, Hash, X, Loader2, AlertCircle } from 'lucide-react'
import { useGenerationStore } from '@/store/generationStore'
import { useAppStore } from '@/store/appStore'
import { fileToBase64 } from '@/utils/file'
import JimengInput from '@/components/JimengInput'
import ParamPanel from '@/components/ParamPanel'
import TaskCard from '@/components/TaskCard'
import type { GenerationMode, VideoGenerationTask } from '@/types/generation'

interface VideoCreationWorkspaceProps {
  defaultProjectId?: string
  defaultShotId?: string
  contextMode?: 'global' | 'shot-detail'
  hideContextSelector?: boolean
  filterTasksByShot?: boolean
}

const ASPECT_RATIOS = ['16:9', '4:3', '1:1', '3:4', '9:16', '21:9']

const statusMap: Record<string, { label: string; className: string }> = {
  submitting: { label: '提交中', className: 'badge-info' },
  in_queue: { label: '排队中', className: 'badge-warning' },
  generating: { label: '生成中', className: 'badge-info' },
  done: { label: '已完成', className: 'badge-success' },
  failed: { label: '失败', className: 'badge-error' },
  cancelled: { label: '已取消', className: 'badge-secondary' },
  expired: { label: '已过期', className: 'badge-error' },
  not_found: { label: '未找到', className: 'badge-warning' },
}

export default function VideoCreationWorkspace({
  defaultProjectId = '',
  defaultShotId = '',
  contextMode = 'global',
  hideContextSelector = false,
  filterTasksByShot = false,
}: VideoCreationWorkspaceProps) {
  const navigate = useNavigate()
  const { tasks, submitTask, retryTask, cancelTask } = useGenerationStore()
  const { projects, shots, updateShot } = useAppStore()

  const [mode, setMode] = useState<GenerationMode>('image-to-video-first-tail')
  const [prompt, setPrompt] = useState('')
  const [firstFrame, setFirstFrame] = useState<{ url: string; base64: string } | null>(null)
  const [lastFrame, setLastFrame] = useState<{ url: string; base64: string } | null>(null)
  const [frames, setFrames] = useState<121 | 241>(121)
  const [aspectRatio, setAspectRatio] = useState('16:9')
  const [useCustomSeed, setUseCustomSeed] = useState(false)
  const [seed, setSeed] = useState(-1)
  const [firstAspectRatio, setFirstAspectRatio] = useState<number | null>(null)
  const [lastAspectRatio, setLastAspectRatio] = useState<number | null>(null)
  const [aspectRatioMismatch, setAspectRatioMismatch] = useState(false)
  const [projectId, setProjectId] = useState(defaultProjectId)
  const [shotId, setShotId] = useState(defaultShotId)

  useEffect(() => {
    if (contextMode === 'shot-detail') {
      setProjectId(defaultProjectId)
      setShotId(defaultShotId)
    }
  }, [contextMode, defaultProjectId, defaultShotId])

  useEffect(() => {
    if (mode !== 'image-to-video-first-tail' || firstAspectRatio == null || lastAspectRatio == null) {
      setAspectRatioMismatch(false)
      return
    }
    setAspectRatioMismatch(Math.abs(firstAspectRatio - lastAspectRatio) > 0.1)
  }, [mode, firstAspectRatio, lastAspectRatio])

  const scopedTasks = useMemo(() => {
    if (!filterTasksByShot) return tasks
    if (defaultShotId) return tasks.filter((task) => task.shotId === defaultShotId)
    if (defaultProjectId) return tasks.filter((task) => task.projectId === defaultProjectId)
    return tasks
  }, [tasks, filterTasksByShot, defaultProjectId, defaultShotId])

  const activeTasks = useMemo(
    () => scopedTasks.filter((task) => ['submitting', 'in_queue', 'generating'].includes(task.status)),
    [scopedTasks]
  )
  const completedTasks = useMemo(
    () => scopedTasks.filter((task) => task.status === 'done'),
    [scopedTasks]
  )
  const filteredShots = useMemo(() => shots.filter((shot) => shot.projectId === projectId), [shots, projectId])
  const currentContextShot = useMemo(
    () => (defaultShotId ? shots.find((shot) => shot.id === defaultShotId) || null : null),
    [defaultShotId, shots],
  )

  useEffect(() => {
    if (shotId && !filteredShots.some((shot) => shot.id === shotId)) {
      setShotId('')
    }
  }, [filteredShots, shotId])

  const handleFirstFrameUpload = useCallback(async (file: File | null) => {
    if (!file) {
      setFirstFrame(null)
      setFirstAspectRatio(null)
      return
    }
    const url = URL.createObjectURL(file)
    const base64 = await fileToBase64(file)
    setFirstFrame({ url, base64 })

    const image = new Image()
    image.onload = () => setFirstAspectRatio(image.width / image.height)
    image.src = url
  }, [])

  const handleLastFrameUpload = useCallback(async (file: File | null) => {
    if (!file) {
      setLastFrame(null)
      setLastAspectRatio(null)
      return
    }
    const url = URL.createObjectURL(file)
    const base64 = await fileToBase64(file)
    setLastFrame({ url, base64 })

    const image = new Image()
    image.onload = () => setLastAspectRatio(image.width / image.height)
    image.src = url
  }, [])

  const handleSubmit = useCallback(async () => {
    if (!prompt.trim()) return
    if (mode === 'image-to-video-first' && !firstFrame) return
    if (mode === 'image-to-video-first-tail' && (!firstFrame || !lastFrame)) return

    const selectedShot = shotId ? shots.find((shot) => shot.id === shotId) : undefined
    if (shotId && !selectedShot) return
    if (selectedShot && selectedShot.projectId !== projectId) {
      setShotId('')
      return
    }

    const binaryDataBase64: string[] = []
    if (firstFrame?.base64) binaryDataBase64.push(firstFrame.base64)
    if (lastFrame?.base64) binaryDataBase64.push(lastFrame.base64)

    await submitTask(mode, {
      prompt: prompt.trim(),
      binary_data_base64: binaryDataBase64.length > 0 ? binaryDataBase64 : undefined,
      seed: useCustomSeed ? seed : -1,
      frames,
      aspect_ratio: aspectRatio,
      projectId: projectId || undefined,
      shotId: shotId || undefined,
    })

    setPrompt('')
    setFirstFrame(null)
    setLastFrame(null)
    setFirstAspectRatio(null)
    setLastAspectRatio(null)
    setAspectRatioMismatch(false)
  }, [mode, prompt, firstFrame, lastFrame, useCustomSeed, seed, frames, aspectRatio, projectId, shotId, shots, submitTask])

  const handleSelectFinalVideo = useCallback((taskId: string) => {
    if (!defaultShotId) return
    updateShot(defaultShotId, { finalVideoTaskId: taskId })
  }, [defaultShotId, updateShot])

  const paramSections = [
    {
      id: 'mode',
      label: '生成模式',
      icon: <Film size={16} />,
      children: (
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: 'text-to-video', label: '文生视频', icon: <Film size={16} /> },
            { value: 'image-to-video-first', label: '首帧图生', icon: <ImageIcon size={16} /> },
            { value: 'image-to-video-first-tail', label: '首尾帧图生', icon: <ImagePlus size={16} /> },
          ].map((option) => (
            <button
              key={option.value}
              className={`flex items-center gap-2 rounded-lg border-2 p-3 transition-all ${
                mode === option.value
                  ? 'border-accent-500 bg-accent-50 dark:bg-accent-500/10'
                  : 'border-gray-200 hover:border-gray-300 dark:border-gray-700'
              }`}
              onClick={() => {
                setMode(option.value as GenerationMode)
                if (option.value === 'text-to-video') {
                  setFirstFrame(null)
                  setLastFrame(null)
                  setFirstAspectRatio(null)
                  setLastAspectRatio(null)
                } else if (option.value === 'image-to-video-first') {
                  setLastFrame(null)
                  setLastAspectRatio(null)
                }
              }}
            >
              {option.icon}
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{option.label}</span>
            </button>
          ))}
        </div>
      ),
    },
    {
      id: 'duration',
      label: '时长',
      icon: <Clock size={16} />,
      children: (
        <div className="flex gap-4">
          {[
            { value: 121, label: '5秒(121帧)' },
            { value: 241, label: '10秒(241帧)' },
          ].map((option) => (
            <label key={option.value} className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="frames"
                checked={frames === option.value}
                onChange={() => setFrames(option.value as 121 | 241)}
                className="accent-accent-500"
              />
              <span className="text-sm">{option.label}</span>
            </label>
          ))}
        </div>
      ),
    },
    {
      id: 'aspect',
      label: '宽高比',
      icon: <Hash size={16} />,
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
      icon: <Hash size={16} />,
      children: (
        <div className="flex items-center gap-3">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={!useCustomSeed}
              onChange={(event) => setUseCustomSeed(!event.target.checked)}
              className="rounded border-gray-300 text-accent-500 focus:ring-accent-500"
            />
            <span className="text-sm">随机</span>
          </label>
          {useCustomSeed && (
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
      id: 'ownership',
      label: '归属上下文',
      icon: <ImageIcon size={16} />,
      children: (
        <div className="space-y-3">
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
                  <option value="">不绑定镜头</option>
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
    {
      id: 'warning',
      label: '宽高比检测',
      icon: <AlertCircle size={16} />,
      children: aspectRatioMismatch ? (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-700 dark:border-yellow-500/30 dark:bg-yellow-500/10 dark:text-yellow-300">
          警告：首尾帧宽高比差异较大，可能影响生成效果
        </div>
      ) : (
        <div className="text-sm text-gray-500 dark:text-gray-400">宽高比检测通过</div>
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
        placeholder="描述你想生成的视频内容..."
        videoUpload={mode !== 'text-to-video' ? {
          video: firstFrame ? { url: firstFrame.url, base64: firstFrame.base64 } : null,
          onUpload: handleFirstFrameUpload,
          onRemove: () => { setFirstFrame(null); setFirstAspectRatio(null) },
        } : undefined}
        bottomActions={
          <>
            {mode === 'image-to-video-first-tail' && !lastFrame && (
              <label className="group cursor-pointer rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700" title="上传尾帧图">
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  className="hidden"
                  onChange={(event) => handleLastFrameUpload(event.target.files?.[0] || null)}
                />
                <ImagePlus size={18} className="text-gray-600 transition-colors group-hover:text-accent-500 dark:text-gray-400" />
              </label>
            )}
          </>
        }
      />

      {mode === 'image-to-video-first-tail' && lastFrame && (
        <div className="flex items-center gap-3">
          <div className="group relative h-16 w-24 overflow-hidden rounded-lg border-2 border-gray-200 shadow-sm dark:border-gray-700">
            <img src={lastFrame.url} alt="尾帧" className="h-full w-full object-cover" />
            <button
              className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-gray-900 opacity-0 shadow-md transition-opacity group-hover:opacity-100 hover:bg-red-500 dark:bg-gray-700"
              onClick={() => { setLastFrame(null); setLastAspectRatio(null) }}
            >
              <X size={12} className="text-white" />
            </button>
          </div>
          <span className="text-xs text-gray-600 dark:text-gray-400">尾帧图</span>
        </div>
      )}

      <ParamPanel title="生成参数" sections={paramSections} defaultExpanded={contextMode === 'global'} />

      {activeTasks.length > 0 && (
        <div className="card space-y-3">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">活跃任务 ({activeTasks.length})</h3>
          {activeTasks.map((task) => (
            <div key={task.id} className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/50">
              {task.status === 'generating' || task.status === 'in_queue' ? (
                <Loader2 size={20} className="flex-shrink-0 animate-spin text-accent-500" />
              ) : (
                <AlertCircle size={20} className="flex-shrink-0 text-error" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-gray-700 dark:text-gray-200">{task.prompt}</p>
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
                  onClick={() => cancelTask(task.id)}
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {completedTasks.map((task: VideoGenerationTask) => (
              <TaskCard
                key={task.id}
                task={task}
                onViewDetail={() => navigate(`/content/video-detail/${task.id}`)}
                onRetry={() => retryTask(task.id)}
                onCancel={() => cancelTask(task.id)}
                extraActions={
                  contextMode === 'shot-detail' && defaultShotId ? (
                    currentContextShot?.finalVideoTaskId === task.id ? (
                      <span className="badge badge-success text-xs">当前最终视频</span>
                    ) : (
                      <button
                        onClick={() => handleSelectFinalVideo(task.id)}
                        className="btn-primary text-xs px-3 py-1.5"
                      >
                        设为最终视频
                      </button>
                    )
                  ) : undefined
                }
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
