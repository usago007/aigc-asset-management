import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, Edit2, Trash2, Search, FileText, Play, ExternalLink } from 'lucide-react'
import { useAppStore } from '@/store/appStore'
import { useGenerationStore } from '@/store/generationStore'
import { formatDate } from '@/utils/date'
import { showToast } from '@/utils/toast'
import { matchesKeyword } from '@/utils/search'
import Modal from '@/components/Modal'
import Pagination from '@/components/Pagination'
import { ReadOnlyField, ReadOnlySection } from '@/components/ReadOnlyDetails'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PageIntro, PageSection, PageShell } from '@/components/PageShell'
import type { Asset } from '@/types'

const ASSET_PLACEHOLDER_IMAGES = [
  'https://picsum.photos/seed/asset1/100/100',
  'https://picsum.photos/seed/asset2/100/100',
  'https://picsum.photos/seed/asset3/100/100',
  'https://picsum.photos/seed/asset4/100/100',
  'https://picsum.photos/seed/asset5/100/100',
]

const VIDEO_PLACEHOLDER = 'https://picsum.photos/seed/video/100/100'

const assetTypeLabelMap: Record<Asset['type'], string> = {
  Image: '图片',
  Video: '视频',
  Script: '脚本',
}

const sourceTypeLabelMap: Record<Asset['sourceType'], string> = {
  'image-task': '图片任务',
  'video-task': '视频任务',
  script: '脚本录入',
}

function AssetThumb({
  asset,
  thumbnail,
  detailPath,
  onOpen,
}: {
  asset: Asset
  thumbnail: string
  detailPath: string | null
  onOpen: () => void
}) {
  return (
    <div
      className={`relative h-14 w-14 overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950 ${detailPath ? 'cursor-pointer transition-colors hover:border-gray-300 dark:hover:border-gray-700' : ''}`}
      onClick={() => {
        if (detailPath) onOpen()
      }}
    >
      <img src={thumbnail} alt={asset.assetName} className="h-full w-full object-cover" loading="lazy" />
      {asset.type === 'Video' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <Play size={14} className="text-white" />
        </div>
      )}
      {asset.type === 'Script' && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-900">
          <FileText size={16} className="text-gray-400 dark:text-gray-500" />
        </div>
      )}
      {detailPath && (
        <div className="absolute right-1.5 top-1.5 rounded-full bg-black/45 p-1">
          <ExternalLink size={10} className="text-white" />
        </div>
      )}
    </div>
  )
}

