import { useMemo, useState } from 'react'
import { Eye, Plus, Edit2, Trash2 } from 'lucide-react'
import { useAppStore } from '@/store/appStore'
import { showToast } from '@/utils/toast'
import { formatDate } from '@/utils/date'
import { normalizeSearchText } from '@/utils/search'
import Modal from '@/components/Modal'
import Pagination from '@/components/Pagination'
import { ReadOnlyField, ReadOnlySection } from '@/components/ReadOnlyDetails'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import type { Customer } from '@/types'

const includesText = (value: unknown, query: string) => {
  const normalizedQuery = normalizeSearchText(query)
  if (!normalizedQuery) return true
  return normalizeSearchText(value).includes(normalizedQuery)
}

export default function Customers() {
  const { customers, roles: systemRoles, addCustomer, updateCustomer, deleteCustomer } = useAppStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [viewingItem, setViewingItem] = useState<Customer | null>(null)
  const [editingItem, setEditingItem] = useState<Customer | null>(null)
  const [filters, setFilters] = useState({
    customerName: '',
    contactPerson: '',
    roles: [] as string[],
    notes: '',
  })
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const [formData, setFormData] = useState({
    customerName: '',
    contactPerson: '',
    roles: [] as string[],
    notes: '',
  })

  const availableRoleNames = useMemo(
    () => Array.from(new Set(systemRoles.map((role) => role.roleName).filter(Boolean))),
    [systemRoles],
  )

  const filteredItems = useMemo(() => (
    customers.filter((customer) => {
      const matchName = includesText(customer.customerName, filters.customerName)
      const matchContact = includesText(customer.contactPerson, filters.contactPerson)
      const matchNotes = includesText(customer.notes, filters.notes)
      const matchRoles = filters.roles.length === 0 || customer.roles.some((role) => filters.roles.includes(role))
      return matchName && matchContact && matchNotes && matchRoles
    })
  ), [customers, filters])

  const paginatedItems = filteredItems.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const updateFilter = (key: 'customerName' | 'contactPerson' | 'notes', value: string) => {
    setFilters((current) => ({ ...current, [key]: value }))
    setCurrentPage(1)
  }

  const toggleFilterRole = (roleName: string) => {
    setFilters((current) => ({
      ...current,
      roles: current.roles.includes(roleName)
        ? current.roles.filter((item) => item !== roleName)
        : [...current.roles, roleName],
    }))
    setCurrentPage(1)
  }

  const toggleFormRole = (roleName: string) => {
    setFormData((current) => ({
      ...current,
      roles: current.roles.includes(roleName)
        ? current.roles.filter((item) => item !== roleName)
        : [...current.roles, roleName],
    }))
  }

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
    if (!formData.customerName) {
      showToast('error', '请输入客户名称')
      return
    }
    if (editingItem) {
      updateCustomer(editingItem.id, formData)
      showToast('success', '客户更新成功')
    } else {
      addCustomer(formData as Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>)
      showToast('success', '客户创建成功')
    }
    setIsModalOpen(false)
  }

  const handleDelete = (id: string) => {
    if (window.confirm('确定要删除吗？')) {
      deleteCustomer(id)
      showToast('success', '客户删除成功')
    }
  }

  const roleBadges = (roles: string[]) => (
    <div className="flex flex-wrap gap-1.5">
      {roles.length > 0 ? roles.map((role) => <Badge key={role} variant="info">{role}</Badge>) : <span className="text-gray-500">-</span>}
    </div>
  )

  const roleChecklist = (selectedRoles: string[], onToggle: (roleName: string) => void) => (
    <div className="flex flex-wrap gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900/40">
      {availableRoleNames.length > 0 ? availableRoleNames.map((roleName) => (
        <label key={roleName} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <Checkbox checked={selectedRoles.includes(roleName)} onCheckedChange={() => onToggle(roleName)} />
          <span>{roleName}</span>
        </label>
      )) : <span className="text-sm text-gray-500 dark:text-gray-400">暂无可用角色</span>}
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">客户管理</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-500">管理所有客户信息</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="gap-2">
          <Plus size={16} /> 创建客户
        </Button>
      </div>

      <div className="grid gap-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900/40 md:grid-cols-2 xl:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="customer-filter-name">客户名称</Label>
          <Input id="customer-filter-name" value={filters.customerName} onChange={(e) => updateFilter('customerName', e.target.value)} placeholder="按客户名称筛选" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="customer-filter-contact">联系人</Label>
          <Input id="customer-filter-contact" value={filters.contactPerson} onChange={(e) => updateFilter('contactPerson', e.target.value)} placeholder="按联系人筛选" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="customer-filter-notes">备注</Label>
          <Input id="customer-filter-notes" value={filters.notes} onChange={(e) => updateFilter('notes', e.target.value)} placeholder="按备注筛选" />
        </div>
        <div className="space-y-2 md:col-span-2 xl:col-span-1">
          <Label>角色</Label>
          {roleChecklist(filters.roles, toggleFilterRole)}
        </div>
      </div>

      <div className="card overflow-x-auto p-0">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800">
              <th className="table-header">客户名称</th>
              <th className="table-header">联系人</th>
              <th className="table-header">角色</th>
              <th className="table-header">备注</th>
              <th className="table-header">创建时间</th>
              <th className="table-header">操作</th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.map((customer) => (
              <tr key={customer.id} className="border-b border-gray-200/50 transition-colors hover:bg-gray-100 dark:border-gray-800/50 dark:hover:bg-gray-800/30">
                <td className="table-cell font-medium text-gray-800 dark:text-gray-200">{customer.customerName}</td>
                <td className="table-cell">{customer.contactPerson || '-'}</td>
                <td className="table-cell">{roleBadges(customer.roles)}</td>
                <td className="table-cell max-w-[200px] truncate">{customer.notes || '-'}</td>
                <td className="table-cell text-gray-500">{formatDate(customer.createdAt)}</td>
                <td className="table-cell">
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={() => setViewingItem(customer)} title="查看">
                      <Eye size={14} className="text-gray-600 dark:text-gray-400" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleOpenModal(customer)} title="编辑">
                      <Edit2 size={14} className="text-gray-600 dark:text-gray-400" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(customer.id)} title="删除">
                      <Trash2 size={14} className="text-error" />
                    </Button>
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
        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="customerName">客户名称 *</Label>
            <Input id="customerName" value={formData.customerName} onChange={(e) => setFormData({ ...formData, customerName: e.target.value })} placeholder="输入客户名称" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactPerson">联系人</Label>
            <Input id="contactPerson" value={formData.contactPerson} onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })} placeholder="输入联系人" />
          </div>
          <div className="space-y-2">
            <Label>角色</Label>
            {roleChecklist(formData.roles, toggleFormRole)}
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">备注</Label>
            <Textarea id="notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="输入备注信息" className="min-h-[80px]" />
          </div>
        </div>
      </Modal>

      <Modal title="查看客户" isOpen={Boolean(viewingItem)} onClose={() => setViewingItem(null)}>
        {viewingItem && (
          <ReadOnlySection>
            <ReadOnlyField label="客户名称" value={viewingItem.customerName} />
            <ReadOnlyField label="联系人" value={viewingItem.contactPerson} />
            <ReadOnlyField label="角色" value={roleBadges(viewingItem.roles)} />
            <ReadOnlyField label="创建时间" value={formatDate(viewingItem.createdAt)} />
            <ReadOnlyField label="更新时间" value={formatDate(viewingItem.updatedAt)} />
            <ReadOnlyField label="备注" value={viewingItem.notes} span="full" />
          </ReadOnlySection>
        )}
      </Modal>
    </div>
  )
}
