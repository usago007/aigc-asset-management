import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowDown, ArrowLeft, ArrowUp, Film, FolderKanban, Link2, Plus, Sparkles, Trash2 } from 'lucide-react'
import { useAppStore } from '@/store/appStore'
import { useGenerationStore } from '@/store/generationStore'
import { formatDate } from '@/utils/date'
import { normalizeSearchText } from '@/utils/search'
import { showToast } from '@/utils/toast'
import MediaResultCard from '@/components/MediaResultCard'
import FakeVideoFrame from '@/components/FakeVideoFrame'
import Modal from '@/components/Modal'
import { PageSection, PageShell } from '@/components/PageShell'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  detailPageShellClass,
  projectSummaryCardClass,
  projectSummaryEyebrowClass,
  projectSummaryGridClass,
  projectSummaryHeaderClass,
  projectSummaryMetaListClass,
  projectSummaryMetaRowClass,
  projectSummaryTitleClass,
} from '@/pages/content/detailStyles'
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
  shotId?: string
  shotName?: string
  extra?: string
  actionLabel?: string
  actionPath?: string
}

type ProjectTraceSummaryItem = {
  id: string
  label: string
  value: string
  hint: string
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
      <MediaResultCard
        title={label}
        subtitle={`未绑定${label}`}
        mediaClassName="h-48 border border-dashed border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950"
        media={<div className="body-muted flex h-full items-center justify-center px-6 text-center">暂无结果</div>}
        rows={[
          { label: '状态', value: `未绑定${label}` },
          { label: '提示词', value: `当前镜头还没有绑定${label}记录。`, multiline: true },
        ]}
      />
    )
  }

  return (
    <MediaResultCard
      title={label}
      subtitle={lookup.frame.name}
      badge={<Badge variant="outline">{lookup.frame.type === 'Opening' ? '首图' : '尾图'}</Badge>}
      mediaClassName="h-48"
      media={lookup.previewUrl ? (
        <img src={lookup.previewUrl} alt={lookup.frame.name} className="h-full w-full object-cover" />
      ) : (
        <div className="body-muted flex h-full items-center justify-center border border-dashed border-gray-200 bg-gray-50 px-6 text-center dark:border-gray-800 dark:bg-gray-950">
          暂无可追溯图片
        </div>
      )}
      rows={[
        { label: '提示词', value: summarizeText(lookup.frame.promptText, 120), multiline: true },
        { label: '模型', value: `${lookup.frame.modelName} ${lookup.frame.modelVersion}`.trim() || '-' },
        { label: '时间', value: formatDate(lookup.frame.createdAt) },
        { label: 'TOKENS', value: lookup.sourceTask?.tokensUsed ?? '-' },
      ]}
    />
  )
}

const ShotVideoCard = ({ lookup }: { lookup: VideoLookup }) => {
  if (!lookup.task || !lookup.previewUrl) {
    return (
      <MediaResultCard
        title="视频预览"
        subtitle="暂无视频结果"
        mediaClassName="h-48 border border-dashed border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950"
        media={<div className="body-muted flex h-full items-center justify-center px-6 text-center">当前镜头还没有可播放的视频预览。</div>}
        rows={[
          { label: '状态', value: '暂无结果' },
          { label: '提示词', value: '先生成视频，再回到这里查看对应结果。', multiline: true },
        ]}
      />
    )
  }

  return (
    <MediaResultCard
      title="视频预览"
      subtitle={lookup.task.mode}
      mediaClassName="h-48 bg-black"
      media={(
        <FakeVideoFrame
          src={lookup.previewUrl}
          alt={lookup.task.prompt}
          aspectRatio={lookup.task.aspectRatio}
          durationLabel={lookup.task.frames === 241 ? '10 秒' : '5 秒'}
          modeLabel={lookup.task.mode}
          className="h-full w-full"
          showChrome={false}
        />
      )}
      rows={[
        { label: '提示词', value: summarizeText(lookup.task.prompt, 120), multiline: true },
        { label: '模型', value: lookup.task.reqKey },
        { label: '时间', value: formatDate(lookup.task.completedAt || lookup.task.updatedAt || lookup.task.createdAt) },
        { label: 'Tokens', value: lookup.task.tokensUsed ?? '-' },
      ]}
    />
  )
}

