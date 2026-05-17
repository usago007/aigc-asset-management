import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Edit2, Film, FolderKanban, Plus, Sparkles, Trash2 } from 'lucide-react'
import { useAppStore } from '@/store/appStore'
import { useGenerationStore } from '@/store/generationStore'
import { formatDate } from '@/utils/date'
import { showToast } from '@/utils/toast'
import Modal from '@/components/Modal'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import type {
  Brief,
  GenerationVersion,
  KeyFrame,
  Project,
  ProjectStage,
  RiskLevel,
  Shot,
} from '@/types'
import type { ImageGenerationTask, VideoGenerationTask } from '@/types/generation'

const stageMap: Record<ProjectStage, { label: string; variant: 'info' | 'warning' | 'success' }> = {
  Planning: { label: '规划中', variant: 'info' },
  InProduction: { label: '制作中', variant: 'warning' },
  Review: { label: '审核中', variant: 'warning' },
  Completed: { label: '已完成', variant: 'success' },
}

const riskMap: Record<RiskLevel, { label: string; variant: 'success' | 'warning' | 'destructive' }> = {
  Low: { label: '低', variant: 'success' },
  Medium: { label: '中', variant: 'warning' },
  High: { label: '高', variant: 'destructive' },
}

type ProcessRecord = {
  id: string
  title: string
  category: string
  model: string
  time: string
  prompt: string
  shotName?: string
  extra?: string
}

type FrameLookup = {
  frame: KeyFrame | null
  previewUrl: string | null
  sourceTask: ImageGenerationTask | null
}

const summarizeText = (value: string, max = 96) => {
  if (!value) return '-'
  return value.length > max ? `${value.slice(0, max)}...` : value
}

const FrameTraceCard = ({ label, lookup }: { label: string; lookup: FrameLookup }) => {
  if (!lookup.frame) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 dark:border-gray-700 p-4 bg-gray-50/70 dark:bg-gray-900/40">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</div>
        <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">未绑定{label}记录</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-gray-50/70 dark:bg-gray-900/40">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</div>
          <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">{lookup.frame.name}</p>
        </div>
        <Badge variant="outline">{lookup.frame.type === 'Opening' ? '首图' : '尾图'}</Badge>
      </div>
      {lookup.previewUrl ? (
        <img
          src={lookup.previewUrl}
          alt={lookup.frame.name}
          className="mt-4 h-40 w-full rounded-lg object-cover bg-gray-100 dark:bg-gray-800"
        />
      ) : (
        <div className="mt-4 flex h-40 items-center justify-center rounded-lg border border-dashed border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 text-sm text-gray-500 dark:text-gray-400">
          暂无可追溯图片
        </div>
      )}
      <div className="mt-4 space-y-2 text-sm">
        <div className="text-gray-600 dark:text-gray-400">
          <span className="font-medium text-gray-700 dark:text-gray-300">提示词：</span>
          {summarizeText(lookup.frame.promptText, 120)}
        </div>
        <div className="text-gray-600 dark:text-gray-400">
          <span className="font-medium text-gray-700 dark:text-gray-300">模型：</span>
          {lookup.frame.modelName} {lookup.frame.modelVersion}
        </div>
        <div className="text-gray-600 dark:text-gray-400">
          <span className="font-medium text-gray-700 dark:text-gray-300">生成时间：</span>
          {formatDate(lookup.frame.createdAt)}
        </div>
        <div className="text-gray-600 dark:text-gray-400">
          <span className="font-medium text-gray-700 dark:text-gray-300">来源任务：</span>
          {lookup.sourceTask ? summarizeText(lookup.sourceTask.prompt, 48) : '未找到来源任务'}
        </div>
      </div>
    </div>
  )
}

