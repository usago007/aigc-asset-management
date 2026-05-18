import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowDown, ArrowLeft, ArrowUp, Film, FolderKanban, Link2, Plus, Sparkles, Trash2 } from 'lucide-react'
import { useAppStore } from '@/store/appStore'
import { useGenerationStore } from '@/store/generationStore'
import { formatDate } from '@/utils/date'
import { normalizeSearchText } from '@/utils/search'
import { showToast } from '@/utils/toast'
import Modal from '@/components/Modal'
import { PageIntro, PageSection, PageShell } from '@/components/PageShell'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import type {
  Brief,
  GenerationVersion,
  KeyFrame,
  ProjectStage,
  ProjectShotSlot,
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

type VideoLookup = {
  task: VideoGenerationTask | null
  previewUrl: string | null
}

type SlotItem = {
  slot: ProjectShotSlot
  shot: Shot | null
}

const summarizeText = (value: string, max = 96) => {
  if (!value) return '-'
  return value.length > max ? `${value.slice(0, max)}...` : value
}

const includesText = (value: unknown, query: string) => {
  const normalizedQuery = normalizeSearchText(query)
  if (!normalizedQuery) return true
  return normalizeSearchText(value).includes(normalizedQuery)
}

const FrameTraceCard = ({ label, lookup }: { label: string; lookup: FrameLookup }) => {
  if (!lookup.frame) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/70 p-4 dark:border-gray-700 dark:bg-gray-900/40">
        <div className="panel-title">{label}</div>
        <p className="body-muted mt-3">未绑定{label}记录</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-4 dark:border-gray-700 dark:bg-gray-900/40">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="panel-title">{label}</div>
          <p className="panel-value mt-1 font-semibold">{lookup.frame.name}</p>
        </div>
        <Badge variant="outline">{lookup.frame.type === 'Opening' ? '首图' : '尾图'}</Badge>
      </div>
      {lookup.previewUrl ? (
        <img
          src={lookup.previewUrl}
          alt={lookup.frame.name}
          className="mt-4 h-40 w-full rounded-lg bg-gray-100 object-cover dark:bg-gray-800"
        />
      ) : (
        <div className="body-muted mt-4 flex h-40 items-center justify-center rounded-lg border border-dashed border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900/50">
          暂无可追溯图片
        </div>
      )}
      <div className="helper-text mt-4 space-y-2">
        <div>
          <span className="field-label">提示词：</span>
          {summarizeText(lookup.frame.promptText, 120)}
        </div>
        <div>
          <span className="field-label">模型：</span>
          {lookup.frame.modelName} {lookup.frame.modelVersion}
        </div>
        <div>
          <span className="field-label">生成时间：</span>
          {formatDate(lookup.frame.createdAt)}
        </div>
        <div>
          <span className="field-label">来源任务：</span>
          {lookup.sourceTask ? summarizeText(lookup.sourceTask.prompt, 48) : '未找到来源任务'}
        </div>
      </div>
    </div>
  )
}

