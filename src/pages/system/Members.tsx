import { useMemo, useState } from 'react'
import { Users, UserPlus, Search, Edit, Trash2, Power, Eye } from 'lucide-react'
import { useAppStore } from '@/store/appStore'
import Modal from '@/components/Modal'
import Pagination from '@/components/Pagination'
import { ReadOnlyField, ReadOnlySection } from '@/components/ReadOnlyDetails'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { NativeSelect } from '@/components/ui/native-select'
import { ActionIconButton } from '@/components/ui/action-icon-button'
import { Badge } from '@/components/ui/badge'
import { PageIntro, PageSection, PageShell } from '@/components/PageShell'
import { showToast } from '@/utils/toast'
import { matchesKeyword } from '@/utils/search'
import type { Member, MemberStatus } from '@/types'
import { AVATAR_COLOR_PALETTE } from '@/constants/brandColors'

const statusMap: Record<MemberStatus, { label: string; className: string }> = {
  active: { label: '活跃', className: 'badge-success' },
  disabled: { label: '已禁用', className: 'badge-error' },
  pending: { label: '待激活', className: 'badge-warning' },
}

const ITEMS_PER_PAGE = 10

function getAvatarColor(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i += 1) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return AVATAR_COLOR_PALETTE[Math.abs(hash) % AVATAR_COLOR_PALETTE.length]
}

function Avatar({ name }: { name: string }) {
  const color = getAvatarColor(name)
  const initials = name.slice(-2)
  return (
    <div
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
      style={{ backgroundColor: color }}
    >
      {initials}
    </div>
  )
}

function RolePill({ name }: { name: string }) {
  return <Badge variant="secondary">{name}</Badge>
}

