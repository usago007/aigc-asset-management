import { useState, useMemo } from 'react'
import { useAppStore } from '@/store/appStore'
import { formatDate } from '@/utils/date'
import { showToast } from '@/utils/toast'
import Modal from '@/components/Modal'
import Pagination from '@/components/Pagination'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus, Edit2, Trash2, Search } from 'lucide-react'
import type { Shot, GenerationStatus } from '@/types'

const statusMap: Record<GenerationStatus, { label: string; variant: 'warning' | 'success' | 'destructive' }> = {
  Pending: { label: '进行中', variant: 'warning' },
  Completed: { label: '已完成', variant: 'success' },
  Failed: { label: '失败', variant: 'destructive' },
}

export default function Shots() {
  const { shots, projects, keyFrames, addShot, updateShot, deleteShot } = useAppStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Shot | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [projectFilter, setProjectFilter] = useState('all')
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
    status: 'Pending' as GenerationStatus,
  })

  const filteredItems = useMemo(() => {
    return shots.filter(shot => {
      const matchSearch = shot.shotName.toLowerCase().includes(searchQuery.toLowerCase())
      const matchProject = projectFilter === 'all' || shot.projectId === projectFilter
      return matchSearch && matchProject
    })
  }, [shots, searchQuery, projectFilter])

  const paginatedItems = filteredItems.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const handleOpenModal = (item?: Shot) => {
    if (item) {
      setEditingItem(item)
      setFormData({ shotName: item.shotName, projectId: item.projectId, firstFrameId: item.firstFrameId || '', lastFrameId: item.lastFrameId || '', promptId: item.promptId, modelName: item.modelName, modelVersion: item.modelVersion, status: item.status })
    } else {
      setEditingItem(null)
      setFormData({ shotName: '', projectId: '', firstFrameId: '', lastFrameId: '', promptId: '', modelName: '', modelVersion: '', status: 'Pending' })
    }
    setIsModalOpen(true)
  }

  const handleSave = () => {
    if (!formData.shotName) { showToast('error', '请输入镜头名称'); return }
    if (editingItem) { updateShot(editingItem.id, formData); showToast('success', '更新成功') }
    else { addShot(formData as Omit<Shot, 'id' | 'createdAt' | 'updatedAt'>); showToast('success', '创建成功') }
    setIsModalOpen(false)
  }

  const handleDelete = (id: string) => {
    if (window.confirm('确定要删除吗？')) { deleteShot(id); showToast('success', '删除成功') }
  }

  const getProjectName = (projectId: string) => projects.find(p => p.id === projectId)?.projectName || '-'
  const getFrameName = (frameId: string | null) => !frameId ? '-' : keyFrames.find(kf => kf.id === frameId)?.name || '-'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">镜头管理</h1>
          <p className="text-sm text-gray-600 dark:text-gray-500 mt-1">管理所有视频镜头</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="gap-2"><Plus size={16} /> 创建镜头</Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
          <Input placeholder="搜索镜头名称..." className="pl-10" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1) }} />
        </div>
        <Select value={projectFilter} onValueChange={(val) => { setProjectFilter(val); setCurrentPage(1) }}>
          <SelectTrigger className="w-[200px]"><SelectValue placeholder="全部项目" /></SelectTrigger>
          <SelectContent><SelectItem value="all">全部项目</SelectItem>{projects.map(p => <SelectItem key={p.id} value={p.id}>{p.projectName}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      <div className="card overflow-x-auto p-0">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800">
              <th className="table-header">镜头名称</th><th className="table-header">所属项目</th><th className="table-header">首图</th><th className="table-header">尾图</th><th className="table-header">AI模型</th><th className="table-header">状态</th><th className="table-header">创建时间</th><th className="table-header">操作</th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.map(shot => (
              <tr key={shot.id} className="border-b border-gray-200/50 dark:border-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800/30 transition-colors">
                <td className="table-cell font-medium text-gray-800 dark:text-gray-200">{shot.shotName}</td>
                <td className="table-cell">{getProjectName(shot.projectId)}</td>
                <td className="table-cell text-xs">{getFrameName(shot.firstFrameId)}</td>
                <td className="table-cell text-xs">{getFrameName(shot.lastFrameId)}</td>
                <td className="table-cell">{shot.modelName} {shot.modelVersion}</td>
                <td className="table-cell"><Badge variant={statusMap[shot.status].variant}>{statusMap[shot.status].label}</Badge></td>
                <td className="table-cell text-gray-600 dark:text-gray-500">{formatDate(shot.createdAt)}</td>
                <td className="table-cell">
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenModal(shot)}><Edit2 size={14} /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(shot.id)}><Trash2 size={14} className="text-error" /></Button>
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
          <div className="space-y-2"><Label>所属项目</Label><Select value={formData.projectId || 'none'} onValueChange={(val) => setFormData({ ...formData, projectId: val === 'none' ? '' : val })}><SelectTrigger><SelectValue placeholder="选择项目" /></SelectTrigger><SelectContent><SelectItem value="none">选择项目</SelectItem>{projects.map(p => <SelectItem key={p.id} value={p.id}>{p.projectName}</SelectItem>)}</SelectContent></Select></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>首图</Label><Select value={formData.firstFrameId || 'none'} onValueChange={(val) => setFormData({ ...formData, firstFrameId: val === 'none' ? '' : val })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">选择首图</SelectItem>{keyFrames.filter(kf => kf.type === 'Opening').map(kf => <SelectItem key={kf.id} value={kf.id}>{kf.name}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2"><Label>尾图</Label><Select value={formData.lastFrameId || 'none'} onValueChange={(val) => setFormData({ ...formData, lastFrameId: val === 'none' ? '' : val })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">选择尾图</SelectItem>{keyFrames.filter(kf => kf.type === 'Ending').map(kf => <SelectItem key={kf.id} value={kf.id}>{kf.name}</SelectItem>)}</SelectContent></Select></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>AI模型</Label><Input value={formData.modelName} onChange={(e) => setFormData({ ...formData, modelName: e.target.value })} placeholder="如：Midjourney" /></div>
            <div className="space-y-2"><Label>模型版本</Label><Input value={formData.modelVersion} onChange={(e) => setFormData({ ...formData, modelVersion: e.target.value })} placeholder="如：v6.0" /></div>
          </div>
        </div>
      </Modal>
    </div>
  )
}
