import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Edit2, Film, FolderKanban, ImageIcon, Sparkles, Video, Clapperboard } from 'lucide-react'
import { useAppStore } from '@/store/appStore'
import { useGenerationStore } from '@/store/generationStore'
import { formatDate } from '@/utils/date'
import { showToast } from '@/utils/toast'
import Modal from '@/components/Modal'
import ImageCreationWorkspace from '@/components/ImageCreationWorkspace'
import VideoCreationWorkspace from '@/components/VideoCreationWorkspace'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { KeyFrame, Shot } from '@/types'
import type { ImageGenerationTask, VideoGenerationTask } from '@/types/generation'

type FrameLookup = {
  frame: KeyFrame | null
  previewUrl: string | null
  sourceTask: ImageGenerationTask | null
}

type VideoLookup = {
  task: VideoGenerationTask | null
  previewUrl: string | null
  isSelected: boolean
}

const summarizeText = (value: string, max = 96) => {
  if (!value) return '-'
  return value.length > max ? `${value.slice(0, max)}...` : value
}

const FrameTraceCard = ({
  label,
  lookup,
  onOpenDetail,
}: {
  label: string
  lookup: FrameLookup
  onOpenDetail: (taskId: string, resultIndex: number) => void
}) => {
  if (!lookup.frame) {
    return (
      <div className="surface-muted p-4">
        <div className="body-text font-medium">{label}</div>
        <p className="body-muted mt-3">未绑定{label}记录</p>
      </div>
    )
  }

  const resultIndex = lookup.sourceTask ? lookup.sourceTask.keyFrameIds.indexOf(lookup.frame.id) : -1

  return (
    <div className="surface-muted p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="body-text font-medium">{label}</div>
          <p className="body-text mt-1 font-semibold text-gray-900 dark:text-gray-100">{lookup.frame.name}</p>
        </div>
        <Badge variant="outline">{lookup.frame.type === 'Opening' ? '首图' : '尾图'}</Badge>
      </div>
      {lookup.previewUrl ? (
        <button
          type="button"
          className="mt-4 block w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800"
          onClick={() => {
            if (lookup.sourceTask && resultIndex >= 0) {
              onOpenDetail(lookup.sourceTask.id, resultIndex)
            }
          }}
        >
          <img src={lookup.previewUrl} alt={lookup.frame.name} className="h-40 w-full object-cover" />
        </button>
      ) : (
        <div className="mt-4 flex h-40 items-center justify-center rounded-lg border border-dashed border-gray-200 bg-white text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-900/50 dark:text-gray-400">
          暂无可追溯图片
        </div>
      )}
      <div className="mt-4 space-y-2 body-text">
        <div className="body-muted">
          <span className="body-text font-medium">提示词：</span>
          {summarizeText(lookup.frame.promptText, 120)}
        </div>
        <div className="body-muted">
          <span className="body-text font-medium">模型：</span>
          {lookup.frame.modelName} {lookup.frame.modelVersion}
        </div>
        <div className="body-muted">
          <span className="body-text font-medium">生成时间：</span>
          {formatDate(lookup.frame.createdAt)}
        </div>
        <div className="body-muted">
          <span className="body-text font-medium">来源任务：</span>
          {lookup.sourceTask ? summarizeText(lookup.sourceTask.prompt, 48) : '未找到来源任务'}
        </div>
      </div>
    </div>
  )
}

const ShotVideoCard = ({
  lookup,
  onOpenDetail,
}: {
  lookup: VideoLookup
  onOpenDetail: (taskId: string) => void
}) => {
  if (!lookup.task || !lookup.previewUrl) {
    return (
      <div className="surface-muted p-4">
        <div className="body-text font-medium">视频预览</div>
        <p className="body-muted mt-3">当前镜头还没有可播放的视频预览。</p>
      </div>
    )
  }

  return (
    <div className="surface-muted p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="body-text font-medium">视频预览</div>
          <p className="body-text mt-1 font-semibold text-gray-900 dark:text-gray-100">{lookup.task.mode}</p>
        </div>
        <div className="flex items-center gap-2">
          {lookup.isSelected && <Badge variant="success">最终视频</Badge>}
          <Badge variant={lookup.task.status === 'done' ? 'success' : 'warning'}>
            {lookup.task.status}
          </Badge>
        </div>
      </div>
      <video src={lookup.previewUrl} controls preload="metadata" className="mt-4 h-56 w-full rounded-lg bg-black object-cover" />
      <div className="mt-4 space-y-2 body-text">
        <div className="body-muted">
          <span className="body-text font-medium">提示词：</span>
          {summarizeText(lookup.task.prompt, 120)}
        </div>
        <div className="body-muted">
          <span className="body-text font-medium">任务模型：</span>
          {lookup.task.reqKey}
        </div>
        <div className="body-muted">
          <span className="body-text font-medium">生成时间：</span>
          {formatDate(lookup.task.completedAt || lookup.task.updatedAt || lookup.task.createdAt)}
        </div>
        <div className="body-muted">
          <span className="body-text font-medium">Tokens：</span>
          {lookup.task.tokensUsed ?? '-'}
        </div>
      </div>
      <div className="mt-4">
        <Button variant="secondary" size="sm" className="gap-2" onClick={() => onOpenDetail(lookup.task!.id)}>
          <Video size={14} />
          查看视频详情
        </Button>
      </div>
    </div>
  )
}

