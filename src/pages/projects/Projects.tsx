import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Edit2, Trash2, Search, Video } from 'lucide-react'
import { useAppStore } from '@/store/appStore'
import { showToast } from '@/utils/toast'
import { matchesKeyword } from '@/utils/search'
import { formatDate } from '@/utils/date'
import Modal from '@/components/Modal'
import Pagination from '@/components/Pagination'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PageIntro, PageSection, PageShell } from '@/components/PageShell'
import type { Project, ProjectStage, RiskLevel } from '@/types'

const stageMap: Record<ProjectStage, { label: string; variant: 'info' | 'warning' | 'success' }> = {
  Planning: { label: '规划中', variant: 'info' },
  InProduction: { label: '制作中', variant: 'warning' },
  Review: { label: '审核中', variant: 'warning' },
  Completed: { label: '已完成', variant: 'success' },
}

const riskMap: Record<RiskLevel, { label: string; variant: 'success' | 'warning' | 'destructive' }> = {
  Low: { label: '低', variant: 'success' },
  Medium: { label: '中', variant: 'warning' },
  High: { label: '高', variant: 'destructive' },
}

export default function Projects() {
  const navigate = useNavigate()
  const { projects, brands, customers, addProject, updateProject, deleteProject } = useAppStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Project | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [brandFilter, setBrandFilter] = useState('all')
  const [stageFilter, setStageFilter] = useState<'all' | ProjectStage>('all')
  const [riskFilter, setRiskFilter] = useState<'all' | RiskLevel>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const [formData, setFormData] = useState({
    projectName: '',
    customerId: '',
    brandId: '',
    projectOwner: '',
    progress: 0,
    stage: 'Planning' as ProjectStage,
    riskLevel: 'Low' as RiskLevel,
    pendingReviews: 0,
  })

  const getBrandName = (id: string) => brands.find((brand) => brand.id === id)?.brandName || '-'
  const getCustomerNameByBrandId = (brandId: string) => {
    const brand = brands.find((item) => item.id === brandId)
    return brand ? customers.find((customer) => customer.id === brand.customerId)?.customerName || '-' : '-'
  }
  const goToDetail = (projectId: string) => navigate(`/projects/projects/${projectId}`)
  const filteredBrands = useMemo(
    () => brands.filter((brand) => brand.customerId === formData.customerId),
    [brands, formData.customerId],
  )

  const filteredItems = useMemo(() => (
    projects.filter((project) => {
      const matchBrand = brandFilter === 'all' || project.brandId === brandFilter
      const matchStage = stageFilter === 'all' || project.stage === stageFilter
      const matchRisk = riskFilter === 'all' || project.riskLevel === riskFilter
      const matchSearch = matchesKeyword(searchQuery, [
        project.projectName,
        getBrandName(project.brandId),
        project.projectOwner,
        stageMap[project.stage].label,
        riskMap[project.riskLevel].label,
        formatDate(project.createdAt),
      ])
      return matchBrand && matchStage && matchRisk && matchSearch
    })
  ), [projects, searchQuery, brandFilter, stageFilter, riskFilter])

  const paginatedItems = filteredItems.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const handleOpenModal = (item?: Project) => {
    if (item) {
      const currentBrand = brands.find((brand) => brand.id === item.brandId)
      setEditingItem(item)
      setFormData({
        projectName: item.projectName,
        customerId: currentBrand?.customerId || '',
        brandId: item.brandId,
        projectOwner: item.projectOwner,
        progress: item.progress,
        stage: item.stage,
        riskLevel: item.riskLevel,
        pendingReviews: item.pendingReviews,
      })
    } else {
      setEditingItem(null)
      setFormData({ projectName: '', customerId: '', brandId: '', projectOwner: '', progress: 0, stage: 'Planning', riskLevel: 'Low', pendingReviews: 0 })
    }
    setIsModalOpen(true)
  }

  const handleSave = () => {
    if (!formData.projectName) {
      showToast('error', '请输入项目名称')
      return
    }
    if (editingItem) {
      updateProject(editingItem.id, {
        projectName: formData.projectName,
        brandId: formData.brandId,
        projectOwner: formData.projectOwner,
        progress: formData.progress,
        stage: formData.stage,
        riskLevel: formData.riskLevel,
        pendingReviews: formData.pendingReviews,
      })
      showToast('success', '项目更新成功')
    } else {
      addProject({
        projectName: formData.projectName,
        brandId: formData.brandId,
        projectOwner: formData.projectOwner,
        progress: formData.progress,
        stage: formData.stage,
        riskLevel: formData.riskLevel,
        pendingReviews: formData.pendingReviews,
      } as Omit<Project, 'id' | 'createdAt' | 'updatedAt'>)
      showToast('success', '项目创建成功')
    }
    setIsModalOpen(false)
  }

  const handleDelete = (id: string) => {
    if (window.confirm('确定要删除吗？')) {
      deleteProject(id)
      showToast('success', '项目删除成功')
    }
  }

  return (
    <PageShell>
      <PageIntro
        title="项目列表"
        actions={(
          <Button onClick={() => handleOpenModal()} className="gap-2">
            <Plus size={16} /> 创建项目
          </Button>
        )}
      />

      <PageSection className="space-y-5">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative max-w-sm flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="搜索项目名称、品牌、负责人、阶段或风险..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
            />
          </div>
          <Select value={brandFilter} onValueChange={(value) => { setBrandFilter(value); setCurrentPage(1) }}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="全部品牌" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部品牌</SelectItem>
              {brands.map((brand) => <SelectItem key={brand.id} value={brand.id}>{brand.brandName}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={stageFilter} onValueChange={(value) => { setStageFilter(value as 'all' | ProjectStage); setCurrentPage(1) }}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="全部阶段" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部阶段</SelectItem>
              <SelectItem value="Planning">规划中</SelectItem>
              <SelectItem value="InProduction">制作中</SelectItem>
              <SelectItem value="Review">审核中</SelectItem>
              <SelectItem value="Completed">已完成</SelectItem>
            </SelectContent>
          </Select>
          <Select value={riskFilter} onValueChange={(value) => { setRiskFilter(value as 'all' | RiskLevel); setCurrentPage(1) }}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="全部风险" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部风险</SelectItem>
              <SelectItem value="Low">低</SelectItem>
              <SelectItem value="Medium">中</SelectItem>
              <SelectItem value="High">高</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="card overflow-x-auto p-0 shadow-none">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="table-header">项目名称</th>
                <th className="table-header">品牌</th>
                <th className="table-header">负责人</th>
                <th className="table-header">阶段</th>
                <th className="table-header">风险</th>
                <th className="table-header">操作</th>
              </tr>
            </thead>
            <tbody>
              {paginatedItems.map((project) => (
                <tr
                  key={project.id}
                  className="cursor-pointer border-b border-gray-100 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-950"
                  onClick={() => goToDetail(project.id)}
                >
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <Video size={14} className="text-gray-400" />
                      <button
                        type="button"
                        className="font-medium text-gray-900 transition-colors hover:text-black dark:text-gray-100"
                        onClick={(event) => {
                          event.stopPropagation()
                          goToDetail(project.id)
                        }}
                      >
                        {project.projectName}
                      </button>
                    </div>
                  </td>
                  <td className="table-cell">{getBrandName(project.brandId)}</td>
                  <td className="table-cell">{project.projectOwner || '-'}</td>
                  <td className="table-cell">
                    <Badge variant={stageMap[project.stage].variant}>{stageMap[project.stage].label}</Badge>
                  </td>
                  <td className="table-cell">
                    <Badge variant={riskMap[project.riskLevel].variant}>{riskMap[project.riskLevel].label}</Badge>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={(event) => {
                          event.stopPropagation()
                          goToDetail(project.id)
                        }}
                        className="gap-2"
                        title="项目详情"
                      >
                        项目详情
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(event) => {
                          event.stopPropagation()
                          handleOpenModal(project)
                        }}
                        title="编辑"
                      >
                        <Edit2 size={14} className="text-gray-500 dark:text-gray-400" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(event) => {
                          event.stopPropagation()
                          handleDelete(project.id)
                        }}
                        title="删除"
                      >
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
      </PageSection>

      <Modal title={editingItem ? '编辑项目' : '创建项目'} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave}>
        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="projectName">项目名称 *</Label>
            <Input id="projectName" value={formData.projectName} onChange={(e) => setFormData({ ...formData, projectName: e.target.value })} placeholder="输入项目名称" />
          </div>
          <div className="space-y-2">
            <Label>所属客户</Label>
            <Select
              value={formData.customerId || 'none'}
              onValueChange={(value) => {
                const nextCustomerId = value === 'none' ? '' : value
                const nextBrandId = brands.some((brand) => brand.id === formData.brandId && brand.customerId === nextCustomerId) ? formData.brandId : ''
                setFormData({ ...formData, customerId: nextCustomerId, brandId: nextBrandId })
              }}
            >
              <SelectTrigger><SelectValue placeholder="选择品牌" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">未选择</SelectItem>
                {customers.map((customer) => <SelectItem key={customer.id} value={customer.id}>{customer.customerName}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>所属品牌</Label>
            <Select
              value={formData.brandId || 'none'}
              onValueChange={(value) => setFormData({ ...formData, brandId: value === 'none' ? '' : value })}
              disabled={!formData.customerId}
            >
              <SelectTrigger><SelectValue placeholder={formData.customerId ? '选择品牌' : '请先选择客户'} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">未选择</SelectItem>
                {filteredBrands.map((brand) => <SelectItem key={brand.id} value={brand.id}>{brand.brandName}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="projectOwner">负责人</Label>
            <Input id="projectOwner" value={formData.projectOwner} onChange={(e) => setFormData({ ...formData, projectOwner: e.target.value })} placeholder="输入负责人" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>阶段状态</Label>
              <Select value={formData.stage} onValueChange={(value) => setFormData({ ...formData, stage: value as ProjectStage })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Planning">规划中</SelectItem>
                  <SelectItem value="InProduction">制作中</SelectItem>
                  <SelectItem value="Review">审核中</SelectItem>
                  <SelectItem value="Completed">已完成</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>延期风险</Label>
              <Select value={formData.riskLevel} onValueChange={(value) => setFormData({ ...formData, riskLevel: value as RiskLevel })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">低</SelectItem>
                  <SelectItem value="Medium">中</SelectItem>
                  <SelectItem value="High">高</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </Modal>
    </PageShell>
  )
}
