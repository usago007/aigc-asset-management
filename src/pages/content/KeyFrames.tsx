import { useMemo, useState } from 'react'
import { Eye, Plus, Edit2, Trash2, Search } from 'lucide-react'
import { useAppStore } from '@/store/appStore'
import { formatDate } from '@/utils/date'
import { showToast } from '@/utils/toast'
import { matchesKeyword } from '@/utils/search'
import Modal from '@/components/Modal'
import Pagination from '@/components/Pagination'
import { ReadOnlyField, ReadOnlySection } from '@/components/ReadOnlyDetails'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { KeyFrame, GenerationStatus } from '@/types'

const statusMap: Record<GenerationStatus, { label: string; variant: 'warning' | 'success' | 'destructive' }> = {
  Pending: { label: '进行中', variant: 'warning' },
  Completed: { label: '已完成', variant: 'success' },
  Failed: { label: '失败', variant: 'destructive' },
}

export default function KeyFrames() {
  const { keyFrames, shots, addKeyFrame, updateKeyFrame, deleteKeyFrame } = useAppStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [viewingItem, setViewingItem] = useState<KeyFrame | null>(null)
  const [editingItem, setEditingItem] = useState<KeyFrame | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | KeyFrame['type']>('all')
  const [statusFilter, setStatusFilter] = useState<GenerationStatus | 'all'>('all')
  const [shotFilter, setShotFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const [formData, setFormData] = useState({
    name: '',
    type: 'Opening' as KeyFrame['type'],
    promptText: '',
    modelName: '',
    modelVersion: '',
    status: 'Pending' as GenerationStatus,
    parentShotId: '',
  })

  const getShotName = (id: string) => shots.find((shot) => shot.id === id)?.shotName || '-'

  const filteredItems = useMemo(() => (
    keyFrames.filter((keyFrame) => {
      const matchType = typeFilter === 'all' || keyFrame.type === typeFilter
      const matchStatus = statusFilter === 'all' || keyFrame.status === statusFilter
      const matchShot = shotFilter === 'all' || keyFrame.parentShotId === shotFilter
      const matchSearch = matchesKeyword(searchQuery, [
        keyFrame.name,
        keyFrame.promptText,
        keyFrame.modelName,
        keyFrame.modelVersion,
        getShotName(keyFrame.parentShotId),
      ])
      return matchType && matchStatus && matchShot && matchSearch
    })
  ), [keyFrames, shots, searchQuery, typeFilter, statusFilter, shotFilter])

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
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-500">管理所有首图和尾图资源</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="gap-2">
          <Plus size={16} /> 创建
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
          <Input placeholder="搜索名称、Prompt、模型或镜头..." className="pl-10" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1) }} />
        </div>
        <Select value={typeFilter} onValueChange={(value) => { setTypeFilter(value as 'all' | KeyFrame['type']); setCurrentPage(1) }}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="全部类型" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部类型</SelectItem>
            <SelectItem value="Opening">首图</SelectItem>
            <SelectItem value="Ending">尾图</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value as GenerationStatus | 'all'); setCurrentPage(1) }}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="全部状态" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部状态</SelectItem>
            <SelectItem value="Pending">进行中</SelectItem>
            <SelectItem value="Completed">已完成</SelectItem>
            <SelectItem value="Failed">失败</SelectItem>
          </SelectContent>
        </Select>
        <Select value={shotFilter} onValueChange={(value) => { setShotFilter(value); setCurrentPage(1) }}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="全部镜头" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部镜头</SelectItem>
            {shots.map((shot) => <SelectItem key={shot.id} value={shot.id}>{shot.shotName}</SelectItem>)}
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
            {paginatedItems.map((keyFrame) => (
              <tr key={keyFrame.id} className="border-b border-gray-200/50 transition-colors hover:bg-gray-100 dark:border-gray-800/50 dark:hover:bg-gray-800/30">
                <td className="table-cell font-medium text-gray-800 dark:text-gray-200">{keyFrame.name}</td>
                <td className="table-cell"><Badge variant={keyFrame.type === 'Opening' ? 'info' : 'success'}>{keyFrame.type === 'Opening' ? '首图' : '尾图'}</Badge></td>
                <td className="table-cell">{keyFrame.modelName || '-'}</td>
                <td className="table-cell">{keyFrame.modelVersion || '-'}</td>
                <td className="table-cell"><Badge variant={statusMap[keyFrame.status].variant}>{statusMap[keyFrame.status].label}</Badge></td>
                <td className="table-cell text-gray-600 dark:text-gray-500">{formatDate(keyFrame.createdAt)}</td>
                <td className="table-cell">
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={() => setViewingItem(keyFrame)} title="查看"><Eye size={14} className="text-gray-600 dark:text-gray-400" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleOpenModal(keyFrame)} title="编辑"><Edit2 size={14} /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(keyFrame.id)} title="删除"><Trash2 size={14} className="text-error" /></Button>
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
            <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value as KeyFrame['type'] })}>
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
            <Select value={formData.parentShotId || 'none'} onValueChange={(value) => setFormData({ ...formData, parentShotId: value === 'none' ? '' : value })}>
              <SelectTrigger><SelectValue placeholder="选择镜头" /></SelectTrigger>
              <SelectContent><SelectItem value="none">选择镜头</SelectItem>{shots.map((shot) => <SelectItem key={shot.id} value={shot.id}>{shot.shotName}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
      </Modal>

      <Modal title="查看首图/尾图" isOpen={Boolean(viewingItem)} onClose={() => setViewingItem(null)} width="max-w-2xl">
        {viewingItem && (
          <ReadOnlySection>
            <ReadOnlyField label="名称" value={viewingItem.name} />
            <ReadOnlyField label="类型" value={<Badge variant={viewingItem.type === 'Opening' ? 'info' : 'success'}>{viewingItem.type === 'Opening' ? '首图' : '尾图'}</Badge>} />
            <ReadOnlyField label="AI模型" value={viewingItem.modelName} />
            <ReadOnlyField label="模型版本" value={viewingItem.modelVersion} />
            <ReadOnlyField label="状态" value={<Badge variant={statusMap[viewingItem.status].variant}>{statusMap[viewingItem.status].label}</Badge>} />
            <ReadOnlyField label="关联镜头" value={getShotName(viewingItem.parentShotId)} />
            <ReadOnlyField label="创建时间" value={formatDate(viewingItem.createdAt)} />
            <ReadOnlyField label="更新时间" value={formatDate(viewingItem.updatedAt)} />
            <ReadOnlyField label="Prompt内容" value={viewingItem.promptText} span="full" />
          </ReadOnlySection>
        )}
      </Modal>
    </div>
  )
}
