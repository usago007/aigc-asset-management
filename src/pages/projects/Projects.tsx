import { useState, useMemo } from 'react'
import { useAppStore } from '@/store/appStore'
import { formatDate } from '@/utils/date'
import Modal from '@/components/Modal'
import Pagination from '@/components/Pagination'
import { Plus, Edit2, Trash2, Search, Video } from 'lucide-react'
import type { Project, ProjectStage, RiskLevel } from '@/types'

const stageMap: Record<ProjectStage, { label: string; className: string }> = {
  Planning: { label: '规划中', className: 'badge-info' },
  InProduction: { label: '制作中', className: 'badge-warning' },
  Review: { label: '审核中', className: 'badge-warning' },
  Completed: { label: '已完成', className: 'badge-success' },
}

const riskMap: Record<RiskLevel, { label: string; className: string }> = {
  Low: { label: '低', className: 'badge-success' },
  Medium: { label: '中', className: 'badge-warning' },
  High: { label: '高', className: 'badge-error' },
}

export default function Projects() {
  const { projects, brands, addProject, updateProject, deleteProject } = useAppStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Project | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const [formData, setFormData] = useState({
    projectName: '',
    brandId: '',
    projectOwner: '',
    progress: 0,
    stage: 'Planning' as ProjectStage,
    riskLevel: 'Low' as RiskLevel,
    pendingReviews: 0,
  })

  const filteredItems = useMemo(() => {
    return projects.filter(p => p.projectName.toLowerCase().includes(searchQuery.toLowerCase()))
  }, [projects, searchQuery])

  const paginatedItems = filteredItems.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const handleOpenModal = (item?: Project) => {
    if (item) {
      setEditingItem(item)
      setFormData({
        projectName: item.projectName,
        brandId: item.brandId,
        projectOwner: item.projectOwner,
        progress: item.progress,
        stage: item.stage,
        riskLevel: item.riskLevel,
        pendingReviews: item.pendingReviews,
      })
    } else {
      setEditingItem(null)
      setFormData({ projectName: '', brandId: '', projectOwner: '', progress: 0, stage: 'Planning', riskLevel: 'Low', pendingReviews: 0 })
    }
    setIsModalOpen(true)
  }

  const handleSave = () => {
    if (!formData.projectName) return
    if (editingItem) {
      updateProject(editingItem.id, formData)
    } else {
      addProject(formData as Omit<Project, 'id' | 'createdAt' | 'updatedAt'>)
    }
    setIsModalOpen(false)
  }

  const handleDelete = (id: string) => {
    if (window.confirm('确定要删除吗？')) {
      deleteProject(id)
    }
  }

  const getBrandName = (id: string) => brands.find(b => b.id === id)?.brandName || '-'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-gray-100">项目列表</h1>
        <button className="btn-primary flex items-center gap-2" onClick={() => handleOpenModal()}>
          <Plus size={16} /> 创建项目
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input type="text" placeholder="搜索项目名称..." className="input-field pl-10" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1) }} />
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="table-header">项目名称</th>
              <th className="table-header">品牌</th>
              <th className="table-header">负责人</th>
              <th className="table-header">进度</th>
              <th className="table-header">阶段</th>
              <th className="table-header">风险</th>
              <th className="table-header">待审核</th>
              <th className="table-header">操作</th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.map(project => (
              <tr key={project.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                <td className="table-cell">
                  <div className="flex items-center gap-2">
                    <Video size={14} className="text-accent-500" />
                    <span className="font-medium text-gray-200">{project.projectName}</span>
                  </div>
                </td>
                <td className="table-cell">{getBrandName(project.brandId)}</td>
                <td className="table-cell">{project.projectOwner}</td>
                <td className="table-cell">
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-accent-500 rounded-full transition-all duration-300" style={{ width: `${project.progress}%` }} />
                    </div>
                    <span className="text-xs text-gray-500">{project.progress}%</span>
                  </div>
                </td>
                <td className="table-cell">
                  <span className={`badge ${stageMap[project.stage].className}`}>
                    {stageMap[project.stage].label}
                  </span>
                </td>
                <td className="table-cell">
                  <span className={`badge ${riskMap[project.riskLevel].className}`}>
                    {riskMap[project.riskLevel].label}
                  </span>
                </td>
                <td className="table-cell text-center">
                  {project.pendingReviews > 0 ? (
                    <span className="badge badge-warning">{project.pendingReviews}</span>
                  ) : (
                    <span className="text-gray-600">0</span>
                  )}
                </td>
                <td className="table-cell">
                  <div className="flex items-center gap-2">
                    <button className="p-1 hover:bg-gray-700 rounded transition-colors" onClick={() => handleOpenModal(project)}><Edit2 size={14} className="text-gray-400" /></button>
                    <button className="p-1 hover:bg-gray-700 rounded transition-colors" onClick={() => handleDelete(project.id)}><Trash2 size={14} className="text-error" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {paginatedItems.length === 0 && <div className="py-12 text-center text-gray-500">暂无数据</div>}
      </div>

      <Pagination currentPage={currentPage} pageSize={pageSize} totalItems={filteredItems.length} onPageChange={setCurrentPage} />

      <Modal title={editingItem ? '编辑项目' : '创建项目'} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave}>
        <div className="space-y-4">
          <div>
            <label className="label-field">项目名称 *</label>
            <input type="text" className="input-field" value={formData.projectName} onChange={(e) => setFormData({ ...formData, projectName: e.target.value })} placeholder="输入项目名称" />
          </div>
          <div>
            <label className="label-field">所属品牌</label>
            <select className="input-field" value={formData.brandId} onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}>
              <option value="">选择品牌</option>
              {brands.map(b => <option key={b.id} value={b.id}>{b.brandName}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-field">负责人</label>
              <input type="text" className="input-field" value={formData.projectOwner} onChange={(e) => setFormData({ ...formData, projectOwner: e.target.value })} placeholder="输入负责人" />
            </div>
            <div>
              <label className="label-field">进度 (%)</label>
              <input type="number" className="input-field" min="0" max="100" value={formData.progress} onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) || 0 })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-field">阶段状态</label>
              <select className="input-field" value={formData.stage} onChange={(e) => setFormData({ ...formData, stage: e.target.value as any })}>
                <option value="Planning">规划中</option>
                <option value="InProduction">制作中</option>
                <option value="Review">审核中</option>
                <option value="Completed">已完成</option>
              </select>
            </div>
            <div>
              <label className="label-field">延期风险</label>
              <select className="input-field" value={formData.riskLevel} onChange={(e) => setFormData({ ...formData, riskLevel: e.target.value as any })}>
                <option value="Low">低</option>
                <option value="Medium">中</option>
                <option value="High">高</option>
              </select>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}
