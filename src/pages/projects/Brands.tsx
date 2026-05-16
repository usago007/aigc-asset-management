import { useState, useMemo } from 'react'
import { useAppStore } from '@/store/appStore'
import { formatDate } from '@/utils/date'
import Modal from '@/components/Modal'
import Pagination from '@/components/Pagination'
import { Plus, Edit2, Trash2, Search } from 'lucide-react'
import type { Brand } from '@/types'

export default function Brands() {
  const { brands, customers, addBrand, updateBrand, deleteBrand } = useAppStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Brand | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const [formData, setFormData] = useState({
    brandName: '',
    customerId: '',
    owner: '',
    notes: '',
  })

  const filteredItems = useMemo(() => {
    return brands.filter(b => b.brandName.toLowerCase().includes(searchQuery.toLowerCase()))
  }, [brands, searchQuery])

  const paginatedItems = filteredItems.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const handleOpenModal = (item?: Brand) => {
    if (item) {
      setEditingItem(item)
      setFormData({ brandName: item.brandName, customerId: item.customerId, owner: item.owner, notes: item.notes })
    } else {
      setEditingItem(null)
      setFormData({ brandName: '', customerId: '', owner: '', notes: '' })
    }
    setIsModalOpen(true)
  }

  const handleSave = () => {
    if (!formData.brandName) return
    if (editingItem) {
      updateBrand(editingItem.id, formData)
    } else {
      addBrand(formData as Omit<Brand, 'id' | 'createdAt' | 'updatedAt'>)
    }
    setIsModalOpen(false)
  }

  const handleDelete = (id: string) => {
    if (window.confirm('确定要删除吗？')) {
      deleteBrand(id)
    }
  }

  const getCustomerName = (id: string) => customers.find(c => c.id === id)?.customerName || '-'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-gray-100">品牌管理</h1>
        <button className="btn-primary flex items-center gap-2" onClick={() => handleOpenModal()}>
          <Plus size={16} /> 创建品牌
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input type="text" placeholder="搜索品牌名称..." className="input-field pl-10" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1) }} />
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="table-header">品牌名称</th>
              <th className="table-header">所属客户</th>
              <th className="table-header">负责人</th>
              <th className="table-header">备注</th>
              <th className="table-header">创建时间</th>
              <th className="table-header">操作</th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.map(brand => (
              <tr key={brand.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                <td className="table-cell font-medium text-gray-200">{brand.brandName}</td>
                <td className="table-cell">{getCustomerName(brand.customerId)}</td>
                <td className="table-cell">{brand.owner}</td>
                <td className="table-cell max-w-[200px] truncate">{brand.notes}</td>
                <td className="table-cell text-gray-500">{formatDate(brand.createdAt)}</td>
                <td className="table-cell">
                  <div className="flex items-center gap-2">
                    <button className="p-1 hover:bg-gray-700 rounded transition-colors" onClick={() => handleOpenModal(brand)}><Edit2 size={14} className="text-gray-400" /></button>
                    <button className="p-1 hover:bg-gray-700 rounded transition-colors" onClick={() => handleDelete(brand.id)}><Trash2 size={14} className="text-error" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {paginatedItems.length === 0 && <div className="py-12 text-center text-gray-500">暂无数据</div>}
      </div>

      <Pagination currentPage={currentPage} pageSize={pageSize} totalItems={filteredItems.length} onPageChange={setCurrentPage} />

      <Modal title={editingItem ? '编辑品牌' : '创建品牌'} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave}>
        <div className="space-y-4">
          <div>
            <label className="label-field">品牌名称 *</label>
            <input type="text" className="input-field" value={formData.brandName} onChange={(e) => setFormData({ ...formData, brandName: e.target.value })} placeholder="输入品牌名称" />
          </div>
          <div>
            <label className="label-field">所属客户</label>
            <select className="input-field" value={formData.customerId} onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}>
              <option value="">选择客户</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.customerName}</option>)}
            </select>
          </div>
          <div>
            <label className="label-field">负责人</label>
            <input type="text" className="input-field" value={formData.owner} onChange={(e) => setFormData({ ...formData, owner: e.target.value })} placeholder="输入负责人" />
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
