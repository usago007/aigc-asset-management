import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, Plus, Edit2, Trash2 } from 'lucide-react'
import { useAppStore } from '@/store/appStore'
import { formatDate } from '@/utils/date'
import { showToast } from '@/utils/toast'
import { normalizeSearchText } from '@/utils/search'
import Modal from '@/components/Modal'
import Pagination from '@/components/Pagination'
import { PageIntro, PageSection, PageShell } from '@/components/PageShell'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import type { Shot } from '@/types'

const includesText = (value: unknown, query: string) => {
  const normalizedQuery = normalizeSearchText(query)
  if (!normalizedQuery) return true
  return normalizeSearchText(value).includes(normalizedQuery)
}

export default function Shots() {
  const navigate = useNavigate()
  const { shots, projects, brands, customers, keyFrames, addShot, updateShot, deleteShot } = useAppStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Shot | null>(null)
  const [filters, setFilters] = useState({
    shotName: '',
    projectId: 'all',
    firstFrameId: 'all',
    lastFrameId: 'all',
    promptId: '',
    modelName: '',
    modelVersion: '',
  })
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const [formData, setFormData] = useState({
    shotName: '',
    customerId: '',
    brandId: '',
    projectId: '',
  })

  const getProjectName = (projectId: string) => projects.find((project) => project.id === projectId)?.projectName || '-'
  const getBrandByProjectId = (projectId: string) => brands.find((brand) => brand.id === projects.find((project) => project.id === projectId)?.brandId)
  const getCustomerByBrandId = (brandId: string) => customers.find((customer) => customer.id === brands.find((brand) => brand.id === brandId)?.customerId)
  const getFrameName = (frameId: string | null) => !frameId ? '-' : keyFrames.find((keyFrame) => keyFrame.id === frameId)?.name || '-'

  const openingFrames = useMemo(() => keyFrames.filter((keyFrame) => keyFrame.type === 'Opening'), [keyFrames])
  const endingFrames = useMemo(() => keyFrames.filter((keyFrame) => keyFrame.type === 'Ending'), [keyFrames])

  const filteredItems = useMemo(() => (
    shots.filter((shot) => {
      const matchShotName = includesText(shot.shotName, filters.shotName)
      const matchProject = filters.projectId === 'all' || shot.projectId === filters.projectId
      const matchOpening = filters.firstFrameId === 'all' || (shot.firstFrameId || '') === filters.firstFrameId
      const matchEnding = filters.lastFrameId === 'all' || (shot.lastFrameId || '') === filters.lastFrameId
      const matchPrompt = includesText(shot.promptId, filters.promptId)
      const matchModel = includesText(shot.modelName, filters.modelName)
      const matchVersion = includesText(shot.modelVersion, filters.modelVersion)
      return matchShotName && matchProject && matchOpening && matchEnding && matchPrompt && matchModel && matchVersion
    })
  ), [shots, filters])

  const paginatedItems = filteredItems.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const updateFilter = (key: 'shotName' | 'promptId' | 'modelName' | 'modelVersion', value: string) => {
    setFilters((current) => ({ ...current, [key]: value }))
    setCurrentPage(1)
  }

  const handleOpenModal = (item?: Shot) => {
    if (item) {
      const brand = getBrandByProjectId(item.projectId)
      const customer = brand ? customers.find((entry) => entry.id === brand.customerId) || null : null
      setEditingItem(item)
      setFormData({
        shotName: item.shotName,
        customerId: customer?.id || '',
        brandId: brand?.id || '',
        projectId: item.projectId,
      })
    } else {
      setEditingItem(null)
      setFormData({ shotName: '', customerId: '', brandId: '', projectId: '' })
    }
    setIsModalOpen(true)
  }

  const handleSave = () => {
    if (!formData.shotName) {
      showToast('error', '请输入镜头名称')
      return
    }
    if (!formData.customerId) {
      showToast('error', '请选择所属客户')
      return
    }
    if (!formData.brandId) {
      showToast('error', '请选择所属品牌')
      return
    }
    if (!formData.projectId) {
      showToast('error', '请选择所属项目')
      return
    }

    const payload = {
      shotName: formData.shotName,
      projectId: formData.projectId,
    }

    if (editingItem) {
      updateShot(editingItem.id, payload)
      showToast('success', '更新成功')
    } else {
      addShot({
        ...payload,
        firstFrameId: null,
        lastFrameId: null,
        finalVideoTaskId: null,
        promptId: '',
        modelName: '',
        modelVersion: '',
      } as Omit<Shot, 'id' | 'createdAt' | 'updatedAt'>)
      showToast('success', '创建成功')
    }
    setIsModalOpen(false)
  }

  const handleDelete = (id: string) => {
    if (window.confirm('确定要删除吗？')) {
      deleteShot(id)
      showToast('success', '删除成功')
    }
  }

  const filteredBrands = useMemo(
    () => brands.filter((brand) => brand.customerId === formData.customerId),
    [brands, formData.customerId],
  )

  const filteredProjects = useMemo(
    () => projects.filter((project) => project.brandId === formData.brandId),
    [projects, formData.brandId],
  )

  return (
    <PageShell>
      <PageIntro
        title="镜头列表"
        actions={<Button onClick={() => handleOpenModal()} className="gap-2"><Plus size={16} /> 创建镜头</Button>}
      />

      <PageSection className="space-y-5">
        <div className="summary-grid">
          <div className="summary-card">
            <p className="summary-label">镜头总数</p>
            <p className="summary-value">{shots.length}</p>
          </div>
          <div className="summary-card">
            <p className="summary-label">已绑定首图</p>
            <p className="summary-value">{shots.filter((item) => item.firstFrameId).length}</p>
          </div>
          <div className="summary-card">
            <p className="summary-label">已绑定尾图</p>
            <p className="summary-value">{shots.filter((item) => item.lastFrameId).length}</p>
          </div>
          <div className="summary-card">
            <p className="summary-label">已选最终视频</p>
            <p className="summary-value">{shots.filter((item) => item.finalVideoTaskId).length}</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="shot-filter-name">镜头名称</Label>
          <Input id="shot-filter-name" value={filters.shotName} onChange={(e) => updateFilter('shotName', e.target.value)} placeholder="按镜头名称筛选" />
        </div>
        <div className="space-y-2">
          <Label>所属项目</Label>
          <Select value={filters.projectId} onValueChange={(value) => { setFilters((current) => ({ ...current, projectId: value })); setCurrentPage(1) }}>
            <SelectTrigger><SelectValue placeholder="全部项目" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部项目</SelectItem>
              {projects.map((project) => <SelectItem key={project.id} value={project.id}>{project.projectName}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>首图</Label>
          <Select value={filters.firstFrameId} onValueChange={(value) => { setFilters((current) => ({ ...current, firstFrameId: value })); setCurrentPage(1) }}>
            <SelectTrigger><SelectValue placeholder="全部首图" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部首图</SelectItem>
              {openingFrames.map((frame) => <SelectItem key={frame.id} value={frame.id}>{frame.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>尾图</Label>
          <Select value={filters.lastFrameId} onValueChange={(value) => { setFilters((current) => ({ ...current, lastFrameId: value })); setCurrentPage(1) }}>
            <SelectTrigger><SelectValue placeholder="全部尾图" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部尾图</SelectItem>
              {endingFrames.map((frame) => <SelectItem key={frame.id} value={frame.id}>{frame.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="shot-filter-prompt">Prompt ID</Label>
          <Input id="shot-filter-prompt" value={filters.promptId} onChange={(e) => updateFilter('promptId', e.target.value)} placeholder="按 Prompt ID 筛选" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="shot-filter-model">AI模型</Label>
          <Input id="shot-filter-model" value={filters.modelName} onChange={(e) => updateFilter('modelName', e.target.value)} placeholder="按 AI 模型筛选" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="shot-filter-version">模型版本</Label>
          <Input id="shot-filter-version" value={filters.modelVersion} onChange={(e) => updateFilter('modelVersion', e.target.value)} placeholder="按模型版本筛选" />
        </div>
        </div>

        <div className="filter-meta">
          <span>共 {filteredItems.length} 个镜头</span>
          <span>当前第 {currentPage}/{Math.max(1, Math.ceil(filteredItems.length / pageSize))} 页</span>
        </div>

        <div className="card overflow-x-auto p-0 shadow-none">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800">
              <th className="table-header">镜头名称</th>
              <th className="table-header">所属项目</th>
              <th className="table-header">AI模型</th>
              <th className="table-header">创建时间</th>
              <th className="table-header">操作</th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.map((shot) => (
              <tr key={shot.id} className="border-b border-gray-100 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-950">
                <td className="table-cell">
                  <button
                    type="button"
                    className="font-medium text-gray-900 transition-colors hover:text-black dark:text-gray-100"
                    onClick={() => navigate(`/content/shots/${shot.id}`)}
                  >
                    {shot.shotName}
                  </button>
                </td>
                <td className="table-cell">{getProjectName(shot.projectId)}</td>
                <td className="table-cell">{[shot.modelName, shot.modelVersion].filter(Boolean).join(' ') || '-'}</td>
                <td className="table-cell text-gray-600 dark:text-gray-500">{formatDate(shot.createdAt)}</td>
                <td className="table-cell">
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={() => navigate(`/content/shots/${shot.id}`)} title="查看"><Eye size={14} className="text-gray-600 dark:text-gray-400" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleOpenModal(shot)} title="编辑"><Edit2 size={14} /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(shot.id)} title="删除"><Trash2 size={14} className="text-error" /></Button>
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

      <Modal title={editingItem ? '编辑镜头' : '创建镜头'} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave}>
        <div className="space-y-5">
          <div className="space-y-2"><Label>镜头名称 *</Label><Input value={formData.shotName} onChange={(e) => setFormData({ ...formData, shotName: e.target.value })} placeholder="输入镜头名称" /></div>
          <div className="space-y-2">
            <Label>所属客户 *</Label>
            <Select
              value={formData.customerId || 'none'}
              onValueChange={(value) => setFormData({
                ...formData,
                customerId: value === 'none' ? '' : value,
                brandId: '',
                projectId: '',
              })}
            >
              <SelectTrigger><SelectValue placeholder="选择客户" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">选择客户</SelectItem>
                {customers.map((customer) => <SelectItem key={customer.id} value={customer.id}>{customer.customerName}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>所属品牌 *</Label>
            <Select
              value={formData.brandId || 'none'}
              onValueChange={(value) => setFormData({
                ...formData,
                brandId: value === 'none' ? '' : value,
                projectId: '',
              })}
              disabled={!formData.customerId}
            >
              <SelectTrigger><SelectValue placeholder="选择品牌" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">选择品牌</SelectItem>
                {filteredBrands.map((brand) => <SelectItem key={brand.id} value={brand.id}>{brand.brandName}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>所属项目 *</Label>
            <Select
              value={formData.projectId || 'none'}
              onValueChange={(value) => setFormData({ ...formData, projectId: value === 'none' ? '' : value })}
              disabled={!formData.brandId}
            >
              <SelectTrigger><SelectValue placeholder="选择项目" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">选择项目</SelectItem>
                {filteredProjects.map((project) => <SelectItem key={project.id} value={project.id}>{project.projectName}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Modal>
    </PageShell>
  )
}
