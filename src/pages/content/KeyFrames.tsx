import { useState, useMemo } from 'react'
import { useAppStore } from '@/store/appStore'
import { formatDate } from '@/utils/date'
import Modal from '@/components/Modal'
import Pagination from '@/components/Pagination'
import { Plus, Edit2, Trash2, Search } from 'lucide-react'
import type { KeyFrame, GenerationStatus } from '@/types'

const statusMap: Record<GenerationStatus, { label: string; className: string }> = {
  Pending: { label: '进行中', className: 'badge-warning' },
  Completed: { label: '已完成', className: 'badge-success' },
  Failed: { label: '失败', className: 'badge-error' },
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
      setFormData({
        name: '',
        type: 'Opening',
        promptText: '',
        modelName: '',
        modelVersion: '',
        status: 'Pending',
        parentShotId: '',
      })
    }
    setIsModalOpen(true)
  }

  const handleSave = () => {
    if (!formData.name || !formData.promptText) return
    if (editingItem) {
      updateKeyFrame(editingItem.id, formData)
    } else {
      addKeyFrame(formData as Omit<KeyFrame, 'id' | 'createdAt' | 'updatedAt'>)
    }
    setIsModalOpen(false)
  }

  const handleDelete = (id: string) => {
    if (window.confirm('确定要删除吗？')) {
      deleteKeyFrame(id)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-gray-100">首图/尾图管理</h1>
        <button className="btn-primary flex items-center gap-2" onClick={() => handleOpenModal()}>
          <Plus size={16} /> 创建
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="搜索名称或Prompt..."
            className="input-field pl-10"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1) }}
          />
        </div>
        <select
          className="input-field max-w-[150px]"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value as any); setCurrentPage(1) }}
        >
          <option value="all">全部状态</option>
          <option value="Pending">进行中</option>
          <option value="Completed">已完成</option>
          <option value="Failed">失败</option>
        </select>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
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
              <tr key={kf.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                <td className="table-cell font-medium text-gray-200">{kf.name}</td>
                <td className="table-cell">
                  <span className={`badge ${kf.type === 'Opening' ? 'badge-info' : 'badge-success'}`}>
                    {kf.type === 'Opening' ? '首图' : '尾图'}
                  </span>
                </td>
                <td className="table-cell">{kf.modelName}</td>
                <td className="table-cell">{kf.modelVersion}</td>
                <td className="table-cell">
                  <span className={`badge ${statusMap[kf.status].className}`}>
                    {statusMap[kf.status].label}
                  </span>
                </td>
                <td className="table-cell text-gray-500">{formatDate(kf.createdAt)}</td>
                <td className="table-cell">
                  <div className="flex items-center gap-2">
                    <button className="p-1 hover:bg-gray-700 rounded transition-colors" onClick={() => handleOpenModal(kf)}>
                      <Edit2 size={14} className="text-gray-400" />
                    </button>
                    <button className="p-1 hover:bg-gray-700 rounded transition-colors" onClick={() => handleDelete(kf.id)}>
                      <Trash2 size={14} className="text-error" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {paginatedItems.length === 0 && (
          <div className="py-12 text-center text-gray-500">暂无数据</div>
        )}
      </div>

      <Pagination
        currentPage={currentPage}
        pageSize={pageSize}
        totalItems={filteredItems.length}
        onPageChange={setCurrentPage}
      />

      <Modal
        title={editingItem ? '编辑首图/尾图' : '创建首图/尾图'}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
      >
        <div className="space-y-4">
          <div>
            <label className="label-field">名称 *</label>
            <input
              type="text"
              className="input-field"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="输入名称"
            />
          </div>
          <div>
            <label className="label-field">类型</label>
            <select
              className="input-field"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as 'Opening' | 'Ending' })}
            >
              <option value="Opening">首图</option>
              <option value="Ending">尾图</option>
            </select>
          </div>
          <div>
            <label className="label-field">Prompt内容 *</label>
            <textarea
              className="input-field min-h-[100px]"
              value={formData.promptText}
              onChange={(e) => setFormData({ ...formData, promptText: e.target.value })}
              placeholder="输入Prompt提示词"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-field">AI模型</label>
              <input
                type="text"
                className="input-field"
                value={formData.modelName}
                onChange={(e) => setFormData({ ...formData, modelName: e.target.value })}
                placeholder="如：Midjourney"
              />
            </div>
            <div>
              <label className="label-field">模型版本</label>
              <input
                type="text"
                className="input-field"
                value={formData.modelVersion}
                onChange={(e) => setFormData({ ...formData, modelVersion: e.target.value })}
                placeholder="如：v6.0"
              />
            </div>
          </div>
          <div>
            <label className="label-field">关联镜头</label>
            <select
              className="input-field"
              value={formData.parentShotId}
              onChange={(e) => setFormData({ ...formData, parentShotId: e.target.value })}
            >
              <option value="">选择镜头</option>
              {shots.map(s => (
                <option key={s.id} value={s.id}>{s.shotName}</option>
              ))}
            </select>
          </div>
        </div>
      </Modal>
    </div>
  )
}
