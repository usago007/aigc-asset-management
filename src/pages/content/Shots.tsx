import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, Plus, Edit2, Trash2 } from 'lucide-react'
import { useAppStore } from '@/store/appStore'
import { formatDate } from '@/utils/date'
import { showToast } from '@/utils/toast'
import { normalizeSearchText } from '@/utils/search'
import Modal from '@/components/Modal'
import Pagination from '@/components/Pagination'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import type { Shot } from '@/types'

const includesText = (value: unknown, query: string) => {
  const normalizedQuery = normalizeSearchText(query)
  if (!normalizedQuery) return true
  return normalizeSearchText(value).includes(normalizedQuery)
}

export default function Shots() {
  const navigate = useNavigate()
  const { shots, projects, keyFrames, addShot, updateShot, deleteShot } = useAppStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Shot | null>(null)
  const [filters, setFilters] = useState({
    shotName: '',
    projectId: 'all',
    firstFrameId: 'all',
    lastFrameId: 'all',
    promptId: '',
    modelName: '',
    modelVersion: '',
  })
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const [formData, setFormData] = useState({
    shotName: '',
    projectId: '',
    firstFrameId: '',
    lastFrameId: '',
    promptId: '',
    modelName: '',
    modelVersion: '',
  })

  const getProjectName = (projectId: string) => projects.find((project) => project.id === projectId)?.projectName || '-'
  const getFrameName = (frameId: string | null) => !frameId ? '-' : keyFrames.find((keyFrame) => keyFrame.id === frameId)?.name || '-'

  const openingFrames = useMemo(() => keyFrames.filter((keyFrame) => keyFrame.type === 'Opening'), [keyFrames])
  const endingFrames = useMemo(() => keyFrames.filter((keyFrame) => keyFrame.type === 'Ending'), [keyFrames])

  const filteredItems = useMemo(() => (
    shots.filter((shot) => {
      const matchShotName = includesText(shot.shotName, filters.shotName)
      const matchProject = filters.projectId === 'all' || shot.projectId === filters.projectId
      const matchOpening = filters.firstFrameId === 'all' || (shot.firstFrameId || '') === filters.firstFrameId
      const matchEnding = filters.lastFrameId === 'all' || (shot.lastFrameId || '') === filters.lastFrameId
      const matchPrompt = includesText(shot.promptId, filters.promptId)
      const matchModel = includesText(shot.modelName, filters.modelName)
      const matchVersion = includesText(shot.modelVersion, filters.modelVersion)
      return matchShotName && matchProject && matchOpening && matchEnding && matchPrompt && matchModel && matchVersion
    })
  ), [shots, filters])

  const paginatedItems = filteredItems.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const updateFilter = (key: 'shotName' | 'promptId' | 'modelName' | 'modelVersion', value: string) => {
    setFilters((current) => ({ ...current, [key]: value }))
    setCurrentPage(1)
  }

  const handleOpenModal = (item?: Shot) => {
    if (item) {
      setEditingItem(item)
      setFormData({ shotName: item.shotName, projectId: item.projectId, firstFrameId: item.firstFrameId || '', lastFrameId: item.lastFrameId || '', promptId: item.promptId, modelName: item.modelName, modelVersion: item.modelVersion })
    } else {
      setEditingItem(null)
      setFormData({ shotName: '', projectId: '', firstFrameId: '', lastFrameId: '', promptId: '', modelName: '', modelVersion: '' })
    }
    setIsModalOpen(true)
  }

  const handleSave = () => {
    if (!formData.shotName) {
      showToast('error', '请输入镜头名称')
      return
    }
    if (editingItem) {
      updateShot(editingItem.id, formData)
      showToast('success', '更新成功')
    } else {
      addShot(formData as Omit<Shot, 'id' | 'createdAt' | 'updatedAt'>)
      showToast('success', '创建成功')
    }
    setIsModalOpen(false)
  }

  const handleDelete = (id: string) => {
    if (window.confirm('确定要删除吗？')) {
      deleteShot(id)
      showToast('success', '删除成功')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">镜头管理</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-500">管理所有视频镜头</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="gap-2"><Plus size={16} /> 创建镜头</Button>
      </div>

      <div className="grid gap-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900/40 md:grid-cols-2 xl:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="shot-filter-name">镜头名称</Label>
          <Input id="shot-filter-name" value={filters.shotName} onChange={(e) => updateFilter('shotName', e.target.value)} placeholder="按镜头名称筛选" />
        </div>
        <div className="space-y-2">
          <Label>所属项目</Label>
          <Select value={filters.projectId} onValueChange={(value) => { setFilters((current) => ({ ...current, projectId: value })); setCurrentPage(1) }}>
            <SelectTrigger><SelectValue placeholder="全部项目" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部项目</SelectItem>
              {projects.map((project) => <SelectItem key={project.id} value={project.id}>{project.projectName}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>首图</Label>
          <Select value={filters.firstFrameId} onValueChange={(value) => { setFilters((current) => ({ ...current, firstFrameId: value })); setCurrentPage(1) }}>
            <SelectTrigger><SelectValue placeholder="全部首图" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部首图</SelectItem>
              {openingFrames.map((frame) => <SelectItem key={frame.id} value={frame.id}>{frame.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>尾图</Label>
          <Select value={filters.lastFrameId} onValueChange={(value) => { setFilters((current) => ({ ...current, lastFrameId: value })); setCurrentPage(1) }}>
            <SelectTrigger><SelectValue placeholder="全部尾图" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部尾图</SelectItem>
              {endingFrames.map((frame) => <SelectItem key={frame.id} value={frame.id}>{frame.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="shot-filter-prompt">Prompt ID</Label>
          <Input id="shot-filter-prompt" value={filters.promptId} onChange={(e) => updateFilter('promptId', e.target.value)} placeholder="按 Prompt ID 筛选" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="shot-filter-model">AI模型</Label>
          <Input id="shot-filter-model" value={filters.modelName} onChange={(e) => updateFilter('modelName', e.target.value)} placeholder="按 AI 模型筛选" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="shot-filter-version">模型版本</Label>
          <Input id="shot-filter-version" value={filters.modelVersion} onChange={(e) => updateFilter('modelVersion', e.target.value)} placeholder="按模型版本筛选" />
        </div>
      </div>

      <div className="card overflow-x-auto p-0">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800">
              <th className="table-header">镜头名称</th>
              <th className="table-header">所属项目</th>
              <th className="table-header">首图</th>
              <th className="table-header">尾图</th>
              <th className="table-header">AI模型</th>
              <th className="table-header">创建时间</th>
              <th className="table-header">操作</th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.map((shot) => (
              <tr key={shot.id} className="border-b border-gray-200/50 transition-colors hover:bg-gray-100 dark:border-gray-800/50 dark:hover:bg-gray-800/30">
                <td className="table-cell">
                  <button
                    type="button"
                    className="font-medium text-gray-800 transition-colors hover:text-accent-600 dark:text-gray-200 dark:hover:text-accent-400"
                    onClick={() => navigate(`/content/shots/${shot.id}`)}
                  >
                    {shot.shotName}
                  </button>
                </td>
                <td className="table-cell">{getProjectName(shot.projectId)}</td>
                <td className="table-cell text-xs">{getFrameName(shot.firstFrameId)}</td>
                <td className="table-cell text-xs">{getFrameName(shot.lastFrameId)}</td>
                <td className="table-cell">{[shot.modelName, shot.modelVersion].filter(Boolean).join(' ') || '-'}</td>
                <td className="table-cell text-gray-600 dark:text-gray-500">{formatDate(shot.createdAt)}</td>
                <td className="table-cell">
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={() => navigate(`/content/shots/${shot.id}`)} title="查看"><Eye size={14} className="text-gray-600 dark:text-gray-400" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleOpenModal(shot)} title="编辑"><Edit2 size={14} /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(shot.id)} title="删除"><Trash2 size={14} className="text-error" /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {paginatedItems.length === 0 && <div className="py-12 text-center text-gray-600 dark:text-gray-500">暂无数据</div>}
      </div>

      <Pagination currentPage={currentPage} pageSize={pageSize} totalItems={filteredItems.length} onPageChange={setCurrentPage} />

      <Modal title={editingItem ? '编辑镜头' : '创建镜头'} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave}>
        <div className="space-y-5">
          <div className="space-y-2"><Label>镜头名称 *</Label><Input value={formData.shotName} onChange={(e) => setFormData({ ...formData, shotName: e.target.value })} placeholder="输入镜头名称" /></div>
          <div className="space-y-2"><Label>所属项目</Label><Select value={formData.projectId || 'none'} onValueChange={(value) => setFormData({ ...formData, projectId: value === 'none' ? '' : value })}><SelectTrigger><SelectValue placeholder="选择项目" /></SelectTrigger><SelectContent><SelectItem value="none">选择项目</SelectItem>{projects.map((project) => <SelectItem key={project.id} value={project.id}>{project.projectName}</SelectItem>)}</SelectContent></Select></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>首图</Label><Select value={formData.firstFrameId || 'none'} onValueChange={(value) => setFormData({ ...formData, firstFrameId: value === 'none' ? '' : value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">选择首图</SelectItem>{openingFrames.map((keyFrame) => <SelectItem key={keyFrame.id} value={keyFrame.id}>{keyFrame.name}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2"><Label>尾图</Label><Select value={formData.lastFrameId || 'none'} onValueChange={(value) => setFormData({ ...formData, lastFrameId: value === 'none' ? '' : value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">选择尾图</SelectItem>{endingFrames.map((keyFrame) => <SelectItem key={keyFrame.id} value={keyFrame.id}>{keyFrame.name}</SelectItem>)}</SelectContent></Select></div>
          </div>
          <div className="space-y-2"><Label>Prompt ID</Label><Input value={formData.promptId} onChange={(e) => setFormData({ ...formData, promptId: e.target.value })} placeholder="输入 Prompt ID" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>AI模型</Label><Input value={formData.modelName} onChange={(e) => setFormData({ ...formData, modelName: e.target.value })} placeholder="如：Midjourney" /></div>
            <div className="space-y-2"><Label>模型版本</Label><Input value={formData.modelVersion} onChange={(e) => setFormData({ ...formData, modelVersion: e.target.value })} placeholder="如：v6.0" /></div>
          </div>
        </div>
      </Modal>
    </div>
  )
}
