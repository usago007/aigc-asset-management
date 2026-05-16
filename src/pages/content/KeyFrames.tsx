import { useState, useMemo } from 'react'
import { useAppStore } from '@/store/appStore'
import { formatDate } from '@/utils/date'
import { showToast } from '@/utils/toast'
import Modal from '@/components/Modal'
import Pagination from '@/components/Pagination'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus, Edit2, Trash2, Search } from 'lucide-react'
import type { KeyFrame, GenerationStatus } from '@/types'

const statusMap: Record<GenerationStatus, { label: string; variant: 'warning' | 'success' | 'destructive' }> = {
  Pending: { label: '进行中', variant: 'warning' },
  Completed: { label: '已完成', variant: 'success' },
  Failed: { label: '失败', variant: 'destructive' },
}

export default function KeyFrames() {
  const { keyFrames, shots, addKeyFrame, updateKeyFrame, deleteKeyFrame } = useAppStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<KeyFrame | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<GenerationStatus | 'all'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const [formData, setFormData] = useState({
    name: '',
    type: 'Opening' as 'Opening' | 'Ending',
    promptText: '',
    modelName: '',
    modelVersion: '',
    status: 'Pending' as GenerationStatus,
    parentShotId: '',
  })

  const filteredItems = useMemo(() => {
    return keyFrames.filter(kf => {
      const matchSearch = kf.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        kf.promptText.toLowerCase().includes(searchQuery.toLowerCase())
      const matchStatus = statusFilter === 'all' || kf.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [keyFrames, searchQuery, statusFilter])

  const paginatedItems = filteredItems.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const handleOpenModal = (item?: KeyFrame) => {
    if (item) {
      setEditingItem(item)
      setFormData({
        name: item.name,
        type: item.type,
        promptText: item.promptText,
        modelName: item.modelName,
        modelVersion: item.modelVersion,
        status: item.status,
        parentShotId: item.parentShotId,
      })
    } else {
      setEditingItem(null)
      setFormData({ name: '', type: 'Opening', promptText: '', modelName: '', modelVersion: '', status: 'Pending', parentShotId: '' })
    }
    setIsModalOpen(true)
  }

  const handleSave = () => {
    if (!formData.name || !formData.promptText) {
      showToast('error', '请填写完整信息')
      return
    }
    if (editingItem) {
      updateKeyFrame(editingItem.id, formData)
      showToast('success', '更新成功')
    } else {
      addKeyFrame(formData as Omit<KeyFrame, 'id' | 'createdAt' | 'updatedAt'>)
      showToast('success', '创建成功')
    }
    setIsModalOpen(false)
  }

  const handleDelete = (id: string) => {
    if (window.confirm('确定要删除吗？')) {
      deleteKeyFrame(id)
      showToast('success', '删除成功')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">首图/尾图管理</h1>
          <p className="text-sm text-gray-600 dark:text-gray-500 mt-1">管理所有首图和尾图资源</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="gap-2">
          <Plus size={16} /> 创建
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
          <Input placeholder="搜索名称或Prompt..." className="pl-10" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1) }} />
        </div>
        <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val as any); setCurrentPage(1) }}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="全部状态" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部状态</SelectItem>
            <SelectItem value="Pending">进行中</SelectItem>
            <SelectItem value="Completed">已完成</SelectItem>
            <SelectItem value="Failed">失败</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="card overflow-x-auto p-0">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800">
              <th className="table-header">名称</th>
              <th className="table-header">类型</th>
              <th className="table-header">AI模型</th>
              <th className="table-header">版本</th>
              <th className="table-header">状态</th>
              <th className="table-header">创建时间</th>
              <th className="table-header">操作</th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.map(kf => (
              <tr key={kf.id} className="border-b border-gray-200/50 dark:border-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800/30 transition-colors">
                <td className="table-cell font-medium text-gray-800 dark:text-gray-200">{kf.name}</td>
                <td className="table-cell">
                  <Badge variant={kf.type === 'Opening' ? 'info' : 'success'}>
                    {kf.type === 'Opening' ? '首图' : '尾图'}
                  </Badge>
                </td>
                <td className="table-cell">{kf.modelName}</td>
                <td className="table-cell">{kf.modelVersion}</td>
                <td className="table-cell">
                  <Badge variant={statusMap[kf.status].variant}>{statusMap[kf.status].label}</Badge>
                </td>
                <td className="table-cell text-gray-600 dark:text-gray-500">{formatDate(kf.createdAt)}</td>
                <td className="table-cell">
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenModal(kf)}>
                      <Edit2 size={14} />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(kf.id)}>
                      <Trash2 size={14} className="text-error" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {paginatedItems.length === 0 && <div className="py-12 text-center text-gray-600 dark:text-gray-500">暂无数据</div>}
      </div>

      <Pagination currentPage={currentPage} pageSize={pageSize} totalItems={filteredItems.length} onPageChange={setCurrentPage} />

      <Modal title={editingItem ? '编辑首图/尾图' : '创建首图/尾图'} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave}>
        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="kf-name">名称 *</Label>
            <Input id="kf-name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="输入名称" />
          </div>
          <div className="space-y-2">
            <Label>类型</Label>
            <Select value={formData.type} onValueChange={(val) => setFormData({ ...formData, type: val as any })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Opening">首图</SelectItem>
                <SelectItem value="Ending">尾图</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="kf-prompt">Prompt内容 *</Label>
            <Textarea id="kf-prompt" className="min-h-[100px]" value={formData.promptText} onChange={(e) => setFormData({ ...formData, promptText: e.target.value })} placeholder="输入Prompt提示词" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>AI模型</Label><Input value={formData.modelName} onChange={(e) => setFormData({ ...formData, modelName: e.target.value })} placeholder="如：Midjourney" /></div>
            <div className="space-y-2"><Label>模型版本</Label><Input value={formData.modelVersion} onChange={(e) => setFormData({ ...formData, modelVersion: e.target.value })} placeholder="如：v6.0" /></div>
          </div>
          <div className="space-y-2">
            <Label>关联镜头</Label>
            <Select value={formData.parentShotId || 'none'} onValueChange={(val) => setFormData({ ...formData, parentShotId: val === 'none' ? '' : val })}>
              <SelectTrigger><SelectValue placeholder="选择镜头" /></SelectTrigger>
              <SelectContent><SelectItem value="none">选择镜头</SelectItem>{shots.map(s => <SelectItem key={s.id} value={s.id}>{s.shotName}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
      </Modal>
    </div>
  )
}
