import { useState, useMemo } from 'react'
import { useAppStore } from '@/store/appStore'
import { showToast } from '@/utils/toast'
import { formatDate } from '@/utils/date'
import Modal from '@/components/Modal'
import Pagination from '@/components/Pagination'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
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
    if (!formData.brandName) {
      showToast('error', '请输入品牌名称')
      return
    }
    if (editingItem) {
      updateBrand(editingItem.id, formData)
      showToast('success', '品牌更新成功')
    } else {
      addBrand(formData as Omit<Brand, 'id' | 'createdAt' | 'updatedAt'>)
      showToast('success', '品牌创建成功')
    }
    setIsModalOpen(false)
  }

  const handleDelete = (id: string) => {
    if (window.confirm('确定要删除吗？')) {
      deleteBrand(id)
      showToast('success', '品牌删除成功')
    }
  }

  const getCustomerName = (id: string) => customers.find(c => c.id === id)?.customerName || '-'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">品牌管理</h1>
          <p className="text-sm text-gray-600 dark:text-gray-500 mt-1">管理所有品牌信息</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="gap-2">
          <Plus size={16} /> 创建品牌
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
        <Input placeholder="搜索品牌名称..." className="pl-10" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1) }} />
      </div>

      <div className="card overflow-x-auto p-0">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800">
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
              <tr key={brand.id} className="border-b border-gray-200/50 dark:border-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800/30 transition-colors">
                <td className="table-cell font-medium text-gray-800 dark:text-gray-200">{brand.brandName}</td>
                <td className="table-cell">{getCustomerName(brand.customerId)}</td>
                <td className="table-cell">{brand.owner}</td>
                <td className="table-cell max-w-[200px] truncate">{brand.notes || '-'}</td>
                <td className="table-cell text-gray-500">{formatDate(brand.createdAt)}</td>
                <td className="table-cell">
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenModal(brand)}><Edit2 size={14} className="text-gray-600 dark:text-gray-400" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(brand.id)}><Trash2 size={14} className="text-error" /></Button>
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
        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="brandName">品牌名称 *</Label>
            <Input id="brandName" value={formData.brandName} onChange={(e) => setFormData({ ...formData, brandName: e.target.value })} placeholder="输入品牌名称" />
          </div>
          <div className="space-y-2">
            <Label>所属客户</Label>
            <Select value={formData.customerId || 'none'} onValueChange={(val) => setFormData({ ...formData, customerId: val === 'none' ? '' : val })}>
              <SelectTrigger>
                <SelectValue placeholder="选择客户" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">未选择</SelectItem>
                {customers.map(c => <SelectItem key={c.id} value={c.id}>{c.customerName}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="owner">负责人</Label>
            <Input id="owner" value={formData.owner} onChange={(e) => setFormData({ ...formData, owner: e.target.value })} placeholder="输入负责人" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">备注</Label>
            <Textarea id="notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="输入备注信息" className="min-h-[80px]" />
          </div>
        </div>
      </Modal>
    </div>
  )
}
