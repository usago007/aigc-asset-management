import { useMemo, useState } from 'react'
import { Eye, Plus, Edit2, Trash2 } from 'lucide-react'
import { useAppStore } from '@/store/appStore'
import { showToast } from '@/utils/toast'
import { formatDate } from '@/utils/date'
import { normalizeSearchText } from '@/utils/search'
import Modal from '@/components/Modal'
import Pagination from '@/components/Pagination'
import { PageIntro, PageSection, PageShell } from '@/components/PageShell'
import { ReadOnlyField, ReadOnlySection } from '@/components/ReadOnlyDetails'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import type { Brand } from '@/types'
import { useConfirm } from '@/components/ConfirmProvider'

const includesText = (value: unknown, query: string) => {
  const normalizedQuery = normalizeSearchText(query)
  if (!normalizedQuery) return true
  return normalizeSearchText(value).includes(normalizedQuery)
}

export default function Brands() {
  const confirm = useConfirm()
  const { brands, customers, addBrand, updateBrand, deleteBrand } = useAppStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [viewingItem, setViewingItem] = useState<Brand | null>(null)
  const [editingItem, setEditingItem] = useState<Brand | null>(null)
  const [filters, setFilters] = useState({
    brandName: '',
    customerId: 'all',
    owner: '',
    notes: '',
  })
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const [formData, setFormData] = useState({
    brandName: '',
    customerId: '',
    owner: '',
    notes: '',
  })

  const getCustomerName = (id: string) => customers.find((customer) => customer.id === id)?.customerName || '-'

  const filteredItems = useMemo(() => (
    brands.filter((brand) => {
      const matchBrandName = includesText(brand.brandName, filters.brandName)
      const matchCustomer = filters.customerId === 'all' || brand.customerId === filters.customerId
      const matchOwner = includesText(brand.owner, filters.owner)
      const matchNotes = includesText(brand.notes, filters.notes)
      return matchBrandName && matchCustomer && matchOwner && matchNotes
    })
  ), [brands, filters])

  const paginatedItems = filteredItems.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const updateFilter = (key: 'brandName' | 'owner' | 'notes', value: string) => {
    setFilters((current) => ({ ...current, [key]: value }))
    setCurrentPage(1)
  }

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

  const handleDelete = async (id: string) => {
    if (await confirm({ title: '删除品牌', description: '删除后将无法恢复该品牌记录。关联项目中的品牌引用可能失去显示信息。', confirmLabel: '删除品牌', tone: 'danger' })) {
      deleteBrand(id)
      showToast('success', '品牌删除成功')
    }
  }

  return (
    <PageShell>
      <PageIntro
        eyebrow="项目中心 / 品牌资产"
        title="品牌管理"
        description="管理客户旗下品牌、责任人及协作信息，确保创意产出始终绑定正确的品牌上下文。"
        actions={<Button onClick={() => handleOpenModal()} className="gap-2"><Plus size={16} /> 创建品牌</Button>}
      />

      <PageSection className="space-y-5">
      <div className="summary-grid">
        <div className="summary-card">
          <p className="summary-label">品牌总数</p>
          <p className="summary-value">{brands.length}</p>
        </div>
        <div className="summary-card">
          <p className="summary-label">已绑定客户</p>
          <p className="summary-value">{brands.filter((item) => item.customerId).length}</p>
        </div>
        <div className="summary-card">
          <p className="summary-label">已配置负责人</p>
          <p className="summary-value">{brands.filter((item) => item.owner).length}</p>
        </div>
        <div className="summary-card">
          <p className="summary-label">当前筛中</p>
          <p className="summary-value">{filteredItems.length}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="brand-filter-name">品牌名称</Label>
          <Input id="brand-filter-name" value={filters.brandName} onChange={(e) => updateFilter('brandName', e.target.value)} placeholder="按品牌名称筛选" />
        </div>
        <div className="space-y-2">
          <Label>所属客户</Label>
          <Select value={filters.customerId} onValueChange={(value) => { setFilters((current) => ({ ...current, customerId: value })); setCurrentPage(1) }}>
            <SelectTrigger>
              <SelectValue placeholder="全部客户" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部客户</SelectItem>
              {customers.map((customer) => <SelectItem key={customer.id} value={customer.id}>{customer.customerName}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="brand-filter-owner">负责人</Label>
          <Input id="brand-filter-owner" value={filters.owner} onChange={(e) => updateFilter('owner', e.target.value)} placeholder="按负责人筛选" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="brand-filter-notes">备注</Label>
          <Input id="brand-filter-notes" value={filters.notes} onChange={(e) => updateFilter('notes', e.target.value)} placeholder="按备注筛选" />
        </div>
      </div>

      <div className="filter-meta">
        <span>共 {filteredItems.length} 个品牌</span>
        <span>当前第 {currentPage}/{Math.max(1, Math.ceil(filteredItems.length / pageSize))} 页</span>
      </div>

      <div className="card overflow-x-auto p-0 shadow-none">
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
            {paginatedItems.map((brand) => (
              <tr key={brand.id} className="border-b border-gray-100 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-950">
                <td className="table-cell font-medium text-gray-900 dark:text-gray-100">{brand.brandName}</td>
                <td className="table-cell">{getCustomerName(brand.customerId)}</td>
                <td className="table-cell">{brand.owner || '-'}</td>
                <td className="table-cell max-w-[200px] truncate">{brand.notes || '-'}</td>
                <td className="table-cell text-gray-500">{formatDate(brand.createdAt)}</td>
                <td className="table-cell">
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={() => setViewingItem(brand)} title="查看">
                      <Eye size={14} className="text-gray-600 dark:text-gray-400" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleOpenModal(brand)} title="编辑">
                      <Edit2 size={14} className="text-gray-600 dark:text-gray-400" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(brand.id)} title="删除">
                      <Trash2 size={14} className="text-error" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {paginatedItems.length === 0 && <div className="empty-state rounded-none border-0 bg-transparent py-12">暂无数据</div>}
      </div>

      <Pagination currentPage={currentPage} pageSize={pageSize} totalItems={filteredItems.length} onPageChange={setCurrentPage} />
      </PageSection>

      <Modal title={editingItem ? '编辑品牌' : '创建品牌'} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave}>
        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="brandName">品牌名称 *</Label>
            <Input id="brandName" value={formData.brandName} onChange={(e) => setFormData({ ...formData, brandName: e.target.value })} placeholder="输入品牌名称" />
          </div>
          <div className="space-y-2">
            <Label>所属客户</Label>
            <Select value={formData.customerId || 'none'} onValueChange={(value) => setFormData({ ...formData, customerId: value === 'none' ? '' : value })}>
              <SelectTrigger>
                <SelectValue placeholder="选择客户" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">未选择</SelectItem>
                {customers.map((customer) => <SelectItem key={customer.id} value={customer.id}>{customer.customerName}</SelectItem>)}
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

      <Modal title="查看品牌" isOpen={Boolean(viewingItem)} onClose={() => setViewingItem(null)}>
        {viewingItem && (
          <ReadOnlySection>
            <ReadOnlyField label="品牌名称" value={viewingItem.brandName} />
            <ReadOnlyField label="所属客户" value={getCustomerName(viewingItem.customerId)} />
            <ReadOnlyField label="负责人" value={viewingItem.owner} />
            <ReadOnlyField label="创建时间" value={formatDate(viewingItem.createdAt)} />
            <ReadOnlyField label="更新时间" value={formatDate(viewingItem.updatedAt)} />
            <ReadOnlyField label="备注" value={viewingItem.notes} span="full" />
          </ReadOnlySection>
        )}
      </Modal>
    </PageShell>
  )
}