const ShotVideoCard = ({ lookup }: { lookup: VideoLookup }) => {
  if (!lookup.task || !lookup.previewUrl) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/70 p-4 dark:border-gray-700 dark:bg-gray-900/40">
        <div className="panel-title">视频预览</div>
        <p className="body-muted mt-3">当前镜头还没有可播放的视频预览。</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-4 dark:border-gray-700 dark:bg-gray-900/40">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="panel-title">视频预览</div>
          <p className="panel-value mt-1 font-semibold">{lookup.task.mode}</p>
        </div>
        <Badge variant={lookup.task.status === 'done' ? 'success' : 'warning'}>
          {lookup.task.status}
        </Badge>
      </div>
      <video src={lookup.previewUrl} controls preload="metadata" className="mt-4 h-56 w-full rounded-lg bg-black object-cover" />
      <div className="mt-4 space-y-2 text-sm">
        <div className="text-gray-600 dark:text-gray-400">
          <span className="font-medium text-gray-700 dark:text-gray-300">提示词：</span>
          {summarizeText(lookup.task.prompt, 120)}
        </div>
        <div className="text-gray-600 dark:text-gray-400">
          <span className="font-medium text-gray-700 dark:text-gray-300">任务模型：</span>
          {lookup.task.reqKey}
        </div>
        <div className="text-gray-600 dark:text-gray-400">
          <span className="font-medium text-gray-700 dark:text-gray-300">生成时间：</span>
          {formatDate(lookup.task.completedAt || lookup.task.updatedAt || lookup.task.createdAt)}
        </div>
        <div className="text-gray-600 dark:text-gray-400">
          <span className="font-medium text-gray-700 dark:text-gray-300">Tokens：</span>
          {lookup.task.tokensUsed ?? '-'}
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
    projectShotSlots,
    keyFrames,
    briefs,
    generationVersions,
    imageTasks,
    ensureDefaultProjectShotSlots,
    appendProjectShotSlot,
    assignShotToProjectSlot,
    clearProjectShotSlot,
    moveProjectShotSlot,
    addBrief,
    updateBrief,
    deleteBrief,
  } = useAppStore()
  const videoTasks = useGenerationStore((state) => state.tasks)

  const [briefModalOpen, setBriefModalOpen] = useState(false)
  const [editingBrief, setEditingBrief] = useState<Brief | null>(null)
  const [linkModalOpen, setLinkModalOpen] = useState(false)
  const [activeSlotId, setActiveSlotId] = useState<string | null>(null)
  const [slotSearchQuery, setSlotSearchQuery] = useState('')

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

  useEffect(() => {
    if (project) {
      ensureDefaultProjectShotSlots(project.id)
    }
  }, [project, ensureDefaultProjectShotSlots])

  const sortedProjectSlots = useMemo(
    () => projectShotSlots.filter((slot) => slot.projectId === id).sort((a, b) => a.position - b.position),
    [projectShotSlots, id],
  )

  const shotById = useMemo(() => new Map(shots.map((shot) => [shot.id, shot])), [shots])
  const slotItems = useMemo<SlotItem[]>(
    () => sortedProjectSlots.map((slot) => ({ slot, shot: slot.shotId ? shotById.get(slot.shotId) || null : null })),
    [sortedProjectSlots, shotById],
  )
  const filledSlotItems = useMemo(() => slotItems.filter((item) => item.shot), [slotItems])
  const projectShots = useMemo(() => filledSlotItems.map((item) => item.shot!).filter(Boolean), [filledSlotItems])
  const projectShotIds = useMemo(() => new Set(projectShots.map((shot) => shot.id)), [projectShots])
  const projectKeyFrames = useMemo(
    () => keyFrames.filter((frame) => projectShotIds.has(frame.parentShotId)),
    [keyFrames, projectShotIds],
  )
  const projectKeyFrameIds = useMemo(() => new Set(projectKeyFrames.map((frame) => frame.id)), [projectKeyFrames])
  const projectBriefs = useMemo(() => briefs.filter((brief) => brief.projectId === id), [briefs, id])
  const relatedImageTasks = useMemo(
    () => imageTasks.filter((task) => task.projectId === id || (task.shotId ? projectShotIds.has(task.shotId) : false)),
    [imageTasks, id, projectShotIds],
  )
  const relatedVideoTasks = useMemo(
    () => videoTasks.filter((task) => task.projectId === id || (task.shotId ? projectShotIds.has(task.shotId) : false)),
    [videoTasks, id, projectShotIds],
  )
  const relatedGenerationVersions = useMemo(
    () => generationVersions.filter((version) => projectKeyFrameIds.has(version.keyFrameId)),
    [generationVersions, projectKeyFrameIds],
  )

  const keyFrameById = useMemo(() => new Map(keyFrames.map((frame) => [frame.id, frame])), [keyFrames])
  const latestVideoTaskByShotId = useMemo(() => {
    const grouped = new Map<string, VideoGenerationTask[]>()
    relatedVideoTasks.forEach((task) => {
      if (!task.shotId) return
      const current = grouped.get(task.shotId) || []
      current.push(task)
      grouped.set(task.shotId, current)
    })

    const latest = new Map<string, VideoGenerationTask>()
    grouped.forEach((tasks, shotId) => {
      const selected = [...tasks].sort((a, b) => {
        const aTime = new Date(a.completedAt || a.updatedAt || a.createdAt).getTime()
        const bTime = new Date(b.completedAt || b.updatedAt || b.createdAt).getTime()
        if (a.status === 'done' && b.status !== 'done') return -1
        if (a.status !== 'done' && b.status === 'done') return 1
        return bTime - aTime
      })[0]
      if (selected) latest.set(shotId, selected)
    })

    return latest
  }, [relatedVideoTasks])

  const activeSlot = useMemo(() => slotItems.find((item) => item.slot.id === activeSlotId) || null, [slotItems, activeSlotId])

  const assignedShotIdsInProject = useMemo(() => new Set(filledSlotItems.map((item) => item.shot!.id)), [filledSlotItems])
  const candidateShots = useMemo(() => {
    const reservedShotIds = new Set([...assignedShotIdsInProject])
    if (activeSlot?.shot?.id) reservedShotIds.delete(activeSlot.shot.id)

    return shots
      .filter((shot) => !reservedShotIds.has(shot.id))
      .filter((shot) => includesText(shot.shotName, slotSearchQuery) || includesText(shot.promptId, slotSearchQuery) || includesText(shot.modelName, slotSearchQuery))
      .sort((a, b) => {
        const aScore = a.projectId === project?.id ? 0 : a.projectId ? 2 : 1
        const bScore = b.projectId === project?.id ? 0 : b.projectId ? 2 : 1
        if (aScore !== bScore) return aScore - bScore
        return a.shotName.localeCompare(b.shotName)
      })
  }, [shots, assignedShotIdsInProject, activeSlot, slotSearchQuery, project?.id])

  const getProjectName = (projectId: string) => projects.find((item) => item.id === projectId)?.projectName || '未关联项目'

  const getFrameLookup = (frameId: string | null): FrameLookup => {
    if (!frameId) return { frame: null, previewUrl: null, sourceTask: null }

    const frame = keyFrameById.get(frameId) || null
    const sourceTask = relatedImageTasks.find((task) => task.keyFrameIds.includes(frameId)) || null
    const resultIndex = sourceTask ? sourceTask.keyFrameIds.indexOf(frameId) : -1
    const previewUrl = sourceTask && resultIndex >= 0 ? sourceTask.outputImageUrls[resultIndex] || null : null

    return { frame, previewUrl, sourceTask }
  }

  const getVideoLookup = (shotId: string): VideoLookup => {
    const task = latestVideoTaskByShotId.get(shotId) || null
    return { task, previewUrl: task?.videoUrl || null }
  }

  const processRecords = useMemo<ProcessRecord[]>(() => {
    const shotRecords: ProcessRecord[] = filledSlotItems.map(({ slot, shot }) => ({
      id: `shot-${shot!.id}`,
      title: `镜头 ${slot.position} · ${shot!.shotName}`,
      category: '镜头模型',
      model: `${shot!.modelName || '-'} ${shot!.modelVersion || ''}`.trim(),
      time: shot!.updatedAt || shot!.createdAt,
      prompt: shot!.promptId ? `镜头提示词标识：${shot!.promptId}` : '未绑定镜头提示词标识',
      shotName: shot!.shotName,
      extra: `排序位 ${slot.position}`,
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
      (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime(),
    )
  }, [filledSlotItems, projectKeyFrames, relatedGenerationVersions, relatedImageTasks, relatedVideoTasks, keyFrameById, shotById])

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

  const openLinkModal = (slotId: string) => {
    setActiveSlotId(slotId)
    setSlotSearchQuery('')
    setLinkModalOpen(true)
  }

  const handleAssignShot = (shotId: string) => {
    if (!project || !activeSlot) return
    assignShotToProjectSlot(project.id, activeSlot.slot.id, shotId)
    setLinkModalOpen(false)
  }

  const handleClearSlot = (slotId: string) => {
    if (!project) return
    if (!window.confirm('确定要解除这个镜头位的关联吗？')) return
    clearProjectShotSlot(project.id, slotId)
  }

  const handleAddSlot = () => {
    if (!project) return
    appendProjectShotSlot(project.id)
  }

  if (!project) {
    return (
      <PageShell>
        <Button variant="secondary" className="gap-2" onClick={() => navigate('/projects/projects')}>
          <ArrowLeft size={16} />
          返回项目列表
        </Button>
        <div className="page-section py-8 text-center">
          <h1 className="page-title">项目不存在</h1>
          <p className="page-subtitle">当前链接没有找到可用的项目记录。</p>
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell>
      <PageIntro
        title={project.projectName}
        actions={(
          <Button variant="outline" className="gap-2" onClick={() => navigate('/projects/projects')}>
            <ArrowLeft size={16} />
            返回项目列表
          </Button>
        )}
      />

      <div className="grid gap-4 lg:grid-cols-4">
        <PageSection className="space-y-4 lg:col-span-2">
          <div className="body-text flex items-center gap-2 font-medium">
            <FolderKanban size={16} />
            项目基础信息
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <div className="eyebrow">品牌</div>
              <div className="mt-1 body-text font-medium text-gray-900 dark:text-gray-100">{brandName}</div>
            </div>
            <div>
              <div className="eyebrow">负责人</div>
              <div className="mt-1 body-text font-medium text-gray-900 dark:text-gray-100">{project.projectOwner || '-'}</div>
            </div>
            <div>
              <div className="eyebrow">阶段</div>
              <div className="mt-2">
                <Badge variant={stageMap[project.stage].variant}>{stageMap[project.stage].label}</Badge>
              </div>
            </div>
            <div>
              <div className="eyebrow">风险</div>
              <div className="mt-2">
                <Badge variant={riskMap[project.riskLevel].variant}>{riskMap[project.riskLevel].label}</Badge>
              </div>
            </div>
            <div className="md:col-span-2">
              <div className="eyebrow">项目进度</div>
              <div className="mt-2 flex items-center gap-3">
                <Progress value={project.progress} className="w-full max-w-xs" />
                <span className="body-text font-medium">{project.progress}%</span>
              </div>
            </div>
          </div>
        </PageSection>

        <div className="summary-card space-y-3">
          <div className="eyebrow">镜头位编排</div>
          <div className="metric-value">{filledSlotItems.length}</div>
          <p className="metric-caption">已关联镜头 / 共 {slotItems.length} 个镜头位</p>
        </div>

        <div className="summary-card space-y-3">
          <div className="eyebrow">提案与待审</div>
          <div className="flex items-end gap-4">
            <div>
              <div className="metric-value">{projectBriefs.length}</div>
              <div className="metric-caption">项目提案</div>
            </div>
            <div>
              <div className="metric-value">{project.pendingReviews}</div>
              <div className="metric-caption">待审核</div>
            </div>
          </div>
        </div>
      </div>

      <PageSection className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="section-title">镜头位编排</h2>
            <p className="section-subtitle">默认保留 1-5 个镜头位，可关联镜头管理中的现有镜头，并在这里做上下排序。</p>
          </div>
          <Button className="gap-2" onClick={handleAddSlot}>
            <Plus size={16} />
            添加镜头位
          </Button>
        </div>

        <div className="space-y-4">
          {slotItems.map((item, index) => {
            const { slot, shot } = item
            const canMoveUp = index > 0
            const canMoveDown = index < slotItems.length - 1

            if (!shot) {
              return (
                <div key={slot.id} className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/70 p-5 dark:border-gray-700 dark:bg-gray-900/40">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">镜头 {slot.position}</Badge>
                        <span className="body-muted">未关联镜头</span>
                      </div>
                      <p className="body-muted">这个排序位已经预留，可以从内容中心挑一个现有镜头关联进来。</p>
                    </div>
                    <Button variant="secondary" className="gap-2" onClick={() => openLinkModal(slot.id)}>
                      <Link2 size={14} />
                      关联镜头
                    </Button>
                  </div>
                </div>
              )
            }

            const opening = getFrameLookup(shot.firstFrameId)
            const ending = getFrameLookup(shot.lastFrameId)
            const video = getVideoLookup(shot.id)

            return (
              <div key={slot.id} className="space-y-5 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">镜头 {slot.position}</Badge>
                      <Film size={16} className="text-gray-700 dark:text-gray-300" />
                      <h3 className="card-title">{shot.shotName}</h3>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-900/50">
                        <div className="field-label">镜头提示词标识</div>
                        <div className="panel-value mt-2 text-gray-900 dark:text-gray-100">{shot.promptId || '未填写'}</div>
                      </div>
                      <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-900/50">
                        <div className="field-label">基础模型</div>
                        <div className="panel-value mt-2 text-gray-900 dark:text-gray-100">{shot.modelName || '未记录'} {shot.modelVersion || ''}</div>
                      </div>
                      <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-900/50">
                        <div className="field-label">首图记录</div>
                        <div className="panel-value mt-2 text-gray-900 dark:text-gray-100">{opening.frame?.name || '未绑定'}</div>
                      </div>
                      <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-900/50">
                        <div className="field-label">尾图记录</div>
                        <div className="panel-value mt-2 text-gray-900 dark:text-gray-100">{ending.frame?.name || '未绑定'}</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button variant="secondary" size="sm" className="gap-2" disabled={!canMoveUp} onClick={() => moveProjectShotSlot(project.id, slot.id, 'up')}>
                      <ArrowUp size={14} />
                      上移
                    </Button>
                    <Button variant="secondary" size="sm" className="gap-2" disabled={!canMoveDown} onClick={() => moveProjectShotSlot(project.id, slot.id, 'down')}>
                      <ArrowDown size={14} />
                      下移
                    </Button>
                    <Button variant="secondary" size="sm" className="gap-2" onClick={() => openLinkModal(slot.id)}>
                      <Link2 size={14} />
                      更换关联
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => navigate(`/content/shots/${shot.id}`)}>
                      查看详情
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-2 text-error hover:text-error" onClick={() => handleClearSlot(slot.id)}>
                      <Trash2 size={14} />
                      解除关联
                    </Button>
                  </div>
                </div>

                <div className="grid gap-4 xl:grid-cols-3">
                  <ShotVideoCard lookup={video} />
                  <FrameTraceCard label="首图" lookup={opening} />
                  <FrameTraceCard label="尾图" lookup={ending} />
                </div>
              </div>
            )
          })}
        </div>
      </PageSection>

      <PageSection className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="section-title">提案</h2>
            <p className="section-subtitle">复用项目提案数据，直接维护当前项目提案。</p>
          </div>
          <Button className="gap-2" onClick={() => openBriefModal()}>
            <Plus size={16} />
            新建提案
          </Button>
        </div>

        {projectBriefs.length === 0 ? (
          <div className="empty-state rounded-xl border-0 bg-transparent py-12">
            当前项目还没有提案，先补充提案内容和交付要求。
          </div>
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {projectBriefs.map((brief) => (
              <div key={brief.id} className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="card-title">{brief.briefTitle}</h3>
                    <p className="body-muted mt-2">{summarizeText(brief.description, 120)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="secondary" size="sm" className="gap-2" onClick={() => openBriefModal(brief)}>
                      编辑
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-2 text-error hover:text-error" onClick={() => removeBrief(brief.id)}>
                      <Trash2 size={14} />
                      删除
                    </Button>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-900/50">
                    <div className="field-label">目标受众</div>
                    <div className="panel-value mt-2 text-gray-900 dark:text-gray-100">{brief.targetAudience || '未填写'}</div>
                  </div>
                  <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-900/50">
                    <div className="field-label">交付平台</div>
                    <div className="panel-value mt-2 text-gray-900 dark:text-gray-100">{brief.platform || '未填写'}</div>
                  </div>
                  <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-900/50">
                    <div className="field-label">截止日期</div>
                    <div className="panel-value mt-2 text-gray-900 dark:text-gray-100">{brief.deadline ? formatDate(brief.deadline, 'date') : '未设置'}</div>
                  </div>
                  <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-900/50">
                    <div className="field-label">版本绑定</div>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant={brief.currentVersionId ? 'success' : 'outline'}>
                        {brief.currentVersionId ? '当前版本已绑定' : '当前版本未绑定'}
                      </Badge>
                    </div>
                  </div>
                </div>

                {brief.fileUrl && (
                  <div className="panel-value rounded-xl bg-gray-50 p-3 dark:bg-gray-900/50 dark:text-gray-300">
                    <span className="font-medium text-gray-800 dark:text-gray-200">文件链接：</span>
                    <a href={brief.fileUrl} target="_blank" rel="noreferrer" className="break-all text-gray-900 underline-offset-4 hover:underline dark:text-gray-100">
                      {brief.fileUrl}
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </PageSection>

      <PageSection className="space-y-6">
        <div>
          <h2 className="section-title">过程记录 / 模型记录</h2>
          <p className="section-subtitle">汇总当前项目使用过的镜头模型、关键帧模型、版本记录以及图片/视频生成任务。</p>
        </div>

        {processRecords.length === 0 ? (
          <div className="empty-state rounded-xl border-0 bg-transparent py-12">
            当前项目还没有可追溯的模型或生成过程记录。
          </div>
        ) : (
          <div className="space-y-3">
            {processRecords.map((record) => (
              <div key={record.id} className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{record.category}</Badge>
                      {record.shotName && <span className="body-muted">镜头：{record.shotName}</span>}
                    </div>
                    <h3 className="panel-title text-gray-900 dark:text-gray-100">{summarizeText(record.title, 80)}</h3>
                    <p className="body-muted">{summarizeText(record.prompt, 180)}</p>
                  </div>
                  <div className="body-muted min-w-[220px] space-y-2">
                    <div className="panel-value flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <Sparkles size={14} />
                      <span>{record.model || '-'}</span>
                    </div>
                    <div>时间：{formatDate(record.time)}</div>
                    {record.extra && <div>附加信息：{record.extra}</div>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </PageSection>

      <Modal title={editingBrief ? '编辑提案' : '新建提案'} isOpen={briefModalOpen} onClose={() => setBriefModalOpen(false)} onSave={saveBrief} width="max-w-2xl">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>提案标题 *</Label>
            <Input value={briefForm.briefTitle} onChange={(e) => setBriefForm({ ...briefForm, briefTitle: e.target.value })} placeholder="输入提案标题" />
          </div>
          <div className="space-y-2">
            <Label>内容描述</Label>
            <Input value={briefForm.description} onChange={(e) => setBriefForm({ ...briefForm, description: e.target.value })} placeholder="输入提案描述" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>目标受众</Label>
              <Input value={briefForm.targetAudience} onChange={(e) => setBriefForm({ ...briefForm, targetAudience: e.target.value })} placeholder="输入目标受众" />
            </div>
            <div className="space-y-2">
              <Label>交付平台</Label>
              <Input value={briefForm.platform} onChange={(e) => setBriefForm({ ...briefForm, platform: e.target.value })} placeholder="输入交付平台" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>截止日期</Label>
              <Input type="date" value={briefForm.deadline} onChange={(e) => setBriefForm({ ...briefForm, deadline: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>当前版本 ID</Label>
              <Input value={briefForm.currentVersionId} onChange={(e) => setBriefForm({ ...briefForm, currentVersionId: e.target.value })} placeholder="输入当前版本 ID" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>文件地址</Label>
            <Input value={briefForm.fileUrl} onChange={(e) => setBriefForm({ ...briefForm, fileUrl: e.target.value })} placeholder="输入文件地址" />
          </div>
        </div>
      </Modal>

      <Modal title={activeSlot ? `关联镜头 · 镜头 ${activeSlot.slot.position}` : '关联镜头'} isOpen={linkModalOpen} onClose={() => setLinkModalOpen(false)} width="max-w-3xl">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="slot-shot-search">搜索现有镜头</Label>
            <Input id="slot-shot-search" value={slotSearchQuery} onChange={(e) => setSlotSearchQuery(e.target.value)} placeholder="按镜头名称、Prompt ID 或模型筛选" />
          </div>
          <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
            {candidateShots.map((shot) => {
              const belongsToCurrentProject = shot.projectId === project.id
              const belongsToAnotherProject = Boolean(shot.projectId && shot.projectId !== project.id)
              const isCurrentSelection = activeSlot?.shot?.id === shot.id
              return (
                <div key={shot.id} className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900/40">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                      <h3 className="panel-value font-semibold">{shot.shotName}</h3>
                        {isCurrentSelection && <Badge variant="outline">当前关联</Badge>}
                        {belongsToCurrentProject && !isCurrentSelection && <Badge variant="success">当前项目镜头</Badge>}
                        {belongsToAnotherProject && <Badge variant="warning">原项目：{getProjectName(shot.projectId)}</Badge>}
                        {!shot.projectId && <Badge variant="outline">未归属项目</Badge>}
                      </div>
                      <div className="helper-text grid gap-2 sm:grid-cols-3">
                        <div>Prompt ID：{shot.promptId || '未填写'}</div>
                        <div>模型：{shot.modelName || '未填写'}</div>
                        <div>版本：{shot.modelVersion || '未填写'}</div>
                      </div>
                    </div>
                    <Button className="gap-2" onClick={() => handleAssignShot(shot.id)}>
                      <Link2 size={14} />
                      {belongsToAnotherProject ? '转移并关联' : isCurrentSelection ? '重新确认' : '关联到该排序位'}
                    </Button>
                  </div>
                </div>
              )
            })}
            {candidateShots.length === 0 && (
              <div className="body-muted rounded-xl border border-dashed border-gray-200 py-12 text-center dark:border-gray-700">
                暂无匹配镜头，可先去内容中心创建镜头后再回来关联。
              </div>
            )}
          </div>
        </div>
      </Modal>
    </PageShell>
  )
}
