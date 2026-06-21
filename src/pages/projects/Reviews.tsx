import { useMemo, useState } from 'react'
import { Eye, Plus, Edit2, Trash2, Search } from 'lucide-react'
import { useAppStore } from '@/store/appStore'
import { formatDate } from '@/utils/date'
import { matchesKeyword } from '@/utils/search'
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
import type { Review, ReviewStatus } from '@/types'
import { useConfirm } from '@/components/ConfirmProvider'

const statusMap: Record<ReviewStatus, { label: string; className: string }> = {
  Pending: { label: '待审核', className: 'badge-warning' },
  Approved: { label: '通过', className: 'badge-success' },
  Rejected: { label: '拒绝', className: 'badge-error' },
}

const reviewTypeMap = {
  Internal: '内部审核',
  Client: '客户审核',
} as const

const targetTypeMap = {
  Asset: '资产',
  Shot: '镜头',
  Brief: '提案',
} as const

export default function Reviews() {
  const confirm = useConfirm()
  const { reviews, addReview, updateReview, deleteReview } = useAppStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [viewingItem, setViewingItem] = useState<Review | null>(null)
  const [editingItem, setEditingItem] = useState<Review | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [targetTypeFilter, setTargetTypeFilter] = useState<'all' | Review['targetType']>('all')
  const [reviewTypeFilter, setReviewTypeFilter] = useState<'all' | Review['reviewType']>('all')
  const [statusFilter, setStatusFilter] = useState<ReviewStatus | 'all'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const [formData, setFormData] = useState({
    targetId: '',
    targetType: 'Asset' as Review['targetType'],
    reviewer: '',
    reviewType: 'Internal' as Review['reviewType'],
    status: 'Pending' as ReviewStatus,
    notes: '',
  })

  const filteredItems = useMemo(() => (
    reviews.filter((review) => {
      const matchTargetType = targetTypeFilter === 'all' || review.targetType === targetTypeFilter
      const matchReviewType = reviewTypeFilter === 'all' || review.reviewType === reviewTypeFilter
      const matchStatus = statusFilter === 'all' || review.status === statusFilter
      const matchSearch = matchesKeyword(searchQuery, [
        review.targetId,
        targetTypeMap[review.targetType],
        review.reviewer,
        reviewTypeMap[review.reviewType],
        review.notes,
        formatDate(review.createdAt),
      ])
      return matchTargetType && matchReviewType && matchStatus && matchSearch
    })
  ), [reviews, searchQuery, targetTypeFilter, reviewTypeFilter, statusFilter])

  const paginatedItems = filteredItems.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const handleOpenModal = (item?: Review) => {
    if (item) {
      setEditingItem(item)
      setFormData({
        targetId: item.targetId,
        targetType: item.targetType,
        reviewer: item.reviewer,
        reviewType: item.reviewType,
        status: item.status,
        notes: item.notes,
      })
    } else {
      setEditingItem(null)
      setFormData({ targetId: '', targetType: 'Asset', reviewer: '', reviewType: 'Internal', status: 'Pending', notes: '' })
    }
    setIsModalOpen(true)
  }

  const handleSave = () => {
    if (!formData.reviewer) return
    if (editingItem) {
      updateReview(editingItem.id, formData)
    } else {
      addReview(formData as Omit<Review, 'id' | 'createdAt' | 'updatedAt'>)
    }
    setIsModalOpen(false)
  }

  const handleDelete = async (id: string) => {
    if (await confirm({ title: '删除审核记录', description: '删除后将无法恢复审核结论与评论，可能影响质量决策的追溯。', confirmLabel: '删除审核', tone: 'danger' })) {
      deleteReview(id)
    }
  }

  return (
    <PageShell>
      <PageIntro
        eyebrow="项目中心 / 质量门禁"
        title="审核管理"
        description="统一处理内部与客户审核，保留审核对象、结论和评论，形成可追溯的质量决策链。"
        actions={<Button className="gap-2" onClick={() => handleOpenModal()}><Plus size={16} /> 创建审核</Button>}
      />

      <PageSection className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="relative xl:col-span-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <Input
            placeholder="搜索对象 ID、审核人或评论..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
          />
        </div>
        <div>
          <NativeSelect
            value={targetTypeFilter}
            onChange={(e) => {
              setTargetTypeFilter(e.target.value as 'all' | Review['targetType'])
              setCurrentPage(1)
            }}
          >
            <option value="all">全部对象</option>
            <option value="Asset">资产</option>
            <option value="Shot">镜头</option>
            <option value="Brief">提案</option>
          </NativeSelect>
        </div>
        <div>
          <NativeSelect
            value={reviewTypeFilter}
            onChange={(e) => {
              setReviewTypeFilter(e.target.value as 'all' | Review['reviewType'])
              setCurrentPage(1)
            }}
          >
            <option value="all">全部审核类型</option>
            <option value="Internal">内部审核</option>
            <option value="Client">客户审核</option>
          </NativeSelect>
        </div>
        <div>
          <NativeSelect
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as ReviewStatus | 'all')
              setCurrentPage(1)
            }}
          >
            <option value="all">全部状态</option>
            <option value="Pending">待审核</option>
            <option value="Approved">通过</option>
            <option value="Rejected">拒绝</option>
          </NativeSelect>
        </div>
      </div>

      <div className="filter-meta">
        <span>共 {filteredItems.length} 条审核记录</span>
        <span>当前第 {currentPage}/{Math.max(1, Math.ceil(filteredItems.length / pageSize))} 页</span>
      </div>

      <div className="card overflow-x-auto p-0 shadow-none">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800">
              <th className="table-header">审核对象</th>
              <th className="table-header">审核人</th>
              <th className="table-header">审核类型</th>
              <th className="table-header">状态</th>
              <th className="table-header">评论</th>
              <th className="table-header">时间</th>
              <th className="table-header">操作</th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.map((review) => (
              <tr key={review.id} className="border-b border-gray-100 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-950">
                <td className="table-cell"><span className="badge badge-info">{targetTypeMap[review.targetType]}</span></td>
                <td className="table-cell">{review.reviewer}</td>
                <td className="table-cell">{reviewTypeMap[review.reviewType]}</td>
                <td className="table-cell"><span className={`badge ${statusMap[review.status].className}`}>{statusMap[review.status].label}</span></td>
                <td className="table-cell max-w-[200px] truncate">{review.notes || '-'}</td>
                <td className="table-cell text-gray-500">{formatDate(review.createdAt)}</td>
                <td className="table-cell">
                  <div className="flex items-center gap-2">
                    <ActionIconButton onClick={() => setViewingItem(review)} title="查看"><Eye size={14} className="text-gray-600 dark:text-gray-400" /></ActionIconButton>
                    <ActionIconButton onClick={() => handleOpenModal(review)} title="编辑"><Edit2 size={14} className="text-gray-600 dark:text-gray-400" /></ActionIconButton>
                    <ActionIconButton tone="danger" onClick={() => handleDelete(review.id)} title="删除"><Trash2 size={14} /></ActionIconButton>
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

      <Modal title={editingItem ? '编辑审核' : '创建审核'} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>审核对象类型</Label>
              <NativeSelect value={formData.targetType} onChange={(e) => setFormData({ ...formData, targetType: e.target.value as Review['targetType'] })}>
                <option value="Asset">资产</option>
                <option value="Shot">镜头</option>
                <option value="Brief">提案</option>
              </NativeSelect>
            </div>
            <div className="space-y-2">
              <Label>审核对象ID</Label>
              <Input value={formData.targetId} onChange={(e) => setFormData({ ...formData, targetId: e.target.value })} placeholder="输入对象ID" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>审核人</Label>
              <Input value={formData.reviewer} onChange={(e) => setFormData({ ...formData, reviewer: e.target.value })} placeholder="输入审核人" />
            </div>
            <div className="space-y-2">
              <Label>审核类型</Label>
              <NativeSelect value={formData.reviewType} onChange={(e) => setFormData({ ...formData, reviewType: e.target.value as Review['reviewType'] })}>
                <option value="Internal">内部审核</option>
                <option value="Client">客户审核</option>
              </NativeSelect>
            </div>
          </div>
          <div className="space-y-2">
            <Label>状态</Label>
            <NativeSelect value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as ReviewStatus })}>
              <option value="Pending">待审核</option>
              <option value="Approved">通过</option>
              <option value="Rejected">拒绝</option>
            </NativeSelect>
          </div>
          <div className="space-y-2">
            <Label>评论</Label>
            <Textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="输入审核评论" />
          </div>
        </div>
      </Modal>

      <Modal title="查看审核" isOpen={Boolean(viewingItem)} onClose={() => setViewingItem(null)} width="max-w-2xl">
        {viewingItem && (
          <ReadOnlySection>
            <ReadOnlyField label="审核对象类型" value={<span className="badge badge-info">{targetTypeMap[viewingItem.targetType]}</span>} />
            <ReadOnlyField label="审核对象 ID" value={viewingItem.targetId} />
            <ReadOnlyField label="审核人" value={viewingItem.reviewer} />
            <ReadOnlyField label="审核类型" value={reviewTypeMap[viewingItem.reviewType]} />
            <ReadOnlyField label="状态" value={<span className={`badge ${statusMap[viewingItem.status].className}`}>{statusMap[viewingItem.status].label}</span>} />
            <ReadOnlyField label="创建时间" value={formatDate(viewingItem.createdAt)} />
            <ReadOnlyField label="更新时间" value={formatDate(viewingItem.updatedAt)} />
            <ReadOnlyField label="评论" value={viewingItem.notes} span="full" />
          </ReadOnlySection>
        )}
      </Modal>
    </PageShell>
  )
}