export default function Assets() {
  const navigate = useNavigate()
  const { assets, projects, shots, imageTasks, updateAsset, deleteAsset } = useAppStore()
  const { tasks: videoTasks } = useGenerationStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [viewingItem, setViewingItem] = useState<Asset | null>(null)
  const [editingItem, setEditingItem] = useState<Asset | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | Asset['type']>('all')
  const [projectFilter, setProjectFilter] = useState('all')
  const [shotFilter, setShotFilter] = useState('all')
  const [sourceTypeFilter, setSourceTypeFilter] = useState<'all' | Asset['sourceType']>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const [formData, setFormData] = useState({
    assetName: '',
    type: 'Image' as Asset['type'],
    sourceType: 'image-task' as Asset['sourceType'],
    sourceTaskId: '',
    sourceResultIndex: '0',
    projectId: '',
    shotId: '',
    promptId: '',
    modelName: '',
    modelVersion: '',
    parentAssetIds: [] as string[],
    fileUrl: '',
  })

  const filteredShots = useMemo(() => shots.filter((shot) => shot.projectId === formData.projectId), [shots, formData.projectId])
  const completedImageTasks = useMemo(() => imageTasks.filter((task) => task.status === 'done' && task.outputImageUrls.length > 0), [imageTasks])
  const completedVideoTasks = useMemo(() => videoTasks.filter((task) => task.status === 'done'), [videoTasks])
  const selectedImageTask = useMemo(() => completedImageTasks.find((task) => task.id === formData.sourceTaskId), [completedImageTasks, formData.sourceTaskId])
  const selectedVideoTask = useMemo(() => completedVideoTasks.find((task) => task.id === formData.sourceTaskId), [completedVideoTasks, formData.sourceTaskId])

  const getProjectId = (asset: Asset) => asset.projectId || shots.find((shot) => shot.id === asset.shotId)?.projectId || ''
  const getProjectName = (asset: Asset) => projects.find((project) => project.id === getProjectId(asset))?.projectName || '-'
  const getShotName = (shotId?: string) => shotId ? shots.find((shot) => shot.id === shotId)?.shotName || '-' : '-'
  const getTaskSummary = (asset: Asset) => {
    if (!asset.sourceTaskId) return '-'
    if (asset.sourceType === 'image-task') {
      const task = imageTasks.find((item) => item.id === asset.sourceTaskId)
      return task ? task.prompt.slice(0, 40) : asset.sourceTaskId
    }
    if (asset.sourceType === 'video-task') {
      const task = videoTasks.find((item) => item.id === asset.sourceTaskId)
      return task ? task.prompt.slice(0, 40) : asset.sourceTaskId
    }
    return asset.sourceTaskId
  }

  const filteredItems = useMemo(() => (
    assets.filter((asset) => {
      const matchType = typeFilter === 'all' || asset.type === typeFilter
      const matchProject = projectFilter === 'all' || getProjectId(asset) === projectFilter
      const matchShot = shotFilter === 'all' || asset.shotId === shotFilter
      const matchSourceType = sourceTypeFilter === 'all' || asset.sourceType === sourceTypeFilter
      const matchSearch = matchesKeyword(searchQuery, [
        asset.assetName,
        assetTypeLabelMap[asset.type],
        sourceTypeLabelMap[asset.sourceType],
        getProjectName(asset),
        getShotName(asset.shotId),
        asset.promptId,
        asset.modelName,
        asset.modelVersion,
        asset.fileUrl,
        getTaskSummary(asset),
        asset.parentAssetIds,
      ])
      return matchType && matchProject && matchShot && matchSourceType && matchSearch
    })
  ), [assets, projects, shots, imageTasks, videoTasks, searchQuery, typeFilter, projectFilter, shotFilter, sourceTypeFilter])

  const paginatedItems = filteredItems.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const handleOpenModal = (item: Asset) => {
    const inferredProjectId = getProjectId(item)
    setEditingItem(item)
    setFormData({
      assetName: item.assetName,
      type: item.type,
      sourceType: item.sourceType,
      sourceTaskId: item.sourceTaskId || '',
      sourceResultIndex: String(item.sourceResultIndex ?? 0),
      projectId: inferredProjectId,
      shotId: item.shotId || '',
      promptId: item.promptId,
      modelName: item.modelName,
      modelVersion: item.modelVersion,
      parentAssetIds: item.parentAssetIds,
      fileUrl: item.fileUrl,
    })
    setIsModalOpen(true)
  }

  const handleSave = () => {
    if (!editingItem) {
      showToast('error', '当前页面仅支持编辑已有资产')
      return
    }
    if (!formData.assetName) {
      showToast('error', '请输入资产名称')
      return
    }
    if (formData.type === 'Image' && !formData.sourceTaskId) {
      showToast('error', '请选择图片来源任务')
      return
    }
    if (formData.type === 'Video' && !formData.sourceTaskId) {
      showToast('error', '请选择视频来源任务')
      return
    }
    if (formData.type === 'Image' && !selectedImageTask) {
      showToast('error', '图片来源任务不存在')
      return
    }
    if (formData.type === 'Video' && !selectedVideoTask) {
      showToast('error', '视频来源任务不存在')
      return
    }
    const selectedShot = formData.shotId ? shots.find((shot) => shot.id === formData.shotId) : undefined
    if (selectedShot && formData.projectId && selectedShot.projectId !== formData.projectId) {
      showToast('error', '所选镜头不属于当前项目')
      return
    }
    const imageResultIndex = Number(formData.sourceResultIndex)
    const payload = {
      ...formData,
      sourceTaskId: formData.type === 'Script' ? undefined : formData.sourceTaskId || undefined,
      sourceResultIndex: formData.type === 'Image' ? imageResultIndex : undefined,
      projectId: selectedShot?.projectId || formData.projectId || undefined,
      shotId: formData.shotId || undefined,
    }
    updateAsset(editingItem.id, payload)
    showToast('success', '更新成功')
    setIsModalOpen(false)
  }

  const handleDelete = (id: string) => {
    if (window.confirm('确定要删除吗？')) {
      deleteAsset(id)
      showToast('success', '删除成功')
    }
  }

  const getAssetDetailPath = (asset: Asset) => {
    if (asset.type === 'Image' && asset.sourceTaskId != null && asset.sourceResultIndex != null) {
      return `/content/image-detail/${asset.sourceTaskId}/${asset.sourceResultIndex}`
    }
    if (asset.type === 'Video' && asset.sourceTaskId) {
      return `/content/video-detail/${asset.sourceTaskId}`
    }
    return null
  }

  const getAssetThumbnail = (asset: Asset) => {
    if (asset.fileUrl) {
      if (asset.fileUrl.startsWith('http') || asset.fileUrl.startsWith('data:') || asset.fileUrl.startsWith('blob:')) return asset.fileUrl
      if (asset.type === 'Video') return VIDEO_PLACEHOLDER
      if (asset.type === 'Image') {
        const hash = asset.id.split('').reduce((acc, current) => acc + current.charCodeAt(0), 0)
        return ASSET_PLACEHOLDER_IMAGES[hash % ASSET_PLACEHOLDER_IMAGES.length]
      }
    }
    if (asset.type === 'Video') return VIDEO_PLACEHOLDER
    const hash = asset.id.split('').reduce((acc, current) => acc + current.charCodeAt(0), 0)
    return ASSET_PLACEHOLDER_IMAGES[hash % ASSET_PLACEHOLDER_IMAGES.length]
  }

  const handleTypeChange = (type: Asset['type']) => {
    setFormData((prev) => ({
      ...prev,
      type,
      sourceType: type === 'Image' ? 'image-task' : type === 'Video' ? 'video-task' : 'script',
      sourceTaskId: '',
      sourceResultIndex: '0',
      projectId: type === 'Script' ? prev.projectId : '',
      shotId: type === 'Script' ? prev.shotId : '',
      promptId: '',
      modelName: '',
      modelVersion: '',
      fileUrl: '',
    }))
  }

  const applyImageSource = (taskId: string, resultIndex: string) => {
    const task = completedImageTasks.find((item) => item.id === taskId)
    if (!task) return
    const nextIndex = Number(resultIndex)
    const nextShot = task.shotId ? shots.find((shot) => shot.id === task.shotId) : undefined
    setFormData((prev) => ({
      ...prev,
      sourceType: 'image-task',
      sourceTaskId: taskId,
      sourceResultIndex: resultIndex,
      projectId: task.projectId || nextShot?.projectId || '',
      shotId: task.shotId || '',
      promptId: task.reqKey,
      modelName: task.mode,
      modelVersion: task.resolution || '',
      fileUrl: task.outputImageUrls[nextIndex] || '',
    }))
  }

  const applyVideoSource = (taskId: string) => {
    const task = completedVideoTasks.find((item) => item.id === taskId)
    if (!task) return
    const nextShot = task.shotId ? shots.find((shot) => shot.id === task.shotId) : undefined
    setFormData((prev) => ({
      ...prev,
      sourceType: 'video-task',
      sourceTaskId: taskId,
      sourceResultIndex: '0',
      projectId: task.projectId || nextShot?.projectId || '',
      shotId: task.shotId || '',
      promptId: task.reqKey,
      modelName: 'Seedsance 1.5 Pro',
      modelVersion: task.aspectRatio,
      fileUrl: task.videoUrl || '',
    }))
  }

  return (
    <PageShell>
      <PageIntro title="资产库" />

      <PageSection className="space-y-5">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative max-w-sm flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input placeholder="搜索资产、项目、镜头、模型或文件地址..." className="pl-10" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1) }} />
          </div>
          <Select value={typeFilter} onValueChange={(value) => { setTypeFilter(value as 'all' | Asset['type']); setCurrentPage(1) }}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="全部类型" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部类型</SelectItem>
              <SelectItem value="Image">图片</SelectItem>
              <SelectItem value="Video">视频</SelectItem>
              <SelectItem value="Script">脚本</SelectItem>
            </SelectContent>
          </Select>
          <Select value={projectFilter} onValueChange={(value) => { setProjectFilter(value); setCurrentPage(1) }}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="全部项目" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部项目</SelectItem>
              {projects.map((project) => <SelectItem key={project.id} value={project.id}>{project.projectName}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={shotFilter} onValueChange={(value) => { setShotFilter(value); setCurrentPage(1) }}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="全部镜头" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部镜头</SelectItem>
              {shots.map((shot) => <SelectItem key={shot.id} value={shot.id}>{shot.shotName}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={sourceTypeFilter} onValueChange={(value) => { setSourceTypeFilter(value as 'all' | Asset['sourceType']); setCurrentPage(1) }}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="全部来源" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部来源</SelectItem>
              <SelectItem value="image-task">图片任务</SelectItem>
              <SelectItem value="video-task">视频任务</SelectItem>
              <SelectItem value="script">脚本录入</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="filter-meta">
          <span>共 {filteredItems.length} 条资产记录</span>
        </div>

        <div className="card overflow-x-auto p-0 shadow-none">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="table-header">缩略图</th>
                <th className="table-header">资产名称</th>
                <th className="table-header">类型</th>
                <th className="table-header">所属项目</th>
                <th className="table-header">所属镜头</th>
                <th className="table-header">AI模型</th>
                <th className="table-header">创建时间</th>
                <th className="table-header text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {paginatedItems.map((asset) => {
                const thumbnail = getAssetThumbnail(asset)
                const detailPath = getAssetDetailPath(asset)
                const openDetail = () => {
                  if (detailPath) navigate(detailPath, { state: { returnTo: '/content/assets', source: 'assets' } })
                }

                return (
                  <tr key={asset.id} className="border-b border-gray-100 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-950">
                    <td className="table-cell">
                      <AssetThumb asset={asset} thumbnail={thumbnail} detailPath={detailPath} onOpen={openDetail} />
                    </td>
                    <td className="table-cell">
                      <div className="space-y-1">
                        {detailPath ? (
                          <button className="text-left font-medium text-gray-900 transition-colors hover:text-black dark:text-gray-100" onClick={openDetail}>
                            {asset.assetName}
                          </button>
                        ) : <div className="font-medium text-gray-900 dark:text-gray-100">{asset.assetName}</div>}
                        <div className="helper-text max-w-[280px] truncate">
                          {sourceTypeLabelMap[asset.sourceType]} · {getTaskSummary(asset)}
                        </div>
                      </div>
                    </td>
                    <td className="table-cell"><Badge variant={asset.type === 'Image' ? 'info' : asset.type === 'Video' ? 'success' : 'warning'}>{assetTypeLabelMap[asset.type]}</Badge></td>
                    <td className="table-cell">{getProjectName(asset)}</td>
                    <td className="table-cell">{getShotName(asset.shotId)}</td>
                    <td className="table-cell">
                      <div className="max-w-[220px] truncate text-gray-600 dark:text-gray-400">{[asset.modelName, asset.modelVersion].filter(Boolean).join(' ') || '-'}</div>
                    </td>
                    <td className="table-cell text-gray-500 dark:text-gray-400">{formatDate(asset.createdAt)}</td>
                    <td className="table-cell">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => setViewingItem(asset)} title="查看"><Eye size={14} className="text-gray-500 dark:text-gray-400" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleOpenModal(asset)} title="编辑"><Edit2 size={14} className="text-gray-500 dark:text-gray-400" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(asset.id)} title="删除"><Trash2 size={14} className="text-red-500" /></Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {paginatedItems.length === 0 && <div className="py-14 text-center text-gray-500 dark:text-gray-400">暂无数据</div>}
        </div>

        <Pagination currentPage={currentPage} pageSize={pageSize} totalItems={filteredItems.length} onPageChange={setCurrentPage} />
      </PageSection>

      <Modal title="编辑资产" isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave}>
        <div className="space-y-5">
          <div className="space-y-2"><Label>资产名称 *</Label><Input value={formData.assetName} onChange={(e) => setFormData({ ...formData, assetName: e.target.value })} placeholder="输入资产名称" /></div>
          <div className="space-y-2"><Label>类型</Label><Select value={formData.type} onValueChange={(value) => handleTypeChange(value as Asset['type'])}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Image">图片</SelectItem><SelectItem value="Video">视频</SelectItem><SelectItem value="Script">脚本</SelectItem></SelectContent></Select></div>
          {formData.type === 'Image' && (
            <>
              <div className="space-y-2">
                <Label>来源图片任务 *</Label>
                <Select value={formData.sourceTaskId || 'none'} onValueChange={(value) => {
                  const nextId = value === 'none' ? '' : value
                  if (!nextId) {
                    setFormData({ ...formData, sourceTaskId: '', sourceResultIndex: '0', projectId: '', shotId: '', promptId: '', modelName: '', modelVersion: '', fileUrl: '' })
                    return
                  }
                  applyImageSource(nextId, '0')
                }}>
                  <SelectTrigger><SelectValue placeholder="选择图片任务" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">选择图片任务</SelectItem>
                    {completedImageTasks.map((task) => <SelectItem key={task.id} value={task.id}>{task.prompt.slice(0, 24)} · {task.outputImageUrls.length}张</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>来源结果 *</Label>
                <Select value={formData.sourceResultIndex} onValueChange={(value) => applyImageSource(formData.sourceTaskId, value)} disabled={!selectedImageTask}>
                  <SelectTrigger><SelectValue placeholder="选择图片结果" /></SelectTrigger>
                  <SelectContent>
                    {selectedImageTask?.outputImageUrls.map((_, index) => (
                      <SelectItem key={`${selectedImageTask.id}-${index}`} value={String(index)}>
                        第 {index + 1} 张结果
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
          {formData.type === 'Video' && (
            <div className="space-y-2">
              <Label>来源视频任务 *</Label>
              <Select value={formData.sourceTaskId || 'none'} onValueChange={(value) => {
                const nextId = value === 'none' ? '' : value
                if (!nextId) {
                  setFormData({ ...formData, sourceTaskId: '', projectId: '', shotId: '', promptId: '', modelName: '', modelVersion: '', fileUrl: '' })
                  return
                }
                applyVideoSource(nextId)
              }}>
                <SelectTrigger><SelectValue placeholder="选择视频任务" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">选择视频任务</SelectItem>
                  {completedVideoTasks.map((task) => <SelectItem key={task.id} value={task.id}>{task.prompt.slice(0, 24)} · {task.aspectRatio}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-2"><Label>所属项目</Label><Select value={formData.projectId || 'none'} onValueChange={(value) => setFormData({ ...formData, projectId: value === 'none' ? '' : value, shotId: '' })} disabled={formData.type !== 'Script'}><SelectTrigger><SelectValue placeholder="选择项目" /></SelectTrigger><SelectContent><SelectItem value="none">不绑定项目</SelectItem>{projects.map((project) => <SelectItem key={project.id} value={project.id}>{project.projectName}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-2"><Label>所属镜头</Label><Select value={formData.shotId || 'none'} onValueChange={(value) => {
            const nextShotId = value === 'none' ? '' : value
            const nextShot = shots.find((shot) => shot.id === nextShotId)
            setFormData({ ...formData, projectId: nextShot?.projectId || formData.projectId, shotId: nextShotId })
          }} disabled={formData.type !== 'Script'}><SelectTrigger><SelectValue placeholder="选择镜头" /></SelectTrigger><SelectContent><SelectItem value="none">不绑定镜头</SelectItem>{filteredShots.map((shot) => <SelectItem key={shot.id} value={shot.id}>{shot.shotName}</SelectItem>)}</SelectContent></Select></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Prompt ID</Label><Input value={formData.promptId} onChange={(e) => setFormData({ ...formData, promptId: e.target.value })} disabled={formData.type !== 'Script'} /></div>
            <div className="space-y-2"><Label>父资产 IDs</Label><Input value={formData.parentAssetIds.join(', ')} onChange={(e) => setFormData({ ...formData, parentAssetIds: e.target.value.split(',').map((item) => item.trim()).filter(Boolean) })} placeholder="asset-1, asset-2" disabled={formData.type !== 'Script'} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>AI模型</Label><Input value={formData.modelName} onChange={(e) => setFormData({ ...formData, modelName: e.target.value })} disabled={formData.type !== 'Script'} /></div>
            <div className="space-y-2"><Label>模型版本</Label><Input value={formData.modelVersion} onChange={(e) => setFormData({ ...formData, modelVersion: e.target.value })} disabled={formData.type !== 'Script'} /></div>
          </div>
          <div className="space-y-2"><Label>文件路径/URL</Label><Input value={formData.fileUrl} onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })} placeholder="如：/assets/video.mp4" disabled={formData.type !== 'Script'} /></div>
        </div>
      </Modal>

      <Modal title="查看资产" isOpen={Boolean(viewingItem)} onClose={() => setViewingItem(null)} width="max-w-2xl">
        {viewingItem && (
          <ReadOnlySection>
            <ReadOnlyField label="资产名称" value={viewingItem.assetName} />
            <ReadOnlyField label="类型" value={<Badge variant={viewingItem.type === 'Image' ? 'info' : viewingItem.type === 'Video' ? 'success' : 'warning'}>{assetTypeLabelMap[viewingItem.type]}</Badge>} />
            <ReadOnlyField label="来源类型" value={sourceTypeLabelMap[viewingItem.sourceType]} />
            <ReadOnlyField label="来源任务" value={getTaskSummary(viewingItem)} />
            <ReadOnlyField label="结果索引" value={viewingItem.sourceResultIndex != null ? String(viewingItem.sourceResultIndex + 1) : '-'} />
            <ReadOnlyField label="所属项目" value={getProjectName(viewingItem)} />
            <ReadOnlyField label="所属镜头" value={getShotName(viewingItem.shotId)} />
            <ReadOnlyField label="Prompt ID" value={viewingItem.promptId} />
            <ReadOnlyField label="AI模型" value={viewingItem.modelName} />
            <ReadOnlyField label="模型版本" value={viewingItem.modelVersion} />
            <ReadOnlyField label="父资产 IDs" value={viewingItem.parentAssetIds.join(', ')} />
            <ReadOnlyField label="创建时间" value={formatDate(viewingItem.createdAt)} />
            <ReadOnlyField label="更新时间" value={formatDate(viewingItem.updatedAt)} />
            <ReadOnlyField label="文件路径/URL" value={viewingItem.fileUrl} span="full" />
          </ReadOnlySection>
        )}
      </Modal>
    </PageShell>
  )
}