type ProcessRecord = {
  id: string
  title: string
  category: string
  model: string
  time: string
  prompt: string
  extra?: string
}

export default function ShotDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const {
    shots,
    projects,
    brands,
    customers,
    keyFrames,
    assets,
    imageTasks,
    updateShot,
  } = useAppStore()
  const videoTasks = useGenerationStore((state) => state.tasks)

  const [editingShot, setEditingShot] = useState<Shot | null>(null)
  const [shotModalOpen, setShotModalOpen] = useState(false)
  const [activeCreationTab, setActiveCreationTab] = useState<'image' | 'video'>('image')
  const [shotForm, setShotForm] = useState({
    shotName: '',
    customerId: '',
    brandId: '',
    projectId: '',
  })

  const shot = shots.find((item) => item.id === id) || null
  const project = shot ? projects.find((item) => item.id === shot.projectId) || null : null
  const brand = project ? brands.find((item) => item.id === project.brandId) || null : null
  const customer = brand ? customers.find((item) => item.id === brand.customerId) || null : null
  const shotFrames = useMemo(() => keyFrames.filter((frame) => frame.parentShotId === shot?.id), [keyFrames, shot?.id])
  const shotAssets = useMemo(() => assets.filter((asset) => asset.shotId === shot?.id), [assets, shot?.id])
  const shotImageTasks = useMemo(() => imageTasks.filter((task) => task.shotId === shot?.id), [imageTasks, shot?.id])
  const shotVideoTasks = useMemo(() => videoTasks.filter((task) => task.shotId === shot?.id), [videoTasks, shot?.id])

  const keyFrameById = useMemo(() => new Map(keyFrames.map((frame) => [frame.id, frame])), [keyFrames])
  const filteredBrands = useMemo(
    () => brands.filter((item) => item.customerId === shotForm.customerId),
    [brands, shotForm.customerId],
  )
  const filteredProjects = useMemo(
    () => projects.filter((item) => item.brandId === shotForm.brandId),
    [projects, shotForm.brandId],
  )

  const latestVideoTask = useMemo(() => {
    return [...shotVideoTasks].sort((a, b) => {
      const aTime = new Date(a.completedAt || a.updatedAt || a.createdAt).getTime()
      const bTime = new Date(b.completedAt || b.updatedAt || b.createdAt).getTime()
      if (a.status === 'done' && b.status !== 'done') return -1
      if (a.status !== 'done' && b.status === 'done') return 1
      return bTime - aTime
    })[0] || null
  }, [shotVideoTasks])
  const selectedVideoTask = useMemo(() => {
    if (!shot?.finalVideoTaskId) return null
    return shotVideoTasks.find((task) => task.id === shot.finalVideoTaskId) || null
  }, [shot?.finalVideoTaskId, shotVideoTasks])

  const latestImageTask = useMemo(() => {
    return [...shotImageTasks].sort((a, b) => {
      const aTime = new Date(a.completedAt || a.updatedAt || a.createdAt).getTime()
      const bTime = new Date(b.completedAt || b.updatedAt || b.createdAt).getTime()
      return bTime - aTime
    })[0] || null
  }, [shotImageTasks])

  const getFrameLookup = (frameId: string | null): FrameLookup => {
    if (!frameId) return { frame: null, previewUrl: null, sourceTask: null }

    const frame = keyFrameById.get(frameId) || null
    const sourceTask = shotImageTasks.find((task) => task.keyFrameIds.includes(frameId)) || null
    const resultIndex = sourceTask ? sourceTask.keyFrameIds.indexOf(frameId) : -1
    const previewUrl = sourceTask && resultIndex >= 0 ? sourceTask.outputImageUrls[resultIndex] || null : null
    return { frame, previewUrl, sourceTask }
  }

  const getVideoLookup = (): VideoLookup => {
    const displayTask = selectedVideoTask || latestVideoTask
    return {
      task: displayTask,
      previewUrl: displayTask?.videoUrl || null,
      isSelected: Boolean(selectedVideoTask && displayTask?.id === selectedVideoTask.id),
    }
  }

  const processRecords = useMemo<ProcessRecord[]>(() => {
    if (!shot) return []

    const shotRecord: ProcessRecord = {
      id: `shot-${shot.id}`,
      title: shot.shotName,
      category: '镜头模型',
      model: `${shot.modelName || '-'} ${shot.modelVersion || ''}`.trim(),
      time: shot.updatedAt || shot.createdAt,
      prompt: shot.promptId ? `镜头提示词标识：${shot.promptId}` : '未绑定镜头提示词标识',
      extra: '镜头基础记录',
    }

    const frameRecords = shotFrames.map((frame) => ({
      id: `frame-${frame.id}`,
      title: frame.name,
      category: frame.type === 'Opening' ? '首图记录' : '尾图记录',
      model: `${frame.modelName} ${frame.modelVersion}`.trim(),
      time: frame.updatedAt || frame.createdAt,
      prompt: frame.promptText,
      extra: frame.status,
    }))

    const imageRecords = shotImageTasks.map((task) => ({
      id: `image-task-${task.id}`,
      title: task.prompt || '图片生成任务',
      category: '图片任务',
      model: task.reqKey,
      time: task.completedAt || task.updatedAt || task.createdAt,
      prompt: task.prompt,
      extra: `结果 ${task.outputImageUrls.length} 张${task.frameType ? ` / ${task.frameType === 'Opening' ? '首图' : '尾图'}` : ''}`,
    }))

    const videoRecords = shotVideoTasks.map((task) => ({
      id: `video-task-${task.id}`,
      title: task.prompt || '视频生成任务',
      category: '视频任务',
      model: task.reqKey,
      time: task.completedAt || task.updatedAt || task.createdAt,
      prompt: task.prompt,
      extra: `${task.mode} / ${task.status}`,
    }))

    return [shotRecord, ...frameRecords, ...imageRecords, ...videoRecords].sort(
      (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
    )
  }, [shot, shotFrames, shotImageTasks, shotVideoTasks])

  const openShotModal = (currentShot: Shot) => {
    const currentProject = projects.find((item) => item.id === currentShot.projectId) || null
    const currentBrand = currentProject ? brands.find((item) => item.id === currentProject.brandId) || null : null
    const currentCustomer = currentBrand ? customers.find((item) => item.id === currentBrand.customerId) || null : null
    setEditingShot(currentShot)
    setShotForm({
      shotName: currentShot.shotName,
      customerId: currentCustomer?.id || '',
      brandId: currentBrand?.id || '',
      projectId: currentProject?.id || '',
    })
    setShotModalOpen(true)
  }

  const saveShot = () => {
    if (!editingShot || !shotForm.shotName.trim()) {
      showToast('error', '请输入镜头名称')
      return
    }
    if (!shotForm.customerId) {
      showToast('error', '请选择所属客户')
      return
    }
    if (!shotForm.brandId) {
      showToast('error', '请选择所属品牌')
      return
    }
    if (!shotForm.projectId) {
      showToast('error', '请选择所属项目')
      return
    }

    updateShot(editingShot.id, {
      shotName: shotForm.shotName.trim(),
      projectId: shotForm.projectId,
    })
    setShotModalOpen(false)
  }

  if (!shot || !project) {
    return (
      <div className="space-y-6">
        <Button variant="secondary" className="gap-2" onClick={() => navigate('/content/shots')}>
          <ArrowLeft size={16} />
          返回镜头列表
        </Button>
        <div className="card p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">镜头不存在</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">当前链接没有找到可用的镜头记录。</p>
        </div>
      </div>
    )
  }

  const opening = getFrameLookup(shot.firstFrameId)
  const ending = getFrameLookup(shot.lastFrameId)
  const videoLookup = getVideoLookup()
  const hasFrames = Boolean(shot.firstFrameId || shot.lastFrameId)
  const statusCards = [
    { label: '首尾帧绑定', value: hasFrames ? `${[shot.firstFrameId && '首图', shot.lastFrameId && '尾图'].filter(Boolean).join(' / ')}` : '未绑定', hint: `共 ${shotFrames.length} 条关键帧记录` },
    {
      label: '视频结果',
      value: selectedVideoTask ? '已选定' : latestVideoTask ? latestVideoTask.status : '暂无',
      hint: selectedVideoTask
        ? `最终视频：${formatDate(selectedVideoTask.completedAt || selectedVideoTask.updatedAt || selectedVideoTask.createdAt)}`
        : latestVideoTask
          ? `候选结果：${formatDate(latestVideoTask.completedAt || latestVideoTask.updatedAt || latestVideoTask.createdAt)}`
          : '尚未生成视频',
    },
    { label: '图片结果', value: latestImageTask ? `${latestImageTask.outputImageUrls.length} 张` : '暂无', hint: latestImageTask ? formatDate(latestImageTask.completedAt || latestImageTask.updatedAt || latestImageTask.createdAt) : '尚未生成图片' },
    { label: '关联资产', value: `${shotAssets.length}`, hint: shotAssets.length > 0 ? `${shotAssets.filter((asset) => asset.type === 'Video').length} 个视频 / ${shotAssets.filter((asset) => asset.type === 'Image').length} 张图片` : '还未沉淀为资产' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Button variant="secondary" className="gap-2" onClick={() => navigate('/content/shots')}>
            <ArrowLeft size={16} />
            返回镜头列表
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{shot.shotName}</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">镜头详情工作台，集中管理首尾帧、创作任务、结果追溯与资产沉淀。</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" className="gap-2" onClick={() => navigate(`/projects/projects/${project.id}`)}>
            <FolderKanban size={14} />
            查看项目
          </Button>
          <Button className="gap-2" onClick={() => openShotModal(shot)}>
            <Edit2 size={14} />
            编辑镜头
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        <div className="card space-y-4 lg:col-span-2">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            <Clapperboard size={16} />
            镜头概览
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">所属项目</div>
              <div className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">{project.projectName}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">所属品牌</div>
              <div className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">{brand?.brandName || '-'}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">所属客户</div>
              <div className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">{customer?.customerName || '-'}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">镜头提示词标识</div>
              <div className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">{shot.promptId || '未填写'}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">基础模型</div>
              <div className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">{shot.modelName || '未记录'} {shot.modelVersion || ''}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">创建时间</div>
              <div className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">{formatDate(shot.createdAt)}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">更新时间</div>
              <div className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">{formatDate(shot.updatedAt)}</div>
            </div>
          </div>
        </div>

        {statusCards.map((card) => (
          <div key={card.label} className="card space-y-3">
            <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{card.label}</div>
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{card.value}</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">{card.hint}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <ShotVideoCard lookup={videoLookup} onOpenDetail={(taskId) => navigate(`/content/video-detail/${taskId}`)} />
        <FrameTraceCard label="首图" lookup={opening} onOpenDetail={(taskId, resultIndex) => navigate(`/content/image-detail/${taskId}/${resultIndex}`)} />
        <FrameTraceCard label="尾图" lookup={ending} onOpenDetail={(taskId, resultIndex) => navigate(`/content/image-detail/${taskId}/${resultIndex}`)} />
      </div>

      <section className="card space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">创作工作区</h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">当前页面已锁定在此镜头上下文，直接承接图片与视频创作能力。</p>
          </div>
          <div className="flex rounded-xl border border-gray-200 p-1 dark:border-gray-700">
            <button
              type="button"
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${activeCreationTab === 'image' ? 'bg-accent-500 text-white' : 'text-gray-600 dark:text-gray-400'}`}
              onClick={() => setActiveCreationTab('image')}
            >
              图片创作
            </button>
            <button
              type="button"
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${activeCreationTab === 'video' ? 'bg-accent-500 text-white' : 'text-gray-600 dark:text-gray-400'}`}
              onClick={() => setActiveCreationTab('video')}
            >
              视频创作
            </button>
          </div>
        </div>

        {activeCreationTab === 'image' ? (
          <ImageCreationWorkspace
            contextMode="shot-detail"
            defaultProjectId={project.id}
            defaultShotId={shot.id}
            hideContextSelector
            filterTasksByShot
          />
        ) : (
          <VideoCreationWorkspace
            contextMode="shot-detail"
            defaultProjectId={project.id}
            defaultShotId={shot.id}
            hideContextSelector
            filterTasksByShot
          />
        )}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <div className="card space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">关联资产</h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">沉淀当前镜头已经产出的图片、视频和脚本资产。</p>
          </div>

          {shotAssets.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 py-12 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
              当前镜头还没有关联资产。
            </div>
          ) : (
            <div className="space-y-3">
              {shotAssets.map((asset) => (
                <div key={asset.id} className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-primary-900/40">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={asset.type === 'Image' ? 'info' : asset.type === 'Video' ? 'success' : 'warning'}>
                          {asset.type === 'Image' ? '图片' : asset.type === 'Video' ? '视频' : '脚本'}
                        </Badge>
                        <span className="text-sm text-gray-500 dark:text-gray-400">{asset.sourceType}</span>
                      </div>
                      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">{asset.assetName}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{asset.modelName} {asset.modelVersion}</p>
                    </div>
                    {asset.sourceTaskId && asset.type === 'Image' && asset.sourceResultIndex != null ? (
                      <Button variant="secondary" size="sm" className="gap-2" onClick={() => navigate(`/content/image-detail/${asset.sourceTaskId}/${asset.sourceResultIndex}`)}>
                        <ImageIcon size={14} />
                        查看结果
                      </Button>
                    ) : asset.sourceTaskId && asset.type === 'Video' ? (
                      <Button variant="secondary" size="sm" className="gap-2" onClick={() => navigate(`/content/video-detail/${asset.sourceTaskId}`)}>
                        <Video size={14} />
                        查看结果
                      </Button>
                    ) : null}
                  </div>
                  <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                    文件：<span className="break-all">{asset.fileUrl || '未记录'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">过程记录 / 模型记录</h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">汇总当前镜头使用过的模型、关键帧记录以及图片/视频生成任务。</p>
          </div>

          {processRecords.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 py-12 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
              当前镜头还没有可追溯的模型或生成过程记录。
            </div>
          ) : (
            <div className="space-y-3">
              {processRecords.map((record) => (
                <div key={record.id} className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-primary-900/40">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{record.category}</Badge>
                      </div>
                      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">{summarizeText(record.title, 80)}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{summarizeText(record.prompt, 180)}</p>
                    </div>
                    <div className="min-w-[220px] space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <Sparkles size={14} />
                        <span>{record.model || '-'}</span>
                      </div>
                      <div>时间：{formatDate(record.time)}</div>
                      {record.extra && <div>备注：{record.extra}</div>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Modal title="编辑镜头" isOpen={shotModalOpen} onClose={() => setShotModalOpen(false)} onSave={saveShot}>
        <div className="space-y-5">
          <div className="space-y-2">
            <Label>镜头名称 *</Label>
            <Input value={shotForm.shotName} onChange={(event) => setShotForm({ ...shotForm, shotName: event.target.value })} placeholder="输入镜头名称" />
          </div>
          <div className="space-y-2">
            <Label>所属客户 *</Label>
            <Select
              value={shotForm.customerId || 'none'}
              onValueChange={(value) => setShotForm({
                ...shotForm,
                customerId: value === 'none' ? '' : value,
                brandId: '',
                projectId: '',
              })}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择客户" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">选择客户</SelectItem>
                {customers.map((item) => (
                  <SelectItem key={item.id} value={item.id}>{item.customerName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>所属品牌 *</Label>
            <Select
              value={shotForm.brandId || 'none'}
              onValueChange={(value) => setShotForm({
                ...shotForm,
                brandId: value === 'none' ? '' : value,
                projectId: '',
              })}
              disabled={!shotForm.customerId}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择品牌" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">选择品牌</SelectItem>
                {filteredBrands.map((item) => (
                  <SelectItem key={item.id} value={item.id}>{item.brandName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>所属项目 *</Label>
            <Select
              value={shotForm.projectId || 'none'}
              onValueChange={(value) => setShotForm({ ...shotForm, projectId: value === 'none' ? '' : value })}
              disabled={!shotForm.brandId}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择项目" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">选择项目</SelectItem>
                {filteredProjects.map((item) => (
                  <SelectItem key={item.id} value={item.id}>{item.projectName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Modal>
    </div>
  )
}
