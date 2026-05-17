import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store/appStore'
import { showToast } from '@/utils/toast'
import Modal from '@/components/Modal'
import Pagination from '@/components/Pagination'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Plus, Edit2, Trash2, Search, Video } from 'lucide-react'
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
  const { projects, brands, addProject, updateProject, deleteProject } = useAppStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Project | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const [formData, setFormData] = useState({
    projectName: '',
    brandId: '',
    projectOwner: '',
    progress: 0,
    stage: 'Planning' as ProjectStage,
    riskLevel: 'Low' as RiskLevel,
    pendingReviews: 0,
  })

  const filteredItems = useMemo(() => {
    return projects.filter(p => p.projectName.toLowerCase().includes(searchQuery.toLowerCase()))
  }, [projects, searchQuery])

  const paginatedItems = filteredItems.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const handleOpenModal = (item?: Project) => {
    if (item) {
      setEditingItem(item)
      setFormData({
        projectName: item.projectName,
        brandId: item.brandId,
        projectOwner: item.projectOwner,
        progress: item.progress,
        stage: item.stage,
        riskLevel: item.riskLevel,
        pendingReviews: item.pendingReviews,
      })
    } else {
      setEditingItem(null)
      setFormData({ projectName: '', brandId: '', projectOwner: '', progress: 0, stage: 'Planning', riskLevel: 'Low', pendingReviews: 0 })
    }
    setIsModalOpen(true)
  }

  const handleSave = () => {
    if (!formData.projectName) {
      showToast('error', '请输入项目名称')
      return
    }
    if (editingItem) {
      updateProject(editingItem.id, formData)
      showToast('success', '项目更新成功')
    } else {
      addProject(formData as Omit<Project, 'id' | 'createdAt' | 'updatedAt'>)
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

  const getBrandName = (id: string) => brands.find(b => b.id === id)?.brandName || '-'
  const goToDetail = (projectId: string) => navigate(`/projects/projects/${projectId}`)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">项目列表</h1>
          <p className="text-sm text-gray-600 dark:text-gray-500 mt-1">管理所有视频制作项目</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="gap-2">
          <Plus size={16} /> 创建项目
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
        <Input
          placeholder="搜索项目名称..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1) }}
        />
      </div>

      <div className="card overflow-x-auto p-0">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800">
              <th className="table-header">项目名称</th>
              <th className="table-header">品牌</th>
              <th className="table-header">负责人</th>
              <th className="table-header">进度</th>
              <th className="table-header">阶段</th>
              <th className="table-header">风险</th>
              <th className="table-header">待审核</th>
              <th className="table-header">操作</th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.map(project => (
              <tr
                key={project.id}
                className="border-b border-gray-200/50 dark:border-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800/30 transition-colors cursor-pointer"
                onClick={() => goToDetail(project.id)}
              >
                <td className="table-cell">
                  <div className="flex items-center gap-2">
                    <Video size={14} className="text-primary-400" />
                    <button
                      type="button"
                      className="font-medium text-gray-800 dark:text-gray-200 hover:text-primary-500 transition-colors"
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
                <td className="table-cell">{project.projectOwner}</td>
                <td className="table-cell">
                  <div className="flex items-center gap-3 min-w-[140px]">
                    <Progress value={project.progress} className="w-20" />
                    <span className="text-xs text-gray-600 dark:text-gray-400 w-8">{project.progress}%</span>
                  </div>
                </td>
                <td className="table-cell">
                  <Badge variant={stageMap[project.stage].variant}>
                    {stageMap[project.stage].label}
                  </Badge>
                </td>
                <td className="table-cell">
                  <Badge variant={riskMap[project.riskLevel].variant}>
                    {riskMap[project.riskLevel].label}
                  </Badge>
                </td>
                <td className="table-cell text-center">
                  {project.pendingReviews > 0 ? (
                    <Badge variant="warning">{project.pendingReviews}</Badge>
                  ) : (
                    <span className="text-gray-600">0</span>
                  )}
                </td>
                <td className="table-cell">
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(event) => {
                        event.stopPropagation()
                        handleOpenModal(project)
                      }}
                    >
                      <Edit2 size={14} className="text-gray-600 dark:text-gray-400" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(event) => {
                        event.stopPropagation()
                        handleDelete(project.id)
                      }}
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

      <Modal title={editingItem ? '编辑项目' : '创建项目'} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave}>
        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="projectName">项目名称 *</Label>
            <Input id="projectName" value={formData.projectName} onChange={(e) => setFormData({ ...formData, projectName: e.target.value })} placeholder="输入项目名称" />
          </div>
          <div className="space-y-2">
            <Label>所属品牌</Label>
            <Select value={formData.brandId || 'none'} onValueChange={(val) => setFormData({ ...formData, brandId: val === 'none' ? '' : val })}>
              <SelectTrigger>
                <SelectValue placeholder="选择品牌" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">未选择</SelectItem>
                {brands.map(b => <SelectItem key={b.id} value={b.id}>{b.brandName}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="projectOwner">负责人</Label>
              <Input id="projectOwner" value={formData.projectOwner} onChange={(e) => setFormData({ ...formData, projectOwner: e.target.value })} placeholder="输入负责人" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="progress">进度 (%)</Label>
              <Input id="progress" type="number" min="0" max="100" value={formData.progress} onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) || 0 })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>阶段状态</Label>
              <Select value={formData.stage} onValueChange={(val) => setFormData({ ...formData, stage: val as ProjectStage })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
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
              <Select value={formData.riskLevel} onValueChange={(val) => setFormData({ ...formData, riskLevel: val as RiskLevel })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
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
    </div>
  )
}