export default function ProjectDetail() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const {
    projects,
    brands,
    shots,
    keyFrames,
    briefs,
    generationVersions,
    imageTasks,
    addShot,
    updateShot,
    deleteShot,
    addBrief,
    updateBrief,
    deleteBrief,
  } = useAppStore()
  const videoTasks = useGenerationStore((state) => state.tasks)

  const [shotModalOpen, setShotModalOpen] = useState(false)
  const [editingShot, setEditingShot] = useState<Shot | null>(null)
  const [briefModalOpen, setBriefModalOpen] = useState(false)
  const [editingBrief, setEditingBrief] = useState<Brief | null>(null)

  const [shotForm, setShotForm] = useState({
    shotName: '',
    firstFrameId: '',
    lastFrameId: '',
    promptId: '',
    modelName: '',
    modelVersion: '',
  })

  const [briefForm, setBriefForm] = useState({
    briefTitle: '',
    description: '',
    targetAudience: '',
    platform: '',
    deadline: '',
    fileUrl: '',
    currentVersionId: '',
  })

  const project = projects.find((item) => item.id === id) || null
  const brandName = project ? brands.find((brand) => brand.id === project.brandId)?.brandName || '-' : '-'

  const projectShots = useMemo(
    () => shots.filter((shot) => shot.projectId === id),
    [shots, id]
  )
  const projectShotIds = useMemo(() => new Set(projectShots.map((shot) => shot.id)), [projectShots])
  const projectKeyFrames = useMemo(
    () => keyFrames.filter((frame) => projectShotIds.has(frame.parentShotId)),
    [keyFrames, projectShotIds]
  )
  const projectKeyFrameIds = useMemo(() => new Set(projectKeyFrames.map((frame) => frame.id)), [projectKeyFrames])
  const projectBriefs = useMemo(
    () => briefs.filter((brief) => brief.projectId === id),
    [briefs, id]
  )
  const relatedImageTasks = useMemo(
    () =>
      imageTasks.filter(
        (task) =>
          task.projectId === id ||
          (task.shotId ? projectShotIds.has(task.shotId) : false)
      ),
    [imageTasks, id, projectShotIds]
  )
  const relatedVideoTasks = useMemo(
    () =>
      videoTasks.filter(
        (task) =>
          task.projectId === id ||
          (task.shotId ? projectShotIds.has(task.shotId) : false)
      ),
    [videoTasks, id, projectShotIds]
  )
  const relatedGenerationVersions = useMemo(
    () => generationVersions.filter((version) => projectKeyFrameIds.has(version.keyFrameId)),
    [generationVersions, projectKeyFrameIds]
  )

  const openingFrameOptions = useMemo(
    () => projectKeyFrames.filter((frame) => frame.type === 'Opening'),
    [projectKeyFrames]
  )
  const endingFrameOptions = useMemo(
    () => projectKeyFrames.filter((frame) => frame.type === 'Ending'),
    [projectKeyFrames]
  )

  const shotById = useMemo(() => new Map(projectShots.map((shot) => [shot.id, shot])), [projectShots])
  const keyFrameById = useMemo(() => new Map(keyFrames.map((frame) => [frame.id, frame])), [keyFrames])

  const getFrameLookup = (frameId: string | null): FrameLookup => {
    if (!frameId) {
      return { frame: null, previewUrl: null, sourceTask: null }
    }

    const frame = keyFrameById.get(frameId) || null
    const sourceTask = relatedImageTasks.find((task) => task.keyFrameIds.includes(frameId)) || null
    const resultIndex = sourceTask ? sourceTask.keyFrameIds.indexOf(frameId) : -1
    const previewUrl = sourceTask && resultIndex >= 0 ? sourceTask.outputImageUrls[resultIndex] || null : null

    return { frame, previewUrl, sourceTask }
  }

  const processRecords = useMemo<ProcessRecord[]>(() => {
    const shotRecords: ProcessRecord[] = projectShots.map((shot) => ({
      id: `shot-${shot.id}`,
      title: shot.shotName,
      category: '镜头模型',
      model: `${shot.modelName || '-'} ${shot.modelVersion || ''}`.trim(),
      time: shot.updatedAt || shot.createdAt,
      prompt: shot.promptId ? `镜头提示词标识：${shot.promptId}` : '未绑定镜头提示词标识',
      shotName: shot.shotName,
      extra: `项目镜头记录`,
    }))

    const frameRecords: ProcessRecord[] = projectKeyFrames.map((frame) => {
      const shot = shotById.get(frame.parentShotId)
      return {
        id: `frame-${frame.id}`,
        title: frame.name,
        category: frame.type === 'Opening' ? '首图记录' : '尾图记录',
        model: `${frame.modelName} ${frame.modelVersion}`.trim(),
        time: frame.updatedAt || frame.createdAt,
        prompt: frame.promptText,
        shotName: shot?.shotName,
        extra: frame.status,
      }
    })

    const versionRecords: ProcessRecord[] = relatedGenerationVersions.map((version: GenerationVersion) => {
      const frame = keyFrameById.get(version.keyFrameId)
      const shot = frame ? shotById.get(frame.parentShotId) : null
      return {
        id: `version-${version.id}`,
        title: `${frame?.name || '关键帧'} v${version.versionNumber}`,
        category: '版本记录',
        model: `${version.modelName} ${version.modelVersion}`.trim(),
        time: version.generatedAt || version.createdAt,
        prompt: frame?.promptText || '未找到对应提示词',
        shotName: shot?.shotName,
        extra: version.isSelected ? '当前选中版本' : version.status,
      }
    })

    const imageTaskRecords: ProcessRecord[] = relatedImageTasks.map((task: ImageGenerationTask) => {
      const shot = task.shotId ? shotById.get(task.shotId) : null
      return {
        id: `image-task-${task.id}`,
        title: task.prompt || '图片生成任务',
        category: '图片任务',
        model: task.reqKey,
        time: task.completedAt || task.updatedAt || task.createdAt,
        prompt: task.prompt,
        shotName: shot?.shotName,
        extra: `结果 ${task.outputImageUrls.length} 张${task.frameType ? ` / ${task.frameType === 'Opening' ? '首图' : '尾图'}` : ''}`,
      }
    })

    const videoTaskRecords: ProcessRecord[] = relatedVideoTasks.map((task: VideoGenerationTask) => {
      const shot = task.shotId ? shotById.get(task.shotId) : null
      return {
        id: `video-task-${task.id}`,
        title: task.prompt || '视频生成任务',
        category: '视频任务',
        model: task.reqKey,
        time: task.completedAt || task.updatedAt || task.createdAt,
        prompt: task.prompt,
        shotName: shot?.shotName,
        extra: `${task.mode} / ${task.status}`,
      }
    })

    return [...shotRecords, ...frameRecords, ...versionRecords, ...imageTaskRecords, ...videoTaskRecords].sort(
      (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
    )
  }, [projectShots, projectKeyFrames, relatedGenerationVersions, relatedImageTasks, relatedVideoTasks, keyFrameById, shotById])

  const openShotModal = (shot?: Shot) => {
    if (shot) {
      setEditingShot(shot)
      setShotForm({
        shotName: shot.shotName,
        firstFrameId: shot.firstFrameId || '',
        lastFrameId: shot.lastFrameId || '',
        promptId: shot.promptId || '',
        modelName: shot.modelName || '',
        modelVersion: shot.modelVersion || '',
      })
    } else {
      setEditingShot(null)
      setShotForm({
        shotName: '',
        firstFrameId: '',
        lastFrameId: '',
        promptId: '',
        modelName: '',
        modelVersion: '',
      })
    }
    setShotModalOpen(true)
  }

  const saveShot = () => {
    if (!project) return
    if (!shotForm.shotName.trim()) {
      showToast('error', '请输入镜头名称')
      return
    }

    const payload = {
      shotName: shotForm.shotName.trim(),
      projectId: project.id,
      firstFrameId: shotForm.firstFrameId || null,
      lastFrameId: shotForm.lastFrameId || null,
      promptId: shotForm.promptId.trim(),
      modelName: shotForm.modelName.trim(),
      modelVersion: shotForm.modelVersion.trim(),
    }

    if (editingShot) {
      updateShot(editingShot.id, payload)
    } else {
      addShot(payload)
    }
    setShotModalOpen(false)
  }

  const removeShot = (shotId: string) => {
    if (!window.confirm('确定要删除这个镜头吗？')) return
    deleteShot(shotId)
  }

  const openBriefModal = (brief?: Brief) => {
    if (brief) {
      setEditingBrief(brief)
      setBriefForm({
        briefTitle: brief.briefTitle,
        description: brief.description,
        targetAudience: brief.targetAudience,
        platform: brief.platform,
        deadline: brief.deadline ? brief.deadline.split('T')[0] : '',
        fileUrl: brief.fileUrl || '',
        currentVersionId: brief.currentVersionId || '',
      })
    } else {
      setEditingBrief(null)
      setBriefForm({
        briefTitle: '',
        description: '',
        targetAudience: '',
        platform: '',
        deadline: '',
        fileUrl: '',
        currentVersionId: '',
      })
    }
    setBriefModalOpen(true)
  }

  const saveBrief = () => {
    if (!project) return
    if (!briefForm.briefTitle.trim()) {
      showToast('error', '请输入提案标题')
      return
    }

    const payload = {
      briefTitle: briefForm.briefTitle.trim(),
      projectId: project.id,
      description: briefForm.description.trim(),
      targetAudience: briefForm.targetAudience.trim(),
      platform: briefForm.platform.trim(),
      deadline: briefForm.deadline ? new Date(briefForm.deadline).toISOString() : '',
      fileUrl: briefForm.fileUrl.trim(),
      currentVersionId: briefForm.currentVersionId.trim() || null,
    }

    if (editingBrief) {
      updateBrief(editingBrief.id, payload)
    } else {
      addBrief(payload)
    }
    setBriefModalOpen(false)
  }

  const removeBrief = (briefId: string) => {
    if (!window.confirm('确定要删除这个提案吗？')) return
    deleteBrief(briefId)
  }

  if (!project) {
    return (
      <div className="space-y-6">
        <Button variant="secondary" className="gap-2" onClick={() => navigate('/projects/projects')}>
          <ArrowLeft size={16} />
          返回项目列表
        </Button>
        <div className="card p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">项目不存在</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">当前链接没有找到可用的项目记录。</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Button variant="secondary" className="gap-2" onClick={() => navigate('/projects/projects')}>
            <ArrowLeft size={16} />
            返回项目列表
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{project.projectName}</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">项目详情工作台，集中管理镜头、提案与生成追溯。</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        <div className="card lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            <FolderKanban size={16} />
            项目基础信息
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">品牌</div>
              <div className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">{brandName}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">负责人</div>
              <div className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">{project.projectOwner || '-'}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">阶段</div>
              <div className="mt-2">
                <Badge variant={stageMap[project.stage].variant}>{stageMap[project.stage].label}</Badge>
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">风险</div>
              <div className="mt-2">
                <Badge variant={riskMap[project.riskLevel].variant}>{riskMap[project.riskLevel].label}</Badge>
              </div>
            </div>
            <div className="md:col-span-2">
              <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">项目进度</div>
              <div className="mt-2 flex items-center gap-3">
                <Progress value={project.progress} className="w-full max-w-xs" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{project.progress}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card space-y-3">
          <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">镜头数量</div>
          <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{projectShots.length}</div>
          <p className="text-sm text-gray-600 dark:text-gray-400">已关联首尾帧 {projectShots.filter((shot) => shot.firstFrameId || shot.lastFrameId).length} 个镜头</p>
        </div>

        <div className="card space-y-3">
          <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">提案与待审</div>
          <div className="flex items-end gap-4">
            <div>
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{projectBriefs.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">项目提案</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{project.pendingReviews}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">待审核</div>
            </div>
          </div>
        </div>
      </div>

      <section className="card space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">镜头</h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">管理当前项目镜头，并查看首图、尾图、提示词和模型追溯。</p>
          </div>
          <Button className="gap-2" onClick={() => openShotModal()}>
            <Plus size={16} />
            新建镜头
          </Button>
        </div>

        {projectShots.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 dark:border-gray-700 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
            当前项目还没有镜头，先创建镜头再绑定首图和尾图。
          </div>
        ) : (
          <div className="space-y-4">
            {projectShots.map((shot) => {
              const opening = getFrameLookup(shot.firstFrameId)
              const ending = getFrameLookup(shot.lastFrameId)

              return (
                <div key={shot.id} className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-primary-900/40 p-5 space-y-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Film size={16} className="text-primary-500" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{shot.shotName}</h3>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        <div className="rounded-xl bg-gray-50 dark:bg-gray-900/50 p-3">
                          <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">镜头提示词标识</div>
                          <div className="mt-2 text-sm text-gray-900 dark:text-gray-100">{shot.promptId || '未填写'}</div>
                        </div>
                        <div className="rounded-xl bg-gray-50 dark:bg-gray-900/50 p-3">
                          <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">基础模型</div>
                          <div className="mt-2 text-sm text-gray-900 dark:text-gray-100">
                            {shot.modelName || '未记录'} {shot.modelVersion || ''}
                          </div>
                        </div>
                        <div className="rounded-xl bg-gray-50 dark:bg-gray-900/50 p-3">
                          <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">首图记录</div>
                          <div className="mt-2 text-sm text-gray-900 dark:text-gray-100">{opening.frame?.name || '未绑定'}</div>
                        </div>
                        <div className="rounded-xl bg-gray-50 dark:bg-gray-900/50 p-3">
                          <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">尾图记录</div>
                          <div className="mt-2 text-sm text-gray-900 dark:text-gray-100">{ending.frame?.name || '未绑定'}</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="secondary" size="sm" className="gap-2" onClick={() => openShotModal(shot)}>
                        <Edit2 size={14} />
                        编辑
                      </Button>
                      <Button variant="ghost" size="sm" className="gap-2 text-error hover:text-error" onClick={() => removeShot(shot.id)}>
                        <Trash2 size={14} />
                        删除
                      </Button>
                    </div>
                  </div>

                  <div className="grid gap-4 xl:grid-cols-2">
                    <FrameTraceCard label="首图" lookup={opening} />
                    <FrameTraceCard label="尾图" lookup={ending} />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      <section className="card space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">提案</h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">复用项目简报数据，直接维护当前项目提案。</p>
          </div>
          <Button className="gap-2" onClick={() => openBriefModal()}>
            <Plus size={16} />
            新建提案
          </Button>
        </div>

        {projectBriefs.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 dark:border-gray-700 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
            当前项目还没有提案，先补充提案内容和交付要求。
          </div>
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {projectBriefs.map((brief) => (
              <div key={brief.id} className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-primary-900/40 p-5 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{brief.briefTitle}</h3>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{summarizeText(brief.description, 120)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="secondary" size="sm" className="gap-2" onClick={() => openBriefModal(brief)}>
                      <Edit2 size={14} />
                      编辑
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-2 text-error hover:text-error" onClick={() => removeBrief(brief.id)}>
                      <Trash2 size={14} />
                      删除
                    </Button>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl bg-gray-50 dark:bg-gray-900/50 p-3">
                    <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">目标受众</div>
                    <div className="mt-2 text-sm text-gray-900 dark:text-gray-100">{brief.targetAudience || '未填写'}</div>
                  </div>
                  <div className="rounded-xl bg-gray-50 dark:bg-gray-900/50 p-3">
                    <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">交付平台</div>
                    <div className="mt-2 text-sm text-gray-900 dark:text-gray-100">{brief.platform || '未填写'}</div>
                  </div>
                  <div className="rounded-xl bg-gray-50 dark:bg-gray-900/50 p-3">
                    <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">截止日期</div>
                    <div className="mt-2 text-sm text-gray-900 dark:text-gray-100">{brief.deadline ? formatDate(brief.deadline, 'date') : '未设置'}</div>
                  </div>
                  <div className="rounded-xl bg-gray-50 dark:bg-gray-900/50 p-3">
                    <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">版本绑定</div>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant={brief.currentVersionId ? 'success' : 'outline'}>
                        {brief.currentVersionId ? '当前版本已绑定' : '当前版本未绑定'}
                      </Badge>
                    </div>
                  </div>
                </div>

                {brief.fileUrl && (
                  <div className="rounded-xl bg-gray-50 dark:bg-gray-900/50 p-3 text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-medium text-gray-800 dark:text-gray-200">文件链接：</span>
                    <a href={brief.fileUrl} target="_blank" rel="noreferrer" className="text-primary-500 hover:underline break-all">
                      {brief.fileUrl}
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="card space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">过程记录 / 模型记录</h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">汇总当前项目使用过的镜头模型、关键帧模型、版本记录以及图片/视频生成任务。</p>
        </div>

        {processRecords.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 dark:border-gray-700 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
            当前项目还没有可追溯的模型或生成过程记录。
          </div>
        ) : (
          <div className="space-y-3">
            {processRecords.map((record) => (
              <div key={record.id} className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-primary-900/40 p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{record.category}</Badge>
                      {record.shotName && <span className="text-sm text-gray-500 dark:text-gray-400">镜头：{record.shotName}</span>}
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
      </section>

      <Modal title={editingShot ? '编辑镜头' : '新建镜头'} isOpen={shotModalOpen} onClose={() => setShotModalOpen(false)} onSave={saveShot}>
        <div className="space-y-5">
          <div className="space-y-2">
            <Label>镜头名称 *</Label>
            <Input value={shotForm.shotName} onChange={(event) => setShotForm({ ...shotForm, shotName: event.target.value })} placeholder="输入镜头名称" />
          </div>
          <div className="space-y-2">
            <Label>镜头提示词标识</Label>
            <Input value={shotForm.promptId} onChange={(event) => setShotForm({ ...shotForm, promptId: event.target.value })} placeholder="输入 promptId 或内部标识" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>首图</Label>
              <Select value={shotForm.firstFrameId || 'none'} onValueChange={(value) => setShotForm({ ...shotForm, firstFrameId: value === 'none' ? '' : value })}>
                <SelectTrigger>
                  <SelectValue placeholder="选择首图" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">未绑定首图</SelectItem>
                  {openingFrameOptions.map((frame) => (
                    <SelectItem key={frame.id} value={frame.id}>{frame.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>尾图</Label>
              <Select value={shotForm.lastFrameId || 'none'} onValueChange={(value) => setShotForm({ ...shotForm, lastFrameId: value === 'none' ? '' : value })}>
                <SelectTrigger>
                  <SelectValue placeholder="选择尾图" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">未绑定尾图</SelectItem>
                  {endingFrameOptions.map((frame) => (
                    <SelectItem key={frame.id} value={frame.id}>{frame.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>基础模型</Label>
              <Input value={shotForm.modelName} onChange={(event) => setShotForm({ ...shotForm, modelName: event.target.value })} placeholder="如：Midjourney" />
            </div>
            <div className="space-y-2">
              <Label>模型版本</Label>
              <Input value={shotForm.modelVersion} onChange={(event) => setShotForm({ ...shotForm, modelVersion: event.target.value })} placeholder="如：v6.0" />
            </div>
          </div>
        </div>
      </Modal>

      <Modal title={editingBrief ? '编辑提案' : '新建提案'} isOpen={briefModalOpen} onClose={() => setBriefModalOpen(false)} onSave={saveBrief} width="max-w-2xl">
        <div className="space-y-5">
          <div className="space-y-2">
            <Label>提案标题 *</Label>
            <Input value={briefForm.briefTitle} onChange={(event) => setBriefForm({ ...briefForm, briefTitle: event.target.value })} placeholder="输入提案标题" />
          </div>
          <div className="space-y-2">
            <Label>内容描述</Label>
            <textarea
              className="input-field min-h-[96px]"
              value={briefForm.description}
              onChange={(event) => setBriefForm({ ...briefForm, description: event.target.value })}
              placeholder="输入提案内容描述"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>目标受众</Label>
              <Input value={briefForm.targetAudience} onChange={(event) => setBriefForm({ ...briefForm, targetAudience: event.target.value })} placeholder="如：18-35 岁女性" />
            </div>
            <div className="space-y-2">
              <Label>交付平台</Label>
              <Input value={briefForm.platform} onChange={(event) => setBriefForm({ ...briefForm, platform: event.target.value })} placeholder="如：抖音 / 小红书" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>截止日期</Label>
              <Input type="date" value={briefForm.deadline} onChange={(event) => setBriefForm({ ...briefForm, deadline: event.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>当前版本 ID</Label>
              <Input value={briefForm.currentVersionId} onChange={(event) => setBriefForm({ ...briefForm, currentVersionId: event.target.value })} placeholder="未绑定可留空" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>文件链接</Label>
            <Input value={briefForm.fileUrl} onChange={(event) => setBriefForm({ ...briefForm, fileUrl: event.target.value })} placeholder="输入提案文件链接" />
          </div>
        </div>
      </Modal>
    </div>
  )
}