export default function ProjectDetail() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const {
    projects,
    brands,
    customers,
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
  const slotListRef = useRef<HTMLDivElement | null>(null)

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
  const projectBrand = project ? brands.find((brand) => brand.id === project.brandId) || null : null
  const brandName = projectBrand?.brandName || '-'
  const customerName = projectBrand ? customers.find((customer) => customer.id === projectBrand.customerId)?.customerName || '-' : '-'

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
  const primaryBrief = useMemo(() => {
    if (projectBriefs.length === 0) return null

    const byTimeDesc = (a: Brief, b: Brief) => {
      const aTime = new Date(a.updatedAt || a.createdAt).getTime()
      const bTime = new Date(b.updatedAt || b.createdAt).getTime()
      return bTime - aTime
    }

    const boundBrief = [...projectBriefs]
      .filter((brief) => Boolean(brief.currentVersionId))
      .sort(byTimeDesc)[0]

    return boundBrief || [...projectBriefs].sort(byTimeDesc)[0] || null
  }, [projectBriefs])
  const briefStatusVariant = primaryBrief?.currentVersionId ? 'success' : 'outline'
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

  const getLookupSortTime = (frame: KeyFrame | null, sourceTask: ImageGenerationTask | null) => {
    const taskTime = sourceTask?.completedAt || sourceTask?.updatedAt || sourceTask?.createdAt
    return new Date(taskTime || frame?.createdAt || 0).getTime()
  }

  const latestOpeningLookup = useMemo(() => {
    const lookups = projectShots
      .map((shot) => getFrameLookup(shot.firstFrameId))
      .filter((lookup) => lookup.frame)
      .sort((a, b) => getLookupSortTime(b.frame, b.sourceTask) - getLookupSortTime(a.frame, a.sourceTask))
    return lookups[0] || null
  }, [projectShots, keyFrameById, relatedImageTasks])

  const latestEndingLookup = useMemo(() => {
    const lookups = projectShots
      .map((shot) => getFrameLookup(shot.lastFrameId))
      .filter((lookup) => lookup.frame)
      .sort((a, b) => getLookupSortTime(b.frame, b.sourceTask) - getLookupSortTime(a.frame, a.sourceTask))
    return lookups[0] || null
  }, [projectShots, keyFrameById, relatedImageTasks])

  const latestProjectVideoTask = useMemo(() => {
    return [...latestVideoTaskByShotId.values()].sort((a, b) => {
      const aTime = new Date(a.completedAt || a.updatedAt || a.createdAt).getTime()
      const bTime = new Date(b.completedAt || b.updatedAt || b.createdAt).getTime()
      return bTime - aTime
    })[0] || null
  }, [latestVideoTaskByShotId])

  const boundFrameShotCount = useMemo(
    () => projectShots.filter((shot) => Boolean(shot.firstFrameId || shot.lastFrameId)).length,
    [projectShots],
  )
  const imageReadyShotCount = useMemo(
    () => new Set(relatedImageTasks.filter((task) => task.outputImageUrls.length > 0 && task.shotId).map((task) => task.shotId as string)).size,
    [relatedImageTasks],
  )
  const videoReadyShotCount = useMemo(
    () => new Set(relatedVideoTasks.filter((task) => task.status === 'done' && task.videoUrl && task.shotId).map((task) => task.shotId as string)).size,
    [relatedVideoTasks],
  )
  const selectedVersionCount = useMemo(
    () => relatedGenerationVersions.filter((version) => version.isSelected).length,
    [relatedGenerationVersions],
  )

  const processRecords = useMemo<ProcessRecord[]>(() => {
    const shotRecords: ProcessRecord[] = filledSlotItems.map(({ slot, shot }) => ({
      id: `shot-${shot!.id}`,
      title: `镜头 ${slot.position} · ${shot!.shotName}`,
      category: '镜头模型',
      model: `${shot!.modelName || '-'} ${shot!.modelVersion || ''}`.trim(),
      time: shot!.updatedAt || shot!.createdAt,
      prompt: shot!.promptId ? `镜头提示词标识：${shot!.promptId}` : '未绑定镜头提示词标识',
      shotId: shot!.id,
      shotName: shot!.shotName,
      extra: `排序位 ${slot.position}`,
      actionLabel: '查看镜头',
      actionPath: `/content/shots/${shot!.id}`,
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
        shotId: shot?.id,
        shotName: shot?.shotName,
        extra: frame.status,
        actionLabel: shot ? '查看镜头' : undefined,
        actionPath: shot ? `/content/shots/${shot.id}` : undefined,
      }
    })

    const versionCandidateMap = new Map<string, GenerationVersion>()
    relatedGenerationVersions.forEach((version) => {
      const current = versionCandidateMap.get(version.keyFrameId)
      if (!current) {
        versionCandidateMap.set(version.keyFrameId, version)
        return
      }
      if (version.isSelected && !current.isSelected) {
        versionCandidateMap.set(version.keyFrameId, version)
        return
      }
      const currentTime = new Date(current.generatedAt || current.createdAt).getTime()
      const nextTime = new Date(version.generatedAt || version.createdAt).getTime()
      if (nextTime > currentTime) {
        versionCandidateMap.set(version.keyFrameId, version)
      }
    })

    const versionRecords: ProcessRecord[] = [...versionCandidateMap.values()].map((version: GenerationVersion) => {
      const frame = keyFrameById.get(version.keyFrameId)
      const shot = frame ? shotById.get(frame.parentShotId) : null
      return {
        id: `version-${version.id}`,
        title: `${frame?.name || '关键帧'} v${version.versionNumber}`,
        category: '版本记录',
        model: `${version.modelName} ${version.modelVersion}`.trim(),
        time: version.generatedAt || version.createdAt,
        prompt: frame?.promptText || '未找到对应提示词',
        shotId: shot?.id,
        shotName: shot?.shotName,
        extra: version.isSelected ? '当前选中版本' : version.status,
        actionLabel: shot ? '查看镜头' : undefined,
        actionPath: shot ? `/content/shots/${shot.id}` : undefined,
      }
    })

    const imageTaskRecords: ProcessRecord[] = relatedImageTasks
      .filter((task: ImageGenerationTask) => task.outputImageUrls.length > 0 || Boolean(task.completedAt))
      .map((task: ImageGenerationTask) => {
      const shot = task.shotId ? shotById.get(task.shotId) : null
      return {
        id: `image-task-${task.id}`,
        title: task.prompt || '图片生成任务',
        category: '图片任务',
        model: task.reqKey,
        time: task.completedAt || task.updatedAt || task.createdAt,
        prompt: task.prompt,
        shotId: shot?.id,
        shotName: shot?.shotName,
        extra: `结果 ${task.outputImageUrls.length} 张${task.frameType ? ` / ${task.frameType === 'Opening' ? '首图' : '尾图'}` : ''}`,
        actionLabel: task.outputImageUrls.length > 0 ? '查看图片' : shot ? '查看镜头' : undefined,
        actionPath: task.outputImageUrls.length > 0 ? `/content/image-detail/${task.id}/0` : shot ? `/content/shots/${shot.id}` : undefined,
      }
    })

    const videoTaskRecords: ProcessRecord[] = relatedVideoTasks
      .filter((task: VideoGenerationTask) => (task.status === 'done' && Boolean(task.videoUrl)) || Boolean(task.completedAt))
      .map((task: VideoGenerationTask) => {
      const shot = task.shotId ? shotById.get(task.shotId) : null
      return {
        id: `video-task-${task.id}`,
        title: task.prompt || '视频生成任务',
        category: '视频任务',
        model: task.reqKey,
        time: task.completedAt || task.updatedAt || task.createdAt,
        prompt: task.prompt,
        shotId: shot?.id,
        shotName: shot?.shotName,
        extra: `${task.mode} / ${task.status}`,
        actionLabel: task.videoUrl ? '查看视频' : shot ? '查看镜头' : undefined,
        actionPath: task.videoUrl ? `/content/video-detail/${task.id}` : shot ? `/content/shots/${shot.id}` : undefined,
      }
    })

    return [...shotRecords, ...frameRecords, ...versionRecords, ...imageTaskRecords, ...videoTaskRecords].sort(
      (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime(),
    )
  }, [filledSlotItems, projectKeyFrames, relatedGenerationVersions, relatedImageTasks, relatedVideoTasks, keyFrameById, shotById])

  const recentActivities = useMemo(
    () => processRecords.slice(0, 5),
    [processRecords],
  )
  const traceSummaryItems = useMemo<ProjectTraceSummaryItem[]>(() => [
    {
      id: 'shot-coverage',
      label: '镜头位覆盖',
      value: `${filledSlotItems.length}/${slotItems.length || 0}`,
      hint: slotItems.length > 0 ? `已关联 ${filledSlotItems.length} 个镜头位` : '当前项目还没有镜头位',
    },
    {
      id: 'frame-binding',
      label: '首尾帧绑定',
      value: `${boundFrameShotCount}`,
      hint: projectShots.length > 0 ? `${projectShots.length} 个镜头中已有 ${boundFrameShotCount} 个镜头绑定首图或尾图` : '当前项目还没有镜头',
    },
    {
      id: 'image-ready',
      label: '图片结果',
      value: `${imageReadyShotCount}`,
      hint: relatedImageTasks.length > 0 ? `共 ${relatedImageTasks.length} 个图片任务，覆盖 ${imageReadyShotCount} 个镜头` : '当前项目还没有图片结果',
    },
    {
      id: 'video-ready',
      label: '视频结果',
      value: `${videoReadyShotCount}`,
      hint: relatedVideoTasks.length > 0 ? `共 ${relatedVideoTasks.length} 个视频任务，已有 ${videoReadyShotCount} 个镜头产出视频` : '当前项目还没有视频结果',
    },
    {
      id: 'version-selected',
      label: '当前版本',
      value: `${selectedVersionCount}`,
      hint: relatedGenerationVersions.length > 0 ? `共 ${relatedGenerationVersions.length} 条关键帧版本记录` : '当前项目还没有版本记录',
    },
  ], [boundFrameShotCount, filledSlotItems.length, imageReadyShotCount, projectShots.length, relatedGenerationVersions.length, relatedImageTasks.length, relatedVideoTasks.length, selectedVersionCount, slotItems.length, videoReadyShotCount])

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
    showToast('success', '已添加镜头位')
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        const lastSlot = slotListRef.current?.lastElementChild as HTMLElement | null
        lastSlot?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    })
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
      <div className={detailPageShellClass}>
        <div className="flex items-center">
          <Button variant="secondary" className="gap-2" onClick={() => navigate('/projects/projects')}>
            <ArrowLeft size={16} />
            返回项目列表
          </Button>
        </div>

        <div>
          <h1 className="detail-page-title">{project.projectName}</h1>
        </div>

        <PageSection className="space-y-4">
          <div className={projectSummaryGridClass}>
            <section className={projectSummaryCardClass}>
              <div className={projectSummaryHeaderClass}>
                <div className={projectSummaryEyebrowClass}>项目基础信息</div>
              </div>
              <div className={`mt-4 ${projectSummaryMetaListClass}`}>
                <div className={projectSummaryMetaRowClass}>
                  <span className="field-label">客户</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{customerName}</span>
                </div>
                <div className={projectSummaryMetaRowClass}>
                  <span className="field-label">品牌</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{brandName}</span>
                </div>
                <div className={projectSummaryMetaRowClass}>
                  <span className="field-label">负责人</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{project.projectOwner || '-'}</span>
                </div>
                <div className={projectSummaryMetaRowClass}>
                  <span className="field-label">阶段</span>
                  <Badge variant={stageMap[project.stage].variant}>{stageMap[project.stage].label}</Badge>
                </div>
                <div className={projectSummaryMetaRowClass}>
                  <span className="field-label">风险</span>
                  <Badge variant={riskMap[project.riskLevel].variant}>{riskMap[project.riskLevel].label}</Badge>
                </div>
              </div>
            </section>

            <section className={projectSummaryCardClass}>
              <div className={projectSummaryHeaderClass}>
                <div className={projectSummaryEyebrowClass}>项目生成信息</div>
              </div>
              <div className="mt-4 space-y-4">
                <div>
                  <div className="detail-meta-label">首图</div>
                  <div className={`mt-2 ${projectSummaryMetaListClass}`}>
                    <div className={projectSummaryMetaRowClass}>
                      <span className="field-label">模型</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {latestOpeningLookup?.frame ? `${latestOpeningLookup.frame.modelName} ${latestOpeningLookup.frame.modelVersion}`.trim() : '未生成'}
                      </span>
                    </div>
                    <div className={projectSummaryMetaRowClass}>
                      <span className="field-label">Tokens</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{latestOpeningLookup?.sourceTask?.tokensUsed ?? '-'}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="detail-meta-label">尾图</div>
                  <div className={`mt-2 ${projectSummaryMetaListClass}`}>
                    <div className={projectSummaryMetaRowClass}>
                      <span className="field-label">模型</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {latestEndingLookup?.frame ? `${latestEndingLookup.frame.modelName} ${latestEndingLookup.frame.modelVersion}`.trim() : '未生成'}
                      </span>
                    </div>
                    <div className={projectSummaryMetaRowClass}>
                      <span className="field-label">Tokens</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{latestEndingLookup?.sourceTask?.tokensUsed ?? '-'}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="detail-meta-label">视频</div>
                  <div className={`mt-2 ${projectSummaryMetaListClass}`}>
                    <div className={projectSummaryMetaRowClass}>
                      <span className="field-label">模型</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{latestProjectVideoTask?.reqKey || '未生成'}</span>
                    </div>
                    <div className={projectSummaryMetaRowClass}>
                      <span className="field-label">Tokens</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{latestProjectVideoTask?.tokensUsed ?? '-'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className={projectSummaryCardClass}>
              <div className={projectSummaryHeaderClass}>
                <div className={projectSummaryEyebrowClass}>提案</div>
                <div className="text-right">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {projectBriefs.length > 0 ? `${projectBriefs.length} 个提案` : '暂无提案'}
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className={projectSummaryTitleClass}>
                    {primaryBrief ? primaryBrief.briefTitle : '还没有主提案'}
                  </div>
                </div>
                <Button size="sm" className="shrink-0 gap-2" onClick={() => openBriefModal(primaryBrief || undefined)}>
                  <Plus size={14} />
                  {primaryBrief ? '编辑提案' : '新建提案'}
                </Button>
              </div>
              {primaryBrief ? (
                <>
                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
                    {summarizeText(primaryBrief.description, 120)}
                  </p>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <Badge variant={briefStatusVariant} className="px-2 py-0.5">
                      {primaryBrief.currentVersionId ? '当前版本已绑定' : '当前版本未绑定'}
                    </Badge>
                    <Button variant="ghost" size="sm" className="shrink-0 gap-2 text-error hover:text-error" onClick={() => removeBrief(primaryBrief.id)}>
                      <Trash2 size={14} />
                      删除
                    </Button>
                  </div>
                  <div className={`mt-4 ${projectSummaryMetaListClass}`}>
                    <div className={projectSummaryMetaRowClass}>
                      <span className="field-label">目标受众</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{primaryBrief.targetAudience || '未填写'}</span>
                    </div>
                    <div className={projectSummaryMetaRowClass}>
                      <span className="field-label">交付平台</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{primaryBrief.platform || '未填写'}</span>
                    </div>
                    <div className={projectSummaryMetaRowClass}>
                      <span className="field-label">截止日期</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {primaryBrief.deadline ? formatDate(primaryBrief.deadline, 'date') : '未设置'}
                      </span>
                    </div>
                  </div>
                  {primaryBrief.fileUrl ? (
                    <div className="mt-3 rounded-xl bg-gray-50 px-3 py-3 text-sm text-gray-700 dark:bg-gray-900/50 dark:text-gray-300">
                      <span className="field-label">文件链接</span>
                      <a href={primaryBrief.fileUrl} target="_blank" rel="noreferrer" className="mt-1 block break-all font-medium text-gray-900 underline-offset-4 hover:underline dark:text-gray-100">
                        {primaryBrief.fileUrl}
                      </a>
                    </div>
                  ) : null}
                </>
              ) : (
                <div className="mt-4 text-sm leading-6 text-gray-500 dark:text-gray-400">
                  当前项目还没有提案，先补充提案内容和交付要求。
                </div>
              )}
            </section>
          </div>
        </PageSection>

        <PageSection className="space-y-6">
          <div>
            <h2 className="section-title">镜头位编排</h2>
          </div>

          <div ref={slotListRef} className="space-y-4">
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
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">镜头 {slot.position}</Badge>
                      <Film size={16} className="text-gray-700 dark:text-gray-300" />
                      <h3 className="card-title">{shot.shotName}</h3>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-end gap-2 lg:mt-10 xl:mt-9">
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

            <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/70 p-5 text-center dark:border-gray-700 dark:bg-gray-900/40">
              <Button className="gap-2" onClick={handleAddSlot}>
                <Plus size={16} />
                添加镜头位
              </Button>
            </div>
          </div>
        </PageSection>

      <PageSection className="space-y-6">
        <div>
          <h2 className="section-title">项目追溯摘要</h2>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {traceSummaryItems.map((item) => (
            <div key={item.id} className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
              <div className="detail-meta-label">{item.label}</div>
              <div className="detail-hero-value mt-3">{item.value}</div>
              <p className="detail-note mt-3">{item.hint}</p>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="panel-title text-gray-900 dark:text-gray-100">最近关键动态</h3>
            </div>
            <Badge variant="outline">{recentActivities.length} 条</Badge>
          </div>

          {recentActivities.length === 0 ? (
            <div className="empty-state rounded-xl border-0 bg-transparent py-10">
              当前项目还没有形成可追溯的创作结果。
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivities.map((record) => (
                <div key={record.id} className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1 space-y-2 text-left">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">{record.category}</Badge>
                        {record.shotName ? <span className="body-muted">镜头：{record.shotName}</span> : null}
                      </div>
                      <h3 className="panel-title text-gray-900 dark:text-gray-100">{summarizeText(record.title, 80)}</h3>
                      <p className="body-muted">{summarizeText(record.prompt, 140)}</p>
                    </div>
                    <div className="min-w-[220px] space-y-3 text-left lg:flex lg:flex-col lg:items-end lg:text-right">
                      <div className="body-muted space-y-2 lg:flex lg:flex-col lg:items-end">
                        <div className="panel-value flex items-center gap-2 text-gray-700 dark:text-gray-300 lg:justify-end">
                          <Sparkles size={14} />
                          <span>{record.model || '-'}</span>
                        </div>
                        <div>时间：{formatDate(record.time)}</div>
                        {record.extra ? <div>附加信息：{record.extra}</div> : null}
                      </div>
                      {record.actionPath && record.actionLabel ? (
                        <Button variant="secondary" size="sm" className="gap-2 self-start lg:self-end" onClick={() => navigate(record.actionPath!)}>
                          {record.actionLabel}
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </PageSection>
      </div>

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
