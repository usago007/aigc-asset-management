import { useState, useMemo } from 'react'
import { useAppStore } from '@/store/appStore'
import { formatDate } from '@/utils/date'
import Modal from '@/components/Modal'
import Pagination from '@/components/Pagination'
import { Plus, Edit2, Trash2, Search } from 'lucide-react'
import type { Asset, AssetStatus } from '@/types'

const statusMap: Record<AssetStatus, { label: string; className: string }> = {
  Draft: { label: '草稿', className: 'badge-info' },
  Final: { label: '终稿', className: 'badge-warning' },
  Approved: { label: '已审核', className: 'badge-success' },
}

export default function Assets() {
  const { assets, shots, addAsset, updateAsset, deleteAsset } = useAppStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Asset | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<AssetStatus | 'all'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const [formData, setFormData] = useState({
    assetName: '',
    type: 'Image' as 'Image' | 'Video' | 'Script',
    shotId: '',
    promptId: '',
    modelName: '',
    modelVersion: '',
    parentAssetIds: [] as string[],
    status: 'Draft' as AssetStatus,
    fileUrl: '',
  })

  const filteredItems = useMemo(() => {
    return assets.filter(asset => {
      const matchSearch = asset.assetName.toLowerCase().includes(searchQuery.toLowerCase())
      const matchType = typeFilter === 'all' || asset.status === typeFilter
      return matchSearch && matchType
    })
  }, [assets, searchQuery, typeFilter])

  const paginatedItems = filteredItems.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const handleOpenModal = (item?: Asset) => {
    if (item) {
      setEditingItem(item)
      setFormData({
        assetName: item.assetName,
        type: item.type,
        shotId: item.shotId,
        promptId: item.promptId,
        modelName: item.modelName,
        modelVersion: item.modelVersion,
        parentAssetIds: item.parentAssetIds,
        status: item.status,
        fileUrl: item.fileUrl,
      })
    } else {
      setEditingItem(null)
      setFormData({
        assetName: '',
        type: 'Image',
        shotId: '',
        promptId: '',
        modelName: '',
        modelVersion: '',
        parentAssetIds: [],
        status: 'Draft',
        fileUrl: '',
      })
    }
    setIsModalOpen(true)
  }

  const handleSave = () => {
    if (!formData.assetName) return
    if (editingItem) {
      updateAsset(editingItem.id, formData)
    } else {
      addAsset(formData as Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>)
    }
    setIsModalOpen(false)
  }

  const handleDelete = (id: string) => {
    if (window.confirm('确定要删除吗？')) {
      deleteAsset(id)
    }
  }

  const getShotName = (shotId: string) => {
    return shots.find(s => s.id === shotId)?.shotName || '-'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-gray-100">资产管理</h1>
        <button className="btn-primary flex items-center gap-2" onClick={() => handleOpenModal()}>
          <Plus size={16} /> 创建资产
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="搜索资产名称..."
            className="input-field pl-10"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1) }}
          />
        </div>
        <select
          className="input-field max-w-[150px]"
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value as any); setCurrentPage(1) }}
        >
          <option value="all">全部状态</option>
          <option value="Draft">草稿</option>
          <option value="Final">终稿</option>
          <option value="Approved">已审核</option>
        </select>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="table-header">资产名称</th>
              <th className="table-header">类型</th>
              <th className="table-header">所属镜头</th>
              <th className="table-header">AI模型</th>
              <th className="table-header">状态</th>
              <th className="table-header">创建时间</th>
              <th className="table-header">操作</th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.map(asset => (
              <tr key={asset.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                <td className="table-cell font-medium text-gray-200">{asset.assetName}</td>
                <td className="table-cell">
                  <span className={`badge ${
                    asset.type === 'Image' ? 'badge-info' : 
                    asset.type === 'Video' ? 'badge-success' : 'badge-warning'
                  }`}>
                    {asset.type === 'Image' ? '图片' : asset.type === 'Video' ? '视频' : '脚本'}
                  </span>
                </td>
                <td className="table-cell">{getShotName(asset.shotId)}</td>
                <td className="table-cell">{asset.modelName} {asset.modelVersion}</td>
                <td className="table-cell">
                  <span className={`badge ${statusMap[asset.status].className}`}>
                    {statusMap[asset.status].label}
                  </span>
                </td>
                <td className="table-cell text-gray-500">{formatDate(asset.createdAt)}</td>
                <td className="table-cell">
                  <div className="flex items-center gap-2">
                    <button className="p-1 hover:bg-gray-700 rounded transition-colors" onClick={() => handleOpenModal(asset)}>
                      <Edit2 size={14} className="text-gray-400" />
                    </button>
                    <button className="p-1 hover:bg-gray-700 rounded transition-colors" onClick={() => handleDelete(asset.id)}>
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
        title={editingItem ? '编辑资产' : '创建资产'}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
      >
        <div className="space-y-4">
          <div>
            <label className="label-field">资产名称 *</label>
            <input
              type="text"
              className="input-field"
              value={formData.assetName}
              onChange={(e) => setFormData({ ...formData, assetName: e.target.value })}
              placeholder="输入资产名称"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-field">类型</label>
              <select
                className="input-field"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              >
                <option value="Image">图片</option>
                <option value="Video">视频</option>
                <option value="Script">脚本</option>
              </select>
            </div>
            <div>
              <label className="label-field">状态</label>
              <select
                className="input-field"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              >
                <option value="Draft">草稿</option>
                <option value="Final">终稿</option>
                <option value="Approved">已审核</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label-field">所属镜头</label>
            <select
              className="input-field"
              value={formData.shotId}
              onChange={(e) => setFormData({ ...formData, shotId: e.target.value })}
            >
              <option value="">选择镜头</option>
              {shots.map(s => (
                <option key={s.id} value={s.id}>{s.shotName}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-field">AI模型</label>
              <input
                type="text"
                className="input-field"
                value={formData.modelName}
                onChange={(e) => setFormData({ ...formData, modelName: e.target.value })}
              />
            </div>
            <div>
              <label className="label-field">模型版本</label>
              <input
                type="text"
                className="input-field"
                value={formData.modelVersion}
                onChange={(e) => setFormData({ ...formData, modelVersion: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="label-field">文件路径/URL</label>
            <input
              type="text"
              className="input-field"
              value={formData.fileUrl}
              onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
              placeholder="如：/assets/video.mp4"
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}
