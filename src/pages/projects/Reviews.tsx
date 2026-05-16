import { useState, useMemo } from 'react'
import { useAppStore } from '@/store/appStore'
import { formatDate } from '@/utils/date'
import Modal from '@/components/Modal'
import Pagination from '@/components/Pagination'
import { Plus, Edit2, Trash2, Search } from 'lucide-react'
import type { Review, ReviewStatus } from '@/types'

const statusMap: Record<ReviewStatus, { label: string; className: string }> = {
  Pending: { label: '待审核', className: 'badge-warning' },
  Approved: { label: '通过', className: 'badge-success' },
  Rejected: { label: '拒绝', className: 'badge-error' },
}

export default function Reviews() {
  const { reviews, addReview, updateReview, deleteReview } = useAppStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Review | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<ReviewStatus | 'all'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const [formData, setFormData] = useState({
    targetId: '',
    targetType: 'Asset' as 'Asset' | 'Shot' | 'Brief',
    reviewer: '',
    reviewType: 'Internal' as 'Internal' | 'Client',
    status: 'Pending' as ReviewStatus,
    notes: '',
  })

  const filteredItems = useMemo(() => {
    return reviews.filter(r => {
      const matchSearch = r.reviewer.toLowerCase().includes(searchQuery.toLowerCase()) || r.notes.toLowerCase().includes(searchQuery.toLowerCase())
      const matchStatus = statusFilter === 'all' || r.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [reviews, searchQuery, statusFilter])

  const paginatedItems = filteredItems.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const handleOpenModal = (item?: Review) => {
    if (item) {
      setEditingItem(item)
      setFormData({
        targetId: item.targetId,
        targetType: item.targetType,
        reviewer: item.reviewer,
        reviewType: item.reviewType,
        status: item.status,
        notes: item.notes,
      })
    } else {
      setEditingItem(null)
      setFormData({ targetId: '', targetType: 'Asset', reviewer: '', reviewType: 'Internal', status: 'Pending', notes: '' })
    }
    setIsModalOpen(true)
  }

  const handleSave = () => {
    if (!formData.reviewer) return
    if (editingItem) {
      updateReview(editingItem.id, formData)
    } else {
      addReview(formData as Omit<Review, 'id' | 'createdAt' | 'updatedAt'>)
    }
    setIsModalOpen(false)
  }

  const handleDelete = (id: string) => {
    if (window.confirm('确定要删除吗？')) {
      deleteReview(id)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-gray-100">审核管理</h1>
        <button className="btn-primary flex items-center gap-2" onClick={() => handleOpenModal()}>
          <Plus size={16} /> 创建审核
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input type="text" placeholder="搜索审核人或评论..." className="input-field pl-10" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1) }} />
        </div>
        <select className="input-field max-w-[150px]" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value as any); setCurrentPage(1) }}>
          <option value="all">全部状态</option>
          <option value="Pending">待审核</option>
          <option value="Approved">通过</option>
          <option value="Rejected">拒绝</option>
        </select>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800">
              <th className="table-header">审核对象</th>
              <th className="table-header">审核人</th>
              <th className="table-header">审核类型</th>
              <th className="table-header">状态</th>
              <th className="table-header">评论</th>
              <th className="table-header">时间</th>
              <th className="table-header">操作</th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.map(review => (
              <tr key={review.id} className="border-b border-gray-200/50 dark:border-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800/30 transition-colors">
                <td className="table-cell">
                  <span className="badge badge-info">{review.targetType}</span>
                </td>
                <td className="table-cell">{review.reviewer}</td>
                <td className="table-cell">{review.reviewType === 'Internal' ? '内部审核' : '客户审核'}</td>
                <td className="table-cell">
                  <span className={`badge ${statusMap[review.status].className}`}>{statusMap[review.status].label}</span>
                </td>
                <td className="table-cell max-w-[200px] truncate">{review.notes}</td>
                <td className="table-cell text-gray-500">{formatDate(review.createdAt)}</td>
                <td className="table-cell">
                  <div className="flex items-center gap-2">
                    <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors" onClick={() => handleOpenModal(review)}><Edit2 size={14} className="text-gray-600 dark:text-gray-400" /></button>
                    <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors" onClick={() => handleDelete(review.id)}><Trash2 size={14} className="text-error" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {paginatedItems.length === 0 && <div className="py-12 text-center text-gray-500">暂无数据</div>}
      </div>

      <Pagination currentPage={currentPage} pageSize={pageSize} totalItems={filteredItems.length} onPageChange={setCurrentPage} />

      <Modal title={editingItem ? '编辑审核' : '创建审核'} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-field">审核对象类型</label>
              <select className="input-field" value={formData.targetType} onChange={(e) => setFormData({ ...formData, targetType: e.target.value as any })}>
                <option value="Asset">资产</option>
                <option value="Shot">镜头</option>
                <option value="Brief">简报</option>
              </select>
            </div>
            <div>
              <label className="label-field">审核对象ID</label>
              <input type="text" className="input-field" value={formData.targetId} onChange={(e) => setFormData({ ...formData, targetId: e.target.value })} placeholder="输入对象ID" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-field">审核人</label>
              <input type="text" className="input-field" value={formData.reviewer} onChange={(e) => setFormData({ ...formData, reviewer: e.target.value })} placeholder="输入审核人" />
            </div>
            <div>
              <label className="label-field">审核类型</label>
              <select className="input-field" value={formData.reviewType} onChange={(e) => setFormData({ ...formData, reviewType: e.target.value as any })}>
                <option value="Internal">内部审核</option>
                <option value="Client">客户审核</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label-field">状态</label>
            <select className="input-field" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}>
              <option value="Pending">待审核</option>
              <option value="Approved">通过</option>
              <option value="Rejected">拒绝</option>
            </select>
          </div>
          <div>
            <label className="label-field">评论</label>
            <textarea className="input-field min-h-[80px]" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="输入审核评论" />
          </div>
        </div>
      </Modal>
    </div>
  )
}
