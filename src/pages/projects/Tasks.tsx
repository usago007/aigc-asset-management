import { useState, useMemo } from 'react'
import { useAppStore } from '@/store/appStore'
import { formatDate } from '@/utils/date'
import Modal from '@/components/Modal'
import Pagination from '@/components/Pagination'
import { Plus, Edit2, Trash2, Search } from 'lucide-react'
import type { Task, TaskStatus } from '@/types'

const statusMap: Record<TaskStatus, { label: string; className: string }> = {
  Pending: { label: '待处理', className: 'badge-warning' },
  InProgress: { label: '进行中', className: 'badge-info' },
  Completed: { label: '已完成', className: 'badge-success' },
}

export default function Tasks() {
  const { tasks, projects, addTask, updateTask, deleteTask } = useAppStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Task | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const [formData, setFormData] = useState({
    taskName: '',
    projectId: '',
    assignedTo: '',
    status: 'Pending' as TaskStatus,
    type: '生成' as '生成' | '审核' | '交付',
    deadline: '',
    notes: '',
  })

  const filteredItems = useMemo(() => {
    return tasks.filter(t => {
      const matchSearch = t.taskName.toLowerCase().includes(searchQuery.toLowerCase())
      const matchStatus = statusFilter === 'all' || t.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [tasks, searchQuery, statusFilter])

  const paginatedItems = filteredItems.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const handleOpenModal = (item?: Task) => {
    if (item) {
      setEditingItem(item)
      setFormData({
        taskName: item.taskName,
        projectId: item.projectId,
        assignedTo: item.assignedTo,
        status: item.status,
        type: item.type,
        deadline: item.deadline.split('T')[0],
        notes: item.notes,
      })
    } else {
      setEditingItem(null)
      setFormData({ taskName: '', projectId: '', assignedTo: '', status: 'Pending', type: '生成', deadline: '', notes: '' })
    }
    setIsModalOpen(true)
  }

  const handleSave = () => {
    if (!formData.taskName) return
    if (editingItem) {
      updateTask(editingItem.id, { ...formData, deadline: formData.deadline ? new Date(formData.deadline).toISOString() : '' })
    } else {
      addTask({ ...formData, deadline: formData.deadline ? new Date(formData.deadline).toISOString() : '' } as Omit<Task, 'id' | 'createdAt' | 'updatedAt'>)
    }
    setIsModalOpen(false)
  }

  const handleDelete = (id: string) => {
    if (window.confirm('确定要删除吗？')) {
      deleteTask(id)
    }
  }

  const getProjectName = (id: string) => projects.find(p => p.id === id)?.projectName || '-'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-gray-100">任务管理</h1>
        <button className="btn-primary flex items-center gap-2" onClick={() => handleOpenModal()}>
          <Plus size={16} /> 创建任务
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input type="text" placeholder="搜索任务名称..." className="input-field pl-10" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1) }} />
        </div>
        <select className="input-field max-w-[150px]" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value as any); setCurrentPage(1) }}>
          <option value="all">全部状态</option>
          <option value="Pending">待处理</option>
          <option value="InProgress">进行中</option>
          <option value="Completed">已完成</option>
        </select>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="table-header">任务名称</th>
              <th className="table-header">所属项目</th>
              <th className="table-header">负责人</th>
              <th className="table-header">类型</th>
              <th className="table-header">状态</th>
              <th className="table-header">截止日期</th>
              <th className="table-header">操作</th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.map(task => (
              <tr key={task.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                <td className="table-cell font-medium text-gray-200">{task.taskName}</td>
                <td className="table-cell">{getProjectName(task.projectId)}</td>
                <td className="table-cell">{task.assignedTo}</td>
                <td className="table-cell">
                  <span className="badge badge-info">{task.type}</span>
                </td>
                <td className="table-cell">
                  <span className={`badge ${statusMap[task.status].className}`}>{statusMap[task.status].label}</span>
                </td>
                <td className="table-cell text-gray-500">{formatDate(task.deadline, 'date')}</td>
                <td className="table-cell">
                  <div className="flex items-center gap-2">
                    <button className="p-1 hover:bg-gray-700 rounded transition-colors" onClick={() => handleOpenModal(task)}><Edit2 size={14} className="text-gray-400" /></button>
                    <button className="p-1 hover:bg-gray-700 rounded transition-colors" onClick={() => handleDelete(task.id)}><Trash2 size={14} className="text-error" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {paginatedItems.length === 0 && <div className="py-12 text-center text-gray-500">暂无数据</div>}
      </div>

      <Pagination currentPage={currentPage} pageSize={pageSize} totalItems={filteredItems.length} onPageChange={setCurrentPage} />

      <Modal title={editingItem ? '编辑任务' : '创建任务'} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave}>
        <div className="space-y-4">
          <div>
            <label className="label-field">任务名称 *</label>
            <input type="text" className="input-field" value={formData.taskName} onChange={(e) => setFormData({ ...formData, taskName: e.target.value })} placeholder="输入任务名称" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-field">所属项目</label>
              <select className="input-field" value={formData.projectId} onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}>
                <option value="">选择项目</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.projectName}</option>)}
              </select>
            </div>
            <div>
              <label className="label-field">负责人</label>
              <input type="text" className="input-field" value={formData.assignedTo} onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })} placeholder="输入负责人" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-field">类型</label>
              <select className="input-field" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}>
                <option value="生成">生成</option>
                <option value="审核">审核</option>
                <option value="交付">交付</option>
              </select>
            </div>
            <div>
              <label className="label-field">状态</label>
              <select className="input-field" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}>
                <option value="Pending">待处理</option>
                <option value="InProgress">进行中</option>
                <option value="Completed">已完成</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label-field">截止日期</label>
            <input type="date" className="input-field" value={formData.deadline} onChange={(e) => setFormData({ ...formData, deadline: e.target.value })} />
          </div>
          <div>
            <label className="label-field">备注</label>
            <textarea className="input-field min-h-[80px]" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="输入备注信息" />
          </div>
        </div>
      </Modal>
    </div>
  )
}
