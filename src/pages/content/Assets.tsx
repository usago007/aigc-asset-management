import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store/appStore'
import { useGenerationStore } from '@/store/generationStore'
import { formatDate } from '@/utils/date'
import { showToast } from '@/utils/toast'
import Modal from '@/components/Modal'
import Pagination from '@/components/Pagination'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus, Edit2, Trash2, Search, FileText, Play, Image as ImageIcon, ExternalLink } from 'lucide-react'
import type { Asset } from '@/types'

const ASSET_PLACEHOLDER_IMAGES = [
  'https://picsum.photos/seed/asset1/100/100',
  'https://picsum.photos/seed/asset2/100/100',
  'https://picsum.photos/seed/asset3/100/100',
  'https://picsum.photos/seed/asset4/100/100',
  'https://picsum.photos/seed/asset5/100/100',
]

const VIDEO_PLACEHOLDER = 'https://picsum.photos/seed/video/100/100'

export default function Assets() {
  const navigate = useNavigate()
  const { assets, projects, shots, imageTasks, addAsset, updateAsset, deleteAsset } = useAppStore()
  const { tasks: videoTasks } = useGenerationStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Asset | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const [formData, setFormData] = useState({
    assetName: '', type: 'Image' as 'Image' | 'Video' | 'Script', sourceType: 'image-task' as Asset['sourceType'], sourceTaskId: '', sourceResultIndex: '0', projectId: '', shotId: '', promptId: '', modelName: '', modelVersion: '', parentAssetIds: [] as string[], fileUrl: '',
  })
  const filteredShots = useMemo(() => shots.filter((shot) => shot.projectId === formData.projectId), [shots, formData.projectId])
  const completedImageTasks = useMemo(() => imageTasks.filter((task) => task.status === 'done' && task.outputImageUrls.length > 0), [imageTasks])
  const completedVideoTasks = useMemo(() => videoTasks.filter((task) => task.status === 'done'), [videoTasks])
  const selectedImageTask = useMemo(() => completedImageTasks.find((task) => task.id === formData.sourceTaskId), [completedImageTasks, formData.sourceTaskId])
  const selectedVideoTask = useMemo(() => completedVideoTasks.find((task) => task.id === formData.sourceTaskId), [completedVideoTasks, formData.sourceTaskId])

  const filteredItems = useMemo(() => assets.filter(asset => asset.assetName.toLowerCase().includes(searchQuery.toLowerCase())), [assets, searchQuery])
  const paginatedItems = filteredItems.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const handleOpenModal = (item?: Asset) => {
    if (item) {
      const inferredProjectId = item.projectId || shots.find((shot) => shot.id === item.shotId)?.projectId || ''
      setEditingItem(item)
      setFormData({ assetName: item.assetName, type: item.type, sourceType: item.sourceType, sourceTaskId: item.sourceTaskId || '', sourceResultIndex: String(item.sourceResultIndex ?? 0), projectId: inferredProjectId, shotId: item.shotId || '', promptId: item.promptId, modelName: item.modelName, modelVersion: item.modelVersion, parentAssetIds: item.parentAssetIds, fileUrl: item.fileUrl })
    }
    else { setEditingItem(null); setFormData({ assetName: '', type: 'Image', sourceType: 'image-task', sourceTaskId: '', sourceResultIndex: '0', projectId: '', shotId: '', promptId: '', modelName: '', modelVersion: '', parentAssetIds: [], fileUrl: '' }) }
    setIsModalOpen(true)
  }

  const handleSave = () => {
    if (!formData.assetName) { showToast('error', '请输入资产名称'); return }
    if (formData.type === 'Image' && !formData.sourceTaskId) { showToast('error', '请选择图片来源任务'); return }
    if (formData.type === 'Video' && !formData.sourceTaskId) { showToast('error', '请选择视频来源任务'); return }
    if (formData.type === 'Image' && !selectedImageTask) { showToast('error', '图片来源任务不存在'); return }
    if (formData.type === 'Video' && !selectedVideoTask) { showToast('error', '视频来源任务不存在'); return }
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
    if (editingItem) { updateAsset(editingItem.id, payload); showToast('success', '更新成功') }
    else { addAsset(payload as Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>); showToast('success', '创建成功') }
    setIsModalOpen(false)
  }

  const handleDelete = (id: string) => { if (window.confirm('确定要删除吗？')) { deleteAsset(id); showToast('success', '删除成功') } }
  const getProjectName = (asset: Asset) => {
    const projectId = asset.projectId || shots.find((shot) => shot.id === asset.shotId)?.projectId
    return projects.find((project) => project.id === projectId)?.projectName || '-'
  }
  const getShotName = (shotId?: string) => shotId ? shots.find(s => s.id === shotId)?.shotName || '-' : '-'
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
        const hash = asset.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
        return ASSET_PLACEHOLDER_IMAGES[hash % ASSET_PLACEHOLDER_IMAGES.length]
      }
    }
    if (asset.type === 'Video') return VIDEO_PLACEHOLDER
    const hash = asset.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
    return ASSET_PLACEHOLDER_IMAGES[hash % ASSET_PLACEHOLDER_IMAGES.length]
  }

  const handleTypeChange = (type: 'Image' | 'Video' | 'Script') => {
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">资产管理</h1>
          <p className="text-sm text-gray-600 dark:text-gray-500 mt-1">管理所有生成资产</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="gap-2"><Plus size={16} /> 创建资产</Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
          <Input placeholder="搜索资产名称..." className="pl-10" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1) }} />
        </div>
      </div>

      <div className="card overflow-x-auto p-0">
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
              <th className="table-header">操作</th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.map(asset => {
              const thumbnail = getAssetThumbnail(asset)
              const detailPath = getAssetDetailPath(asset)

              return (
                <tr key={asset.id} className="border-b border-gray-200/50 dark:border-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800/30 transition-colors">
                  <td className="table-cell">
                    <div
                      className={`relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 ${detailPath ? 'cursor-pointer ring-1 ring-transparent hover:ring-accent-500' : ''}`}
                      onClick={() => { if (detailPath) navigate(detailPath) }}
                    >
                      <img
                        src={thumbnail}
                        alt={asset.assetName}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      {asset.type === 'Video' && (
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <Play size={12} className="text-white" />
                        </div>
                      )}
                      {asset.type === 'Script' && (
                        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          <FileText size={16} className="text-gray-500 dark:text-gray-400" />
                        </div>
                      )}
                      {detailPath && (
                        <div className="absolute top-1 right-1 bg-black/50 rounded-full p-1">
                          <ExternalLink size={10} className="text-white" />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="table-cell font-medium text-gray-800 dark:text-gray-200">
                    {detailPath ? (
                      <button className="hover:text-accent-500 transition-colors text-left" onClick={() => navigate(detailPath)}>
                        {asset.assetName}
                      </button>
                    ) : (
                      asset.assetName
                    )}
                  </td>
                  <td className="table-cell"><Badge variant={asset.type === 'Image' ? 'info' : asset.type === 'Video' ? 'success' : 'warning'}>{asset.type === 'Image' ? '图片' : asset.type === 'Video' ? '视频' : '脚本'}</Badge></td>
                  <td className="table-cell">{getProjectName(asset)}</td>
                  <td className="table-cell">{getShotName(asset.shotId)}</td>
                  <td className="table-cell">{asset.modelName} {asset.modelVersion}</td>
                  <td className="table-cell text-gray-600 dark:text-gray-500">{formatDate(asset.createdAt)}</td>
                  <td className="table-cell">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenModal(asset)}><Edit2 size={14} /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(asset.id)}><Trash2 size={14} className="text-error" /></Button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {paginatedItems.length === 0 && <div className="py-12 text-center text-gray-600 dark:text-gray-500">暂无数据</div>}
      </div>

      <Pagination currentPage={currentPage} pageSize={pageSize} totalItems={filteredItems.length} onPageChange={setCurrentPage} />

      <Modal title={editingItem ? '编辑资产' : '创建资产'} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave}>
        <div className="space-y-5">
          <div className="space-y-2"><Label>资产名称 *</Label><Input value={formData.assetName} onChange={(e) => setFormData({ ...formData, assetName: e.target.value })} placeholder="输入资产名称" /></div>
          <div className="space-y-2"><Label>类型</Label><Select value={formData.type} onValueChange={(val) => handleTypeChange(val as any)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Image">图片</SelectItem><SelectItem value="Video">视频</SelectItem><SelectItem value="Script">脚本</SelectItem></SelectContent></Select></div>
          {formData.type === 'Image' && (
            <>
              <div className="space-y-2">
                <Label>来源图片任务 *</Label>
                <Select value={formData.sourceTaskId || 'none'} onValueChange={(val) => {
                  const nextId = val === 'none' ? '' : val
                  if (!nextId) {
                    setFormData({ ...formData, sourceTaskId: '', sourceResultIndex: '0', projectId: '', shotId: '', promptId: '', modelName: '', modelVersion: '', fileUrl: '' })
                    return
                  }
                  const nextTask = completedImageTasks.find((task) => task.id === nextId)
                  const nextIndex = '0'
                  if (nextTask) applyImageSource(nextId, nextIndex)
                }}>
                  <SelectTrigger><SelectValue placeholder="选择图片任务" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">选择图片任务</SelectItem>
                    {completedImageTasks.map(task => <SelectItem key={task.id} value={task.id}>{task.prompt.slice(0, 24)} · {task.outputImageUrls.length}张</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>来源结果 *</Label>
                <Select value={formData.sourceResultIndex} onValueChange={(val) => applyImageSource(formData.sourceTaskId, val)} disabled={!selectedImageTask}>
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
              <Select value={formData.sourceTaskId || 'none'} onValueChange={(val) => {
                const nextId = val === 'none' ? '' : val
                if (!nextId) {
                  setFormData({ ...formData, sourceTaskId: '', projectId: '', shotId: '', promptId: '', modelName: '', modelVersion: '', fileUrl: '' })
                  return
                }
                applyVideoSource(nextId)
              }}>
                <SelectTrigger><SelectValue placeholder="选择视频任务" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">选择视频任务</SelectItem>
                  {completedVideoTasks.map(task => <SelectItem key={task.id} value={task.id}>{task.prompt.slice(0, 24)} · {task.aspectRatio}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-2"><Label>所属项目</Label><Select value={formData.projectId || 'none'} onValueChange={(val) => setFormData({ ...formData, projectId: val === 'none' ? '' : val, shotId: '' })} disabled={formData.type !== 'Script'}><SelectTrigger><SelectValue placeholder="选择项目" /></SelectTrigger><SelectContent><SelectItem value="none">不绑定项目</SelectItem>{projects.map(project => <SelectItem key={project.id} value={project.id}>{project.projectName}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-2"><Label>所属镜头</Label><Select value={formData.shotId || 'none'} onValueChange={(val) => {
            const nextShotId = val === 'none' ? '' : val
            const nextShot = shots.find((shot) => shot.id === nextShotId)
            setFormData({ ...formData, projectId: nextShot?.projectId || formData.projectId, shotId: nextShotId })
          }} disabled={formData.type !== 'Script'}><SelectTrigger><SelectValue placeholder="选择镜头" /></SelectTrigger><SelectContent><SelectItem value="none">不绑定镜头</SelectItem>{filteredShots.map(s => <SelectItem key={s.id} value={s.id}>{s.shotName}</SelectItem>)}</SelectContent></Select></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>AI模型</Label><Input value={formData.modelName} onChange={(e) => setFormData({ ...formData, modelName: e.target.value })} disabled={formData.type !== 'Script'} /></div>
            <div className="space-y-2"><Label>模型版本</Label><Input value={formData.modelVersion} onChange={(e) => setFormData({ ...formData, modelVersion: e.target.value })} disabled={formData.type !== 'Script'} /></div>
          </div>
          <div className="space-y-2"><Label>文件路径/URL</Label><Input value={formData.fileUrl} onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })} placeholder="如：/assets/video.mp4" disabled={formData.type !== 'Script'} /></div>
        </div>
      </Modal>
    </div>
  )
}
