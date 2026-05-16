import { useState, useMemo } from 'react'
import { useAppStore } from '@/store/appStore'
import { formatDate } from '@/utils/date'
import Modal from '@/components/Modal'
import Pagination from '@/components/Pagination'
import { Plus, Edit2, Trash2, Search } from 'lucide-react'
import type { Shot, GenerationStatus } from '@/types'

const statusMap: Record<GenerationStatus, { label: string; className: string }> = {
  Pending: { label: '进行中', className: 'badge-warning' },
  Completed: { label: '已完成', className: 'badge-success' },
  Failed: { label: '失败', className: 'badge-error' },
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
      setFormData({
        shotName: item.shotName,
        projectId: item.projectId,
        firstFrameId: item.firstFrameId || '',
        lastFrameId: item.lastFrameId || '',
        promptId: item.promptId,
        modelName: item.modelName,
        modelVersion: item.modelVersion,
        status: item.status,
      })
    } else {
      setEditingItem(null)
      setFormData({
        shotName: '',
        projectId: '',
        firstFrameId: '',
        lastFrameId: '',
        promptId: '',
        modelName: '',
        modelVersion: '',
        status: 'Pending',
      })
    }
    setIsModalOpen(true)
  }

  const handleSave = () => {
    if (!formData.shotName) return
    if (editingItem) {
      updateShot(editingItem.id, formData)
    } else {
      addShot(formData as Omit<Shot, 'id' | 'createdAt' | 'updatedAt'>)
    }
    setIsModalOpen(false)
  }

  const handleDelete = (id: string) => {
    if (window.confirm('确定要删除吗？')) {
      deleteShot(id)
    }
  }

  const getProjectName = (projectId: string) => {
    return projects.find(p => p.id === projectId)?.projectName || '-'
  }

  const getFrameName = (frameId: string | null) => {
    if (!frameId) return '-'
    return keyFrames.find(kf => kf.id === frameId)?.name || '-'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-gray-100">镜头管理</h1>
        <button className="btn-primary flex items-center gap-2" onClick={() => handleOpenModal()}>
          <Plus size={16} /> 创建镜头
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="搜索镜头名称..."
            className="input-field pl-10"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1) }}
          />
        </div>
        <select
          className="input-field max-w-[200px]"
          value={projectFilter}
          onChange={(e) => { setProjectFilter(e.target.value); setCurrentPage(1) }}
        >
          <option value="all">全部项目</option>
          {projects.map(p => (
            <option key={p.id} value={p.id}>{p.projectName}</option>
          ))}
        </select>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="table-header">镜头名称</th>
              <th className="table-header">所属项目</th>
              <th className="table-header">首图</th>
              <th className="table-header">尾图</th>
              <th className="table-header">AI模型</th>
              <th className="table-header">状态</th>
              <th className="table-header">创建时间</th>
              <th className="table-header">操作</th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.map(shot => (
              <tr key={shot.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                <td className="table-cell font-medium text-gray-200">{shot.shotName}</td>
                <td className="table-cell">{getProjectName(shot.projectId)}</td>
                <td className="table-cell text-xs">{getFrameName(shot.firstFrameId)}</td>
                <td className="table-cell text-xs">{getFrameName(shot.lastFrameId)}</td>
                <td className="table-cell">{shot.modelName} {shot.modelVersion}</td>
                <td className="table-cell">
                  <span className={`badge ${statusMap[shot.status].className}`}>
                    {statusMap[shot.status].label}
                  </span>
                </td>
                <td className="table-cell text-gray-500">{formatDate(shot.createdAt)}</td>
                <td className="table-cell">
                  <div className="flex items-center gap-2">
                    <button className="p-1 hover:bg-gray-700 rounded transition-colors" onClick={() => handleOpenModal(shot)}>
                      <Edit2 size={14} className="text-gray-400" />
                    </button>
                    <button className="p-1 hover:bg-gray-700 rounded transition-colors" onClick={() => handleDelete(shot.id)}>
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
        title={editingItem ? '编辑镜头' : '创建镜头'}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
      >
        <div className="space-y-4">
          <div>
            <label className="label-field">镜头名称 *</label>
            <input
              type="text"
              className="input-field"
              value={formData.shotName}
              onChange={(e) => setFormData({ ...formData, shotName: e.target.value })}
              placeholder="输入镜头名称"
            />
          </div>
          <div>
            <label className="label-field">所属项目</label>
            <select
              className="input-field"
              value={formData.projectId}
              onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
            >
              <option value="">选择项目</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.projectName}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-field">首图</label>
              <select
                className="input-field"
                value={formData.firstFrameId}
                onChange={(e) => setFormData({ ...formData, firstFrameId: e.target.value })}
              >
                <option value="">选择首图</option>
                {keyFrames.filter(kf => kf.type === 'Opening').map(kf => (
                  <option key={kf.id} value={kf.id}>{kf.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-field">尾图</label>
              <select
                className="input-field"
                value={formData.lastFrameId}
                onChange={(e) => setFormData({ ...formData, lastFrameId: e.target.value })}
              >
                <option value="">选择尾图</option>
                {keyFrames.filter(kf => kf.type === 'Ending').map(kf => (
                  <option key={kf.id} value={kf.id}>{kf.name}</option>
                ))}
              </select>
            </div>
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
        </div>
      </Modal>
    </div>
  )
}
