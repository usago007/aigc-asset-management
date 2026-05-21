import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Edit2, FolderKanban, ImageIcon, Video, Clapperboard } from 'lucide-react'
import { useAppStore } from '@/store/appStore'
import { useGenerationStore } from '@/store/generationStore'
import { formatDate } from '@/utils/date'
import { showToast } from '@/utils/toast'
import MediaResultCard from '@/components/MediaResultCard'
import Modal from '@/components/Modal'
import ImageCreationWorkspace from '@/components/ImageCreationWorkspace'
import VideoCreationWorkspace from '@/components/VideoCreationWorkspace'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PageSection, PageShell } from '@/components/PageShell'
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
      <MediaResultCard
        title={label}
        subtitle={`未绑定${label}`}
        mediaClassName="h-48 border border-dashed border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950"
        media={<div className="body-muted flex h-full items-center justify-center px-6 text-center">暂无结果</div>}
        rows={[
          { label: '状态', value: `未绑定${label}` },
          { label: '提示词', value: `当前镜头还没有绑定${label}记录。`, multiline: true },
        ]}
        reserveFooter
      />
    )
  }

  const resultIndex = lookup.sourceTask ? lookup.sourceTask.keyFrameIds.indexOf(lookup.frame.id) : -1

  return (
    <MediaResultCard
      title={label}
      subtitle={lookup.frame.name}
      badge={<Badge variant="outline">{lookup.frame.type === 'Opening' ? '首图' : '尾图'}</Badge>}
      mediaClassName="h-48"
      media={lookup.previewUrl ? (
        <button
          type="button"
          className="block h-full w-full"
          onClick={() => {
            if (lookup.sourceTask && resultIndex >= 0) {
              onOpenDetail(lookup.sourceTask.id, resultIndex)
            }
          }}
        >
          <img src={lookup.previewUrl} alt={lookup.frame.name} className="h-full w-full object-cover" />
        </button>
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
      footer={lookup.sourceTask && resultIndex >= 0 ? (
        <Button variant="secondary" size="sm" className="gap-2" onClick={() => onOpenDetail(lookup.sourceTask!.id, resultIndex)}>
          <ImageIcon size={14} />
          查看图片详情
        </Button>
      ) : undefined}
      reserveFooter
    />
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
      <MediaResultCard
        title="最终视频"
        subtitle="暂无视频结果"
        mediaClassName="h-48 border border-dashed border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950"
        media={<div className="body-muted flex h-full items-center justify-center px-6 text-center">当前镜头还没有可播放的视频预览。</div>}
        rows={[
          { label: '状态', value: '暂无结果' },
          { label: '提示', value: '先在下方工作区生成视频，再回到这里确认最终版本。', multiline: true },
        ]}
        reserveFooter
      />
    )
  }

  return (
    <MediaResultCard
      title="最终视频"
      subtitle={lookup.task.mode}
      mediaClassName="h-48 bg-black"
      media={<video src={lookup.previewUrl} controls preload="metadata" className="h-full w-full bg-black object-cover" />}
      rows={[
        { label: '提示词', value: summarizeText(lookup.task.prompt, 120), multiline: true },
        { label: '模型', value: lookup.task.reqKey },
        { label: '时间', value: formatDate(lookup.task.completedAt || lookup.task.updatedAt || lookup.task.createdAt) },
        { label: 'Tokens', value: lookup.task.tokensUsed ?? '-' },
      ]}
      footer={(
        <Button variant="secondary" size="sm" className="gap-2" onClick={() => onOpenDetail(lookup.task!.id)}>
          <Video size={14} />
          查看视频详情
        </Button>
      )}
      reserveFooter
    />
  )
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
  const shotDetailNavState = useMemo(() => (
    shot ? { returnTo: `/content/shots/${shot.id}`, source: 'shot-detail' as const } : null
  ), [shot])

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
          <p className="body-muted mt-2">当前链接没有找到可用的镜头记录。</p>
        </div>
      </div>
    )
  }

  const opening = getFrameLookup(shot.firstFrameId)
  const ending = getFrameLookup(shot.lastFrameId)
  const videoLookup = getVideoLookup()
  const hasFrames = Boolean(shot.firstFrameId || shot.lastFrameId)
  const overviewMetaItems = [
    { label: '品牌', value: brand?.brandName || '-' },
    { label: '客户', value: customer?.customerName || '-' },
  ]
  const overviewSpecItems = [
    { label: '镜头提示词标识', value: shot.promptId || '未填写' },
    { label: '基础模型', value: `${shot.modelName || '未记录'} ${shot.modelVersion || ''}`.trim() || '未记录' },
  ]
  const statusToneMap: Record<string, { dotClassName: string; valueClassName: string; pillClassName: string; pillLabel: string }> = {
    '首尾帧绑定': {
      dotClassName: hasFrames ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600',
      valueClassName: hasFrames ? 'text-gray-950 dark:text-gray-50' : 'text-gray-500 dark:text-gray-400',
      pillLabel: hasFrames ? '已绑定' : '未绑定',
      pillClassName: hasFrames
        ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/40 dark:text-emerald-300'
        : 'border-gray-200 bg-gray-100 text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400',
    },
    '视频结果': {
      dotClassName: selectedVideoTask ? 'bg-sky-500' : latestVideoTask ? 'bg-amber-500' : 'bg-gray-300 dark:bg-gray-600',
      valueClassName: selectedVideoTask ? 'text-gray-950 dark:text-gray-50' : latestVideoTask ? 'text-gray-800 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400',
      pillLabel: selectedVideoTask ? '最终结果' : latestVideoTask ? '候选结果' : '待生成',
      pillClassName: selectedVideoTask
        ? 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/70 dark:bg-sky-950/40 dark:text-sky-300'
        : latestVideoTask
          ? 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/70 dark:bg-amber-950/40 dark:text-amber-300'
          : 'border-gray-200 bg-gray-100 text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400',
    },
    '图片结果': {
      dotClassName: latestImageTask ? 'bg-violet-500' : 'bg-gray-300 dark:bg-gray-600',
      valueClassName: latestImageTask ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400',
      pillLabel: latestImageTask ? '已产出' : '待生成',
      pillClassName: latestImageTask
        ? 'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900/70 dark:bg-violet-950/40 dark:text-violet-300'
        : 'border-gray-200 bg-gray-100 text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400',
    },
  }
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
  ]

  return (
    <PageShell>
      <div className="page-intro items-start">
        <div className="w-full space-y-3">
          <Button variant="secondary" className="gap-2" onClick={() => navigate('/content/shots')}>
            <ArrowLeft size={16} />
            返回镜头列表
          </Button>
          <div className="flex w-full flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1">
              <h1 className="page-title-compact">{shot.shotName}</h1>
            </div>
            <div className="flex flex-wrap items-center gap-2 lg:ml-6 lg:flex-none lg:justify-end">
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
        </div>
      </div>

      <PageSection className="space-y-6">
        <div className="panel-title flex items-center gap-2">
          <Clapperboard size={16} />
          镜头概览
        </div>
        <div className="overflow-hidden rounded-[28px] border border-gray-200 bg-gradient-to-br from-[#f8f7f2] via-white to-[#f6f5ef] shadow-[0_18px_44px_rgba(15,23,42,0.06)] dark:border-gray-800 dark:from-[#16181c] dark:via-[#111317] dark:to-[#0f1115]">
          <div className="grid gap-0 lg:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.95fr)]">
            <div className="space-y-6 p-6 lg:p-7">
              <div className="space-y-4">
                <div className="space-y-3">
                  <h2 className="max-w-4xl text-[30px] font-semibold tracking-[-0.05em] text-gray-950 dark:text-gray-50">
                    {project.projectName}
                  </h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {overviewMetaItems.map((item) => (
                    <div
                      key={item.label}
                      className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/85 px-3 py-1.5 text-sm text-gray-600 shadow-[0_8px_24px_rgba(15,23,42,0.03)] dark:border-gray-700 dark:bg-gray-900/85 dark:text-gray-300"
                    >
                      <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-gray-400 dark:text-gray-500">{item.label}</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-0 rounded-[24px] border border-gray-200/80 bg-white/70 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-950/60">
                {overviewSpecItems.map((item, index) => (
                  <div
                    key={item.label}
                    className={`grid gap-2 px-5 py-4 md:grid-cols-[140px_minmax(0,1fr)] md:items-center ${index > 0 ? 'border-t border-gray-200/80 dark:border-gray-800' : ''}`}
                  >
                    <dt className="text-[11px] font-medium uppercase tracking-[0.16em] text-gray-400 dark:text-gray-500">{item.label}</dt>
                    <dd className="text-[15px] font-medium leading-6 text-gray-800 dark:text-gray-200">{item.value}</dd>
                  </div>
                ))}
              </div>

              <div className="grid gap-3 rounded-[22px] border border-dashed border-gray-200/90 bg-white/45 px-5 py-4 md:grid-cols-2 dark:border-gray-800 dark:bg-gray-950/30">
                <div className="space-y-1">
                  <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-gray-400 dark:text-gray-500">创建时间</div>
                  <div className="text-sm font-medium text-gray-800 dark:text-gray-200">{formatDate(shot.createdAt)}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-gray-400 dark:text-gray-500">更新时间</div>
                  <div className="text-sm font-medium text-gray-800 dark:text-gray-200">{formatDate(shot.updatedAt)}</div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200/80 bg-[#fcfbf7] p-6 dark:border-gray-800 dark:bg-[#14171b] lg:border-l lg:border-t-0 lg:p-7">
              <div className="grid gap-3 sm:grid-cols-2">
                {statusCards.map((card) => (
                  <div key={card.label} className="rounded-[22px] border border-gray-200 bg-white p-4 shadow-[0_8px_20px_rgba(15,23,42,0.03)] dark:border-gray-800 dark:bg-gray-900">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`h-2 w-2 rounded-full ${statusToneMap[card.label].dotClassName}`} />
                          <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-gray-400 dark:text-gray-500">{card.label}</div>
                        </div>
                        <div className={`mt-3 text-[24px] font-semibold tracking-[-0.04em] ${statusToneMap[card.label].valueClassName}`}>{card.value}</div>
                      </div>
                      <span className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 text-xs font-medium ${statusToneMap[card.label].pillClassName}`}>
                        {statusToneMap[card.label].pillLabel}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-gray-500 dark:text-gray-400">{card.hint}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </PageSection>

      <div className="grid gap-4 xl:grid-cols-3">
        <ShotVideoCard
          lookup={videoLookup}
          onOpenDetail={(taskId) => navigate(`/content/video-detail/${taskId}`, { state: shotDetailNavState ?? undefined })}
        />
        <FrameTraceCard
          label="首图"
          lookup={opening}
          onOpenDetail={(taskId, resultIndex) => navigate(`/content/image-detail/${taskId}/${resultIndex}`, { state: shotDetailNavState ?? undefined })}
        />
        <FrameTraceCard
          label="尾图"
          lookup={ending}
          onOpenDetail={(taskId, resultIndex) => navigate(`/content/image-detail/${taskId}/${resultIndex}`, { state: shotDetailNavState ?? undefined })}
        />
      </div>

      <PageSection className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="section-title">创作工作区</h2>
            <p className="section-subtitle">当前页面已锁定在此镜头上下文，直接承接图片与视频创作能力。</p>
          </div>
          <div className="flex rounded-2xl border border-gray-200 bg-gray-50 p-1 dark:border-gray-800 dark:bg-gray-950">
            <button
              type="button"
              className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${activeCreationTab === 'image' ? 'bg-gray-950 text-white dark:bg-white dark:text-gray-950' : 'text-gray-500 dark:text-gray-400'}`}
              onClick={() => setActiveCreationTab('image')}
            >
              图片创作
            </button>
            <button
              type="button"
              className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${activeCreationTab === 'video' ? 'bg-gray-950 text-white dark:bg-white dark:text-gray-950' : 'text-gray-500 dark:text-gray-400'}`}
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
            detailNavState={shotDetailNavState ?? undefined}
          />
        ) : (
          <VideoCreationWorkspace
            contextMode="shot-detail"
            defaultProjectId={project.id}
            defaultShotId={shot.id}
            hideContextSelector
            filterTasksByShot
            detailNavState={shotDetailNavState ?? undefined}
          />
        )}
      </PageSection>

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
    </PageShell>
  )
}
