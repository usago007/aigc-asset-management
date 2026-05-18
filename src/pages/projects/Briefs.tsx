import { useMemo, useState } from 'react'
import { Eye, Plus, Edit2, Trash2 } from 'lucide-react'
import { useAppStore } from '@/store/appStore'
import { formatDate } from '@/utils/date'
import { normalizeSearchText } from '@/utils/search'
import { showToast } from '@/utils/toast'
import Modal from '@/components/Modal'
import Pagination from '@/components/Pagination'
import { ReadOnlyField, ReadOnlySection } from '@/components/ReadOnlyDetails'
import { PageIntro, PageSection, PageShell } from '@/components/PageShell'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { NativeSelect } from '@/components/ui/native-select'
import { ActionIconButton } from '@/components/ui/action-icon-button'
import type { Brief } from '@/types'

const includesText = (value: unknown, query: string) => {
  const normalizedQuery = normalizeSearchText(query)
  if (!normalizedQuery) return true
  return normalizeSearchText(value).includes(normalizedQuery)
}

export default function Briefs() {
  const { briefs, projects, addBrief, updateBrief, deleteBrief } = useAppStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [viewingItem, setViewingItem] = useState<Brief | null>(null)
  const [editingItem, setEditingItem] = useState<Brief | null>(null)
  const [filters, setFilters] = useState({
    briefTitle: '',
    projectId: 'all',
    description: '',
    targetAudience: '',
    platform: '',
    deadline: '',
    fileUrl: '',
    currentVersionId: '',
  })
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const [formData, setFormData] = useState({
    briefTitle: '',
    projectId: '',
    description: '',
    targetAudience: '',
    platform: '',
    deadline: '',
    fileUrl: '',
    currentVersionId: '',
  })

  const getProjectName = (id: string) => projects.find((project) => project.id === id)?.projectName || '-'

  const filteredItems = useMemo(() => (
    briefs.filter((brief) => {
      const matchTitle = includesText(brief.briefTitle, filters.briefTitle)
      const matchProject = filters.projectId === 'all' || brief.projectId === filters.projectId
      const matchDescription = includesText(brief.description, filters.description)
      const matchAudience = includesText(brief.targetAudience, filters.targetAudience)
      const matchPlatform = includesText(brief.platform, filters.platform)
      const matchDeadline = !filters.deadline || (brief.deadline ? brief.deadline.slice(0, 10) === filters.deadline : false)
      const matchFileUrl = includesText(brief.fileUrl, filters.fileUrl)
      const matchVersionId = includesText(brief.currentVersionId, filters.currentVersionId)
      return matchTitle && matchProject && matchDescription && matchAudience && matchPlatform && matchDeadline && matchFileUrl && matchVersionId
    })
  ), [briefs, filters])

  const paginatedItems = filteredItems.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const updateFilter = (
    key: 'briefTitle' | 'description' | 'targetAudience' | 'platform' | 'deadline' | 'fileUrl' | 'currentVersionId',
    value: string,
  ) => {
    setFilters((current) => ({ ...current, [key]: value }))
    setCurrentPage(1)
  }

  const handleOpenModal = (item?: Brief) => {
    if (item) {
      setEditingItem(item)
      setFormData({
        briefTitle: item.briefTitle,
        projectId: item.projectId,
        description: item.description,
        targetAudience: item.targetAudience,
        platform: item.platform,
        deadline: item.deadline.split('T')[0],
        fileUrl: item.fileUrl,
        currentVersionId: item.currentVersionId || '',
      })
    } else {
      setEditingItem(null)
      setFormData({ briefTitle: '', projectId: '', description: '', targetAudience: '', platform: '', deadline: '', fileUrl: '', currentVersionId: '' })
    }
    setIsModalOpen(true)
  }

  const handleSave = () => {
    if (!formData.briefTitle) {
      showToast('error', '请输入提案标题')
      return
    }
    if (editingItem) {
      updateBrief(editingItem.id, { ...formData, deadline: formData.deadline ? new Date(formData.deadline).toISOString() : '' })
      showToast('success', '提案更新成功')
    } else {
      addBrief({ ...formData, deadline: formData.deadline ? new Date(formData.deadline).toISOString() : '' } as Omit<Brief, 'id' | 'createdAt' | 'updatedAt'>)
      showToast('success', '提案创建成功')
    }
    setIsModalOpen(false)
  }

  const handleDelete = (id: string) => {
    if (window.confirm('确定要删除吗？')) {
      deleteBrief(id)
      showToast('success', '提案删除成功')
    }
  }

  return (
    <PageShell>
      <PageIntro
        eyebrow="项目中心"
        title="提案管理"
        description="统一管理项目提案、目标受众、交付平台和版本关联，保持列表页与详情页节奏一致。"
        actions={<Button onClick={() => handleOpenModal()} className="gap-2"><Plus size={16} /> 创建提案</Button>}
      />

      <PageSection className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="brief-filter-title">提案标题</Label>
          <Input id="brief-filter-title" value={filters.briefTitle} onChange={(e) => updateFilter('briefTitle', e.target.value)} placeholder="按提案标题筛选" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="brief-filter-description">内容描述</Label>
          <Input id="brief-filter-description" value={filters.description} onChange={(e) => updateFilter('description', e.target.value)} placeholder="按内容描述筛选" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="brief-filter-audience">目标受众</Label>
          <Input id="brief-filter-audience" value={filters.targetAudience} onChange={(e) => updateFilter('targetAudience', e.target.value)} placeholder="按目标受众筛选" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="brief-filter-platform">交付平台</Label>
          <Input id="brief-filter-platform" value={filters.platform} onChange={(e) => updateFilter('platform', e.target.value)} placeholder="按交付平台筛选" />
        </div>
        <div className="space-y-2">
          <Label>所属项目</Label>
          <NativeSelect value={filters.projectId} onChange={(e) => { setFilters((current) => ({ ...current, projectId: e.target.value })); setCurrentPage(1) }}>
            <option value="all">全部项目</option>
            {projects.map((project) => <option key={project.id} value={project.id}>{project.projectName}</option>)}
          </NativeSelect>
        </div>
        <div className="space-y-2">
          <Label htmlFor="brief-filter-deadline">截止日期</Label>
          <Input id="brief-filter-deadline" type="date" value={filters.deadline} onChange={(e) => updateFilter('deadline', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="brief-filter-file">文件地址</Label>
          <Input id="brief-filter-file" value={filters.fileUrl} onChange={(e) => updateFilter('fileUrl', e.target.value)} placeholder="按文件地址筛选" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="brief-filter-version">当前版本 ID</Label>
          <Input id="brief-filter-version" value={filters.currentVersionId} onChange={(e) => updateFilter('currentVersionId', e.target.value)} placeholder="按当前版本 ID 筛选" />
        </div>
      </div>

      <div className="filter-meta">
        <span>共 {filteredItems.length} 个提案</span>
        <span>当前第 {currentPage}/{Math.max(1, Math.ceil(filteredItems.length / pageSize))} 页</span>
      </div>

      <div className="card overflow-x-auto p-0 shadow-none">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800">
              <th className="table-header">提案标题</th>
              <th className="table-header">所属项目</th>
              <th className="table-header">目标受众</th>
              <th className="table-header">交付平台</th>
              <th className="table-header">截止日期</th>
              <th className="table-header">操作</th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.map((brief) => (
              <tr key={brief.id} className="border-b border-gray-100 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-950">
                <td className="table-cell font-medium text-gray-900 dark:text-gray-100">{brief.briefTitle}</td>
                <td className="table-cell">{getProjectName(brief.projectId)}</td>
                <td className="table-cell">{brief.targetAudience || '-'}</td>
                <td className="table-cell">{brief.platform || '-'}</td>
                <td className="table-cell text-gray-500">{formatDate(brief.deadline, 'date')}</td>
                <td className="table-cell">
                  <div className="flex items-center gap-2">
                    <ActionIconButton onClick={() => setViewingItem(brief)} title="查看"><Eye size={14} className="text-gray-600 dark:text-gray-400" /></ActionIconButton>
                    <ActionIconButton onClick={() => handleOpenModal(brief)} title="编辑"><Edit2 size={14} className="text-gray-600 dark:text-gray-400" /></ActionIconButton>
                    <ActionIconButton tone="danger" onClick={() => handleDelete(brief.id)} title="删除"><Trash2 size={14} /></ActionIconButton>
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

      <Modal title={editingItem ? '编辑提案' : '创建提案'} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave}>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>提案标题 *</Label>
            <Input value={formData.briefTitle} onChange={(e) => setFormData({ ...formData, briefTitle: e.target.value })} placeholder="输入提案标题" />
          </div>
          <div className="space-y-2">
            <Label>所属项目</Label>
            <NativeSelect value={formData.projectId} onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}>
              <option value="">选择项目</option>
              {projects.map((project) => <option key={project.id} value={project.id}>{project.projectName}</option>)}
            </NativeSelect>
          </div>
          <div className="space-y-2">
            <Label>内容描述</Label>
            <Textarea className="min-h-[80px]" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="输入内容描述" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>目标受众</Label>
              <Input value={formData.targetAudience} onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })} placeholder="如：18-35岁女性" />
            </div>
            <div className="space-y-2">
              <Label>交付平台</Label>
              <Input value={formData.platform} onChange={(e) => setFormData({ ...formData, platform: e.target.value })} placeholder="如：抖音、小红书" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>截止日期</Label>
            <Input type="date" value={formData.deadline} onChange={(e) => setFormData({ ...formData, deadline: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>文件地址</Label>
            <Input value={formData.fileUrl} onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })} placeholder="如：/files/brief-v2.pdf" />
          </div>
          <div className="space-y-2">
            <Label>当前版本 ID</Label>
            <Input value={formData.currentVersionId} onChange={(e) => setFormData({ ...formData, currentVersionId: e.target.value })} placeholder="输入当前版本 ID" />
          </div>
        </div>
      </Modal>

      <Modal title="查看提案" isOpen={Boolean(viewingItem)} onClose={() => setViewingItem(null)} width="max-w-2xl">
        {viewingItem && (
          <ReadOnlySection>
            <ReadOnlyField label="提案标题" value={viewingItem.briefTitle} />
            <ReadOnlyField label="所属项目" value={getProjectName(viewingItem.projectId)} />
            <ReadOnlyField label="目标受众" value={viewingItem.targetAudience} />
            <ReadOnlyField label="交付平台" value={viewingItem.platform} />
            <ReadOnlyField label="截止日期" value={formatDate(viewingItem.deadline, 'date')} />
            <ReadOnlyField label="文件地址" value={viewingItem.fileUrl} />
            <ReadOnlyField label="当前版本 ID" value={viewingItem.currentVersionId} />
            <ReadOnlyField label="创建时间" value={formatDate(viewingItem.createdAt)} />
            <ReadOnlyField label="更新时间" value={formatDate(viewingItem.updatedAt)} />
            <ReadOnlyField label="内容描述" value={viewingItem.description} span="full" />
          </ReadOnlySection>
        )}
      </Modal>
    </PageShell>
  )
}
