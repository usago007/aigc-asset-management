import { useState, useMemo } from 'react'
import { useAppStore } from '@/store/appStore'
import { formatDate } from '@/utils/date'
import Modal from '@/components/Modal'
import Pagination from '@/components/Pagination'
import { Plus, Edit2, Trash2, Search } from 'lucide-react'
import type { Customer } from '@/types'

export default function Customers() {
  const { customers, addCustomer, updateCustomer, deleteCustomer } = useAppStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Customer | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const [formData, setFormData] = useState({
    customerName: '',
    contactPerson: '',
    roles: [] as string[],
    notes: '',
  })

  const filteredItems = useMemo(() => {
    return customers.filter(c =>
      c.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.contactPerson.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [customers, searchQuery])

  const paginatedItems = filteredItems.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const handleOpenModal = (item?: Customer) => {
    if (item) {
      setEditingItem(item)
      setFormData({
        customerName: item.customerName,
        contactPerson: item.contactPerson,
        roles: [...item.roles],
        notes: item.notes,
      })
    } else {
      setEditingItem(null)
      setFormData({ customerName: '', contactPerson: '', roles: [], notes: '' })
    }
    setIsModalOpen(true)
  }

  const handleSave = () => {
    if (!formData.customerName) return
    if (editingItem) {
      updateCustomer(editingItem.id, formData)
    } else {
      addCustomer(formData as Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>)
    }
    setIsModalOpen(false)
  }

  const handleDelete = (id: string) => {
    if (window.confirm('确定要删除吗？')) {
      deleteCustomer(id)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-gray-100">客户管理</h1>
        <button className="btn-primary flex items-center gap-2" onClick={() => handleOpenModal()}>
          <Plus size={16} /> 创建客户
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          placeholder="搜索客户名称或联系人..."
          className="input-field pl-10"
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1) }}
        />
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="table-header">客户名称</th>
              <th className="table-header">联系人</th>
              <th className="table-header">角色</th>
              <th className="table-header">备注</th>
              <th className="table-header">创建时间</th>
              <th className="table-header">操作</th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.map(customer => (
              <tr key={customer.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                <td className="table-cell font-medium text-gray-200">{customer.customerName}</td>
                <td className="table-cell">{customer.contactPerson}</td>
                <td className="table-cell">
                  <div className="flex gap-1 flex-wrap">
                    {customer.roles.map((role, i) => (
                      <span key={i} className="badge badge-info">{role}</span>
                    ))}
                  </div>
                </td>
                <td className="table-cell max-w-[200px] truncate">{customer.notes}</td>
                <td className="table-cell text-gray-500">{formatDate(customer.createdAt)}</td>
                <td className="table-cell">
                  <div className="flex items-center gap-2">
                    <button className="p-1 hover:bg-gray-700 rounded transition-colors" onClick={() => handleOpenModal(customer)}>
                      <Edit2 size={14} className="text-gray-400" />
                    </button>
                    <button className="p-1 hover:bg-gray-700 rounded transition-colors" onClick={() => handleDelete(customer.id)}>
                      <Trash2 size={14} className="text-error" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {paginatedItems.length === 0 && <div className="py-12 text-center text-gray-500">暂无数据</div>}
      </div>

      <Pagination currentPage={currentPage} pageSize={pageSize} totalItems={filteredItems.length} onPageChange={setCurrentPage} />

      <Modal title={editingItem ? '编辑客户' : '创建客户'} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave}>
        <div className="space-y-4">
          <div>
            <label className="label-field">客户名称 *</label>
            <input type="text" className="input-field" value={formData.customerName} onChange={(e) => setFormData({ ...formData, customerName: e.target.value })} placeholder="输入客户名称" />
          </div>
          <div>
            <label className="label-field">联系人</label>
            <input type="text" className="input-field" value={formData.contactPerson} onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })} placeholder="输入联系人" />
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
