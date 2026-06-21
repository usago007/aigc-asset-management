import { useMemo, useState } from 'react'
import { Eye, Plus, Edit2, Trash2, Search } from 'lucide-react'
import { useAppStore } from '@/store/appStore'
import { showToast } from '@/utils/toast'
import { formatDate } from '@/utils/date'
import { matchesKeyword } from '@/utils/search'
import Modal from '@/components/Modal'
import Pagination from '@/components/Pagination'
import { PageIntro, PageSection, PageShell } from '@/components/PageShell'
import { ReadOnlyField, ReadOnlySection } from '@/components/ReadOnlyDetails'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Task, TaskStatus } from '@/types'
import { useConfirm } from '@/components/ConfirmProvider'

const statusMap: Record<TaskStatus, { label: string; variant: 'warning' | 'info' | 'success' }> = {
  Pending: { label: '待处理', variant: 'warning' },
  InProgress: { label: '进行中', variant: 'info' },
  Completed: { label: '已完成', variant: 'success' },
}

export default function Tasks() {
  const confirm = useConfirm()
  const { tasks, projects, addTask, updateTask, deleteTask } = useAppStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [viewingItem, setViewingItem] = useState<Task | null>(null)
  const [editingItem, setEditingItem] = useState<Task | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [projectFilter, setProjectFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState<'all' | Task['type']>('all')
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const [formData, setFormData] = useState({
    taskName: '',
    projectId: '',
    assignedTo: '',
    status: 'Pending' as TaskStatus,
    type: '生成' as Task['type'],
    deadline: '',
    notes: '',
  })

  const getProjectName = (id: string) => projects.find((project) => project.id === id)?.projectName || '-'

  const filteredItems = useMemo(() => (
    tasks.filter((task) => {
      const matchProject = projectFilter === 'all' || task.projectId === projectFilter
      const matchType = typeFilter === 'all' || task.type === typeFilter
      const matchStatus = statusFilter === 'all' || task.status === statusFilter
      const matchSearch = matchesKeyword(searchQuery, [
        task.taskName,
        getProjectName(task.projectId),
        task.assignedTo,
        task.type,
        statusMap[task.status].label,
        task.notes,
        formatDate(task.deadline, 'date'),
      ])
      return matchProject && matchType && matchStatus && matchSearch
    })
  ), [tasks, projects, searchQuery, projectFilter, typeFilter, statusFilter])

  const paginatedItems = filteredItems.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const handleOpenModal = (item?: Task) => {
    if (item) {
      setEditingItem(item)
      setFormData({
        taskName: item.taskName,
        projectId: item.projectId,
        assignedTo: item.assignedTo,
        status: item.status,
        type: item.type,
        deadline: item.deadline.split('T')[0],
        notes: item.notes,
      })
    } else {
      setEditingItem(null)
      setFormData({ taskName: '', projectId: '', assignedTo: '', status: 'Pending', type: '生成', deadline: '', notes: '' })
    }
    setIsModalOpen(true)
  }

  const handleSave = () => {
    if (!formData.taskName) {
      showToast('error', '请输入任务名称')
      return
    }
    if (editingItem) {
      updateTask(editingItem.id, { ...formData, deadline: formData.deadline ? new Date(formData.deadline).toISOString() : '' })
      showToast('success', '任务更新成功')
    } else {
      addTask({ ...formData, deadline: formData.deadline ? new Date(formData.deadline).toISOString() : '' } as Omit<Task, 'id' | 'createdAt' | 'updatedAt'>)
      showToast('success', '任务创建成功')
    }
    setIsModalOpen(false)
  }

  const handleDelete = async (id: string) => {
    if (await confirm({ title: '删除任务', description: '删除后将无法恢复任务状态、负责人和截止日期记录。', confirmLabel: '删除任务', tone: 'danger' })) {
      deleteTask(id)
      showToast('success', '任务删除成功')
    }
  }

  return (
    <PageShell>
      <PageIntro
        eyebrow="项目中心 / 交付协作"
        title="任务管理"
        description="分配生成、审核和交付任务，跟踪负责人、状态与截止日期，及时发现执行阻塞。"
        actions={<Button onClick={() => handleOpenModal()} className="gap-2"><Plus size={16} /> 创建任务</Button>}
      />

      <PageSection className="space-y-5">
      <div className="summary-grid">
        <div className="summary-card">
          <p className="summary-label">任务总数</p>
          <p className="summary-value">{tasks.length}</p>
        </div>
        <div className="summary-card">
          <p className="summary-label">待处理</p>
          <p className="summary-value">{tasks.filter((item) => item.status === 'Pending').length}</p>
        </div>
        <div className="summary-card">
          <p className="summary-label">进行中</p>
          <p className="summary-value">{tasks.filter((item) => item.status === 'InProgress').length}</p>
        </div>
        <div className="summary-card">
          <p className="summary-label">已完成</p>
          <p className="summary-value">{tasks.filter((item) => item.status === 'Completed').length}</p>
        </div>
      </div>

      <div className="filter-bar">
        <div className="relative filter-search max-w-sm">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
          <Input type="text" placeholder="搜索任务名称、项目、负责人或备注..." className="pl-10" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1) }} />
        </div>
        <Select value={projectFilter} onValueChange={(value) => { setProjectFilter(value); setCurrentPage(1) }}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="全部项目" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部项目</SelectItem>
            {projects.map((project) => <SelectItem key={project.id} value={project.id}>{project.projectName}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={(value) => { setTypeFilter(value as 'all' | Task['type']); setCurrentPage(1) }}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="全部类型" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部类型</SelectItem>
            <SelectItem value="生成">生成</SelectItem>
            <SelectItem value="审核">审核</SelectItem>
            <SelectItem value="交付">交付</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value as TaskStatus | 'all'); setCurrentPage(1) }}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="全部状态" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部状态</SelectItem>
            <SelectItem value="Pending">待处理</SelectItem>
            <SelectItem value="InProgress">进行中</SelectItem>
            <SelectItem value="Completed">已完成</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="filter-meta">
        <span>共 {filteredItems.length} 个任务</span>
        <span>当前第 {currentPage}/{Math.max(1, Math.ceil(filteredItems.length / pageSize))} 页</span>
      </div>

      <div className="card overflow-x-auto p-0 shadow-none">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800">
              <th className="table-header">任务名称</th>
              <th className="table-header">所属项目</th>
              <th className="table-header">负责人</th>
              <th className="table-header">类型</th>
              <th className="table-header">状态</th>
              <th className="table-header">截止日期</th>
              <th className="table-header">操作</th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.map((task) => (
              <tr key={task.id} className="border-b border-gray-100 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-950">
                <td className="table-cell font-medium text-gray-900 dark:text-gray-100">{task.taskName}</td>
                <td className="table-cell">{getProjectName(task.projectId)}</td>
                <td className="table-cell">{task.assignedTo || '-'}</td>
                <td className="table-cell"><Badge variant="info">{task.type}</Badge></td>
                <td className="table-cell"><Badge variant={statusMap[task.status].variant}>{statusMap[task.status].label}</Badge></td>
                <td className="table-cell text-gray-500">{formatDate(task.deadline, 'date')}</td>
                <td className="table-cell">
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={() => setViewingItem(task)} title="查看"><Eye size={14} className="text-gray-600 dark:text-gray-400" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleOpenModal(task)} title="编辑"><Edit2 size={14} className="text-gray-600 dark:text-gray-400" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(task.id)} title="删除"><Trash2 size={14} className="text-error" /></Button>
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

      <Modal title={editingItem ? '编辑任务' : '创建任务'} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave}>
        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="taskName">任务名称 *</Label>
            <Input id="taskName" value={formData.taskName} onChange={(e) => setFormData({ ...formData, taskName: e.target.value })} placeholder="输入任务名称" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>所属项目</Label>
              <Select value={formData.projectId || 'none'} onValueChange={(value) => setFormData({ ...formData, projectId: value === 'none' ? '' : value })}>
                <SelectTrigger><SelectValue placeholder="选择项目" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">未选择</SelectItem>
                  {projects.map((project) => <SelectItem key={project.id} value={project.id}>{project.projectName}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="assignedTo">负责人</Label>
              <Input id="assignedTo" value={formData.assignedTo} onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })} placeholder="输入负责人" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>类型</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value as Task['type'] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="生成">生成</SelectItem>
                  <SelectItem value="审核">审核</SelectItem>
                  <SelectItem value="交付">交付</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>状态</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as TaskStatus })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">待处理</SelectItem>
                  <SelectItem value="InProgress">进行中</SelectItem>
                  <SelectItem value="Completed">已完成</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="deadline">截止日期</Label>
            <Input id="deadline" type="date" value={formData.deadline} onChange={(e) => setFormData({ ...formData, deadline: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">备注</Label>
            <Textarea id="notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="输入备注信息" className="min-h-[80px]" />
          </div>
        </div>
      </Modal>

      <Modal title="查看任务" isOpen={Boolean(viewingItem)} onClose={() => setViewingItem(null)} width="max-w-2xl">
        {viewingItem && (
          <ReadOnlySection>
            <ReadOnlyField label="任务名称" value={viewingItem.taskName} />
            <ReadOnlyField label="所属项目" value={getProjectName(viewingItem.projectId)} />
            <ReadOnlyField label="负责人" value={viewingItem.assignedTo} />
            <ReadOnlyField label="类型" value={<Badge variant="info">{viewingItem.type}</Badge>} />
            <ReadOnlyField label="状态" value={<Badge variant={statusMap[viewingItem.status].variant}>{statusMap[viewingItem.status].label}</Badge>} />
            <ReadOnlyField label="截止日期" value={formatDate(viewingItem.deadline, 'date')} />
            <ReadOnlyField label="创建时间" value={formatDate(viewingItem.createdAt)} />
            <ReadOnlyField label="更新时间" value={formatDate(viewingItem.updatedAt)} />
            <ReadOnlyField label="备注" value={viewingItem.notes} span="full" />
          </ReadOnlySection>
        )}
      </Modal>
    </PageShell>
  )
}
