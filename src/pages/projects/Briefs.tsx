import { useState, useMemo } from 'react'
import { useAppStore } from '@/store/appStore'
import { formatDate } from '@/utils/date'
import Modal from '@/components/Modal'
import Pagination from '@/components/Pagination'
import { Plus, Edit2, Trash2, Search } from 'lucide-react'
import type { Brief } from '@/types'

export default function Briefs() {
  const { briefs, projects, addBrief, updateBrief, deleteBrief } = useAppStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Brief | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const [formData, setFormData] = useState({
    briefTitle: '',
    projectId: '',
    description: '',
    targetAudience: '',
    platform: '',
    deadline: '',
    fileUrl: '',
    currentVersionId: '',
  })

  const filteredItems = useMemo(() => {
    return briefs.filter(b => b.briefTitle.toLowerCase().includes(searchQuery.toLowerCase()))
  }, [briefs, searchQuery])

  const paginatedItems = filteredItems.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const handleOpenModal = (item?: Brief) => {
    if (item) {
      setEditingItem(item)
      setFormData({
        briefTitle: item.briefTitle,
        projectId: item.projectId,
        description: item.description,
        targetAudience: item.targetAudience,
        platform: item.platform,
        deadline: item.deadline.split('T')[0],
        fileUrl: item.fileUrl,
        currentVersionId: item.currentVersionId || '',
      })
    } else {
      setEditingItem(null)
      setFormData({ briefTitle: '', projectId: '', description: '', targetAudience: '', platform: '', deadline: '', fileUrl: '', currentVersionId: '' })
    }
    setIsModalOpen(true)
  }

  const handleSave = () => {
    if (!formData.briefTitle) return
    if (editingItem) {
      updateBrief(editingItem.id, { ...formData, deadline: formData.deadline ? new Date(formData.deadline).toISOString() : '' })
    } else {
      addBrief({ ...formData, deadline: formData.deadline ? new Date(formData.deadline).toISOString() : '' } as Omit<Brief, 'id' | 'createdAt' | 'updatedAt'>)
    }
    setIsModalOpen(false)
  }

  const handleDelete = (id: string) => {
    if (window.confirm('确定要删除吗？')) {
      deleteBrief(id)
    }
  }

  const getProjectName = (id: string) => projects.find(p => p.id === id)?.projectName || '-'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-gray-100">简报管理</h1>
        <button className="btn-primary flex items-center gap-2" onClick={() => handleOpenModal()}>
          <Plus size={16} /> 创建简报
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input type="text" placeholder="搜索简报标题..." className="input-field pl-10" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1) }} />
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800">
              <th className="table-header">简报标题</th>
              <th className="table-header">所属项目</th>
              <th className="table-header">目标受众</th>
              <th className="table-header">交付平台</th>
              <th className="table-header">截止日期</th>
              <th className="table-header">操作</th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.map(brief => (
              <tr key={brief.id} className="border-b border-gray-200/50 dark:border-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800/30 transition-colors">
                <td className="table-cell font-medium text-gray-800 dark:text-gray-200">{brief.briefTitle}</td>
                <td className="table-cell">{getProjectName(brief.projectId)}</td>
                <td className="table-cell">{brief.targetAudience}</td>
                <td className="table-cell">{brief.platform}</td>
                <td className="table-cell text-gray-500">{formatDate(brief.deadline, 'date')}</td>
                <td className="table-cell">
                  <div className="flex items-center gap-2">
                    <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors" onClick={() => handleOpenModal(brief)}><Edit2 size={14} className="text-gray-600 dark:text-gray-400" /></button>
                    <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors" onClick={() => handleDelete(brief.id)}><Trash2 size={14} className="text-error" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {paginatedItems.length === 0 && <div className="py-12 text-center text-gray-500">暂无数据</div>}
      </div>

      <Pagination currentPage={currentPage} pageSize={pageSize} totalItems={filteredItems.length} onPageChange={setCurrentPage} />

      <Modal title={editingItem ? '编辑简报' : '创建简报'} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave}>
        <div className="space-y-4">
          <div>
            <label className="label-field">简报标题 *</label>
            <input type="text" className="input-field" value={formData.briefTitle} onChange={(e) => setFormData({ ...formData, briefTitle: e.target.value })} placeholder="输入简报标题" />
          </div>
          <div>
            <label className="label-field">所属项目</label>
            <select className="input-field" value={formData.projectId} onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}>
              <option value="">选择项目</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.projectName}</option>)}
            </select>
          </div>
          <div>
            <label className="label-field">内容描述</label>
            <textarea className="input-field min-h-[80px]" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="输入内容描述" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-field">目标受众</label>
              <input type="text" className="input-field" value={formData.targetAudience} onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })} placeholder="如：18-35岁女性" />
            </div>
            <div>
              <label className="label-field">交付平台</label>
              <input type="text" className="input-field" value={formData.platform} onChange={(e) => setFormData({ ...formData, platform: e.target.value })} placeholder="如：抖音、小红书" />
            </div>
          </div>
          <div>
            <label className="label-field">截止日期</label>
            <input type="date" className="input-field" value={formData.deadline} onChange={(e) => setFormData({ ...formData, deadline: e.target.value })} />
          </div>
        </div>
      </Modal>
    </div>
  )
}