export default function Members() {
  const { members, roles, addMember, updateMember, deleteMember, toggleMemberStatus } = useAppStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [viewingMember, setViewingMember] = useState<Member | null>(null)
  const [editingMember, setEditingMember] = useState<Member | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterRole, setFilterRole] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)

  const [formName, setFormName] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formPhone, setFormPhone] = useState('')
  const [formDepartment, setFormDepartment] = useState('')
  const [formRoleIds, setFormRoleIds] = useState<string[]>([])

  const getRoleNames = (roleIds: string[]) => roleIds.map((id) => roles.find((role) => role.id === id)?.roleName || id)

  const handleOpenModal = (member?: Member) => {
    if (member) {
      setEditingMember(member)
      setFormName(member.name)
      setFormEmail(member.email)
      setFormPhone(member.phone)
      setFormDepartment(member.department)
      setFormRoleIds([...member.roleIds])
    } else {
      setEditingMember(null)
      setFormName('')
      setFormEmail('')
      setFormPhone('')
      setFormDepartment('')
      setFormRoleIds([])
    }
    setIsModalOpen(true)
  }

  const handleSave = () => {
    if (!formName.trim()) {
      showToast('error', '请输入成员姓名')
      return
    }
    if (!formEmail.trim()) {
      showToast('error', '请输入邮箱')
      return
    }

    if (editingMember) {
      updateMember(editingMember.id, {
        name: formName.trim(),
        email: formEmail.trim(),
        phone: formPhone.trim(),
        department: formDepartment.trim(),
        roleIds: formRoleIds,
      })
    } else {
      addMember({
        name: formName.trim(),
        email: formEmail.trim(),
        phone: formPhone.trim(),
        avatarUrl: '',
        roleIds: formRoleIds,
        department: formDepartment.trim(),
        status: 'pending',
        lastLoginAt: '',
        invitedBy: 'member-1',
      })
    }

    setIsModalOpen(false)
  }

  const handleDelete = (member: Member) => {
    if (confirm(`确定要移除成员 "${member.name}" 吗？此操作不可撤销。`)) {
      deleteMember(member.id)
    }
  }

  const filteredMembers = useMemo(() => (
    members.filter((member) => {
      const roleNames = getRoleNames(member.roleIds)
      const matchRole = filterRole === 'all' || member.roleIds.includes(filterRole)
      const matchStatus = filterStatus === 'all' || member.status === filterStatus
      const matchSearch = matchesKeyword(searchQuery, [
        member.name,
        member.email,
        member.phone,
        member.department,
        member.invitedBy,
        roleNames,
        member.lastLoginAt ? new Date(member.lastLoginAt).toLocaleDateString('zh-CN') : '从未',
      ])
      return matchRole && matchStatus && matchSearch
    })
  ), [members, roles, searchQuery, filterRole, filterStatus])

  const totalPages = Math.ceil(filteredMembers.length / ITEMS_PER_PAGE)
  const paginatedMembers = filteredMembers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  return (
    <PageShell>
      <PageIntro
        eyebrow="系统管理"
        title="成员管理"
        description="统一管理系统成员、角色分配、激活状态与基本身份信息。"
        actions={(
          <Button className="gap-2" onClick={() => handleOpenModal()}>
            <UserPlus size={16} />
            邀请成员
          </Button>
        )}
      />

      <PageSection className="space-y-5">
        <div className="flex flex-wrap items-center gap-4">
          <div className="min-w-[220px] flex-1">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1) }}
                placeholder="搜索姓名、邮箱、手机、部门或角色..."
                className="pl-10"
              />
            </div>
          </div>
          <NativeSelect
            value={filterRole}
            onChange={(e) => { setFilterRole(e.target.value); setCurrentPage(1) }}
            className="w-[180px]"
            wrapperClassName="w-auto"
          >
            <option value="all">全部角色</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>{role.roleName}</option>
            ))}
          </NativeSelect>
          <NativeSelect
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1) }}
            className="w-[160px]"
            wrapperClassName="w-auto"
          >
            <option value="all">全部状态</option>
            <option value="active">活跃</option>
            <option value="disabled">已禁用</option>
            <option value="pending">待激活</option>
          </NativeSelect>
        </div>

        <div className="filter-meta">
          <span>共 {filteredMembers.length} 名成员</span>
          <span>当前第 {currentPage}/{totalPages || 1} 页</span>
        </div>

        <div className="card overflow-x-auto p-0 shadow-none">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="table-header">成员</th>
                <th className="table-header">邮箱</th>
                <th className="table-header">角色</th>
                <th className="table-header">部门</th>
                <th className="table-header">状态</th>
                <th className="table-header">最后登录</th>
                <th className="table-header text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {paginatedMembers.map((member) => (
                <tr key={member.id} className="border-b border-gray-100 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-950">
                  <td className="table-cell">
                    <div className="flex items-center gap-3">
                      <Avatar name={member.name} />
                      <div className="space-y-1">
                        <p className="panel-value font-medium text-gray-900 dark:text-gray-100">{member.name}</p>
                        <p className="helper-text">{member.phone || '未填写手机号'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="max-w-[220px] truncate text-gray-600 dark:text-gray-400">{member.email}</div>
                  </td>
                  <td className="table-cell">
                    <div className="flex flex-wrap gap-1.5">
                      {getRoleNames(member.roleIds).length > 0 ? getRoleNames(member.roleIds).map((name) => (
                        <RolePill key={name} name={name} />
                      )) : <span className="text-gray-400">未分配</span>}
                    </div>
                  </td>
                  <td className="table-cell text-gray-600 dark:text-gray-400">{member.department || '-'}</td>
                  <td className="table-cell">
                    <Badge variant={member.status === 'active' ? 'success' : member.status === 'disabled' ? 'destructive' : 'warning'}>
                      {statusMap[member.status]?.label}
                    </Badge>
                  </td>
                  <td className="table-cell helper-text">
                    {member.lastLoginAt ? new Date(member.lastLoginAt).toLocaleDateString('zh-CN') : '从未'}
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center justify-end gap-1">
                      <ActionIconButton
                        onClick={() => toggleMemberStatus(member.id)}
                        title={member.status === 'active' ? '禁用' : '启用'}
                      >
                        <Power size={14} className={member.status === 'active' ? 'text-amber-500' : 'text-emerald-500'} />
                      </ActionIconButton>
                      <ActionIconButton onClick={() => setViewingMember(member)} title="查看">
                        <Eye size={14} />
                      </ActionIconButton>
                      <ActionIconButton onClick={() => handleOpenModal(member)} title="编辑">
                        <Edit size={14} />
                      </ActionIconButton>
                      <ActionIconButton tone="danger" onClick={() => handleDelete(member)} title="移除">
                        <Trash2 size={14} />
                      </ActionIconButton>
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedMembers.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-14 text-center text-gray-500 dark:text-gray-400">
                    <Users size={30} className="mx-auto mb-3 opacity-30" />
                    暂无匹配的成员
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination currentPage={currentPage} pageSize={ITEMS_PER_PAGE} totalItems={filteredMembers.length} onPageChange={setCurrentPage} />
      </PageSection>

      <Modal
        title={editingMember ? '编辑成员' : '邀请成员'}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        width="max-w-lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>姓名 *</Label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="张三"
              />
            </div>
            <div className="space-y-2">
              <Label>邮箱 *</Label>
              <Input
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="zhangsan@example.com"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>手机号</Label>
              <Input
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                placeholder="13800138000"
              />
            </div>
            <div className="space-y-2">
              <Label>部门</Label>
              <Input
                value={formDepartment}
                onChange={(e) => setFormDepartment(e.target.value)}
                placeholder="内容创作部"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>角色（可多选）</Label>
            <div className="flex flex-wrap gap-2">
              {roles.map((role) => {
                const selected = formRoleIds.includes(role.id)
                return (
                  <button
                    key={role.id}
                    type="button"
              onClick={() => {
                      if (selected) {
                        setFormRoleIds(formRoleIds.filter((id) => id !== role.id))
                      } else {
                        setFormRoleIds([...formRoleIds, role.id])
                      }
                    }}
                    className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${
                      selected
                        ? 'border-gray-950 bg-gray-100 text-gray-950 dark:border-white dark:bg-gray-800 dark:text-gray-50'
                        : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:border-gray-600'
                    }`}
                  >
                    {selected && (
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    {role.roleName}
                  </button>
                )
              })}
            </div>
          </div>
          {!editingMember && (
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950">
              <p className="body-muted">
                邀请后成员将收到激活邮件，初始状态为「待激活」
              </p>
            </div>
          )}
        </div>
      </Modal>

      <Modal title="查看成员" isOpen={Boolean(viewingMember)} onClose={() => setViewingMember(null)} width="max-w-2xl">
        {viewingMember && (
          <ReadOnlySection>
            <ReadOnlyField label="姓名" value={viewingMember.name} />
            <ReadOnlyField label="邮箱" value={viewingMember.email} />
            <ReadOnlyField label="手机号" value={viewingMember.phone} />
            <ReadOnlyField label="部门" value={viewingMember.department} />
            <ReadOnlyField label="状态" value={<Badge variant={viewingMember.status === 'active' ? 'success' : viewingMember.status === 'disabled' ? 'destructive' : 'warning'}>{statusMap[viewingMember.status]?.label}</Badge>} />
            <ReadOnlyField label="角色" value={<div className="flex flex-wrap gap-1.5">{getRoleNames(viewingMember.roleIds).map((name) => <RolePill key={name} name={name} />)}</div>} />
            <ReadOnlyField label="最后登录" value={viewingMember.lastLoginAt ? new Date(viewingMember.lastLoginAt).toLocaleString('zh-CN') : '从未'} />
            <ReadOnlyField label="加入时间" value={viewingMember.joinedAt ? new Date(viewingMember.joinedAt).toLocaleString('zh-CN') : '-'} />
            <ReadOnlyField label="邀请人" value={viewingMember.invitedBy} />
          </ReadOnlySection>
        )}
      </Modal>
    </PageShell>
  )
}
