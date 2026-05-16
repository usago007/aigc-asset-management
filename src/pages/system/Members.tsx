import { useState } from 'react'
import { useAppStore } from '@/store/appStore'
import { Users, UserPlus, Search, ChevronLeft, ChevronRight, Edit, Trash2, Power, Eye } from 'lucide-react'
import Modal from '@/components/Modal'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { showToast } from '@/utils/toast'
import type { Member, MemberStatus } from '@/types'

const statusMap: Record<MemberStatus, { label: string; className: string }> = {
  active: { label: '活跃', className: 'badge-success' },
  disabled: { label: '已禁用', className: 'badge-error' },
  pending: { label: '待激活', className: 'badge-warning' },
}

const AVATAR_COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#14b8a6', '#f97316', '#06b6d4']

const ITEMS_PER_PAGE = 10

function getAvatarColor(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

function Avatar({ name }: { name: string }) {
  const color = getAvatarColor(name)
  const initials = name.slice(-2)
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0"
      style={{ backgroundColor: color }}
    >
      {initials}
    </div>
  )
}

export default function Members() {
  const { members, roles, addMember, updateMember, deleteMember, toggleMemberStatus } = useAppStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
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

  const filteredMembers = members.filter(m => {
    if (filterRole !== 'all' && !m.roleIds.includes(filterRole)) return false
    if (filterStatus !== 'all' && m.status !== filterStatus) return false
    if (searchQuery && !m.name.includes(searchQuery) && !m.email.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const totalPages = Math.ceil(filteredMembers.length / ITEMS_PER_PAGE)
  const paginatedMembers = filteredMembers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const getRoleNames = (roleIds: string[]) => {
    return roleIds.map(id => {
      const role = roles.find(r => r.id === id)
      return role ? role.roleName : id
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Users size={20} className="text-primary-500" />
            成员管理
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">管理系统成员、角色分配和状态</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => handleOpenModal()}>
          <UserPlus size={16} />
          邀请成员
        </button>
      </div>

      <div className="card">
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1) }}
                placeholder="搜索姓名或邮箱..."
                className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none"
              />
            </div>
          </div>
          <select
            value={filterRole}
            onChange={(e) => { setFilterRole(e.target.value); setCurrentPage(1) }}
            className="px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 text-gray-900 dark:text-gray-100"
          >
            <option value="all">全部角色</option>
            {roles.map(r => (
              <option key={r.id} value={r.id}>{r.roleName}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1) }}
            className="px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 text-gray-900 dark:text-gray-100"
          >
            <option value="all">全部状态</option>
            <option value="active">活跃</option>
            <option value="disabled">已禁用</option>
            <option value="pending">待激活</option>
          </select>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          共 {filteredMembers.length} 名成员，当前第 {currentPage}/{totalPages || 1} 页
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-2 font-medium text-gray-500 dark:text-gray-400">成员</th>
                <th className="text-left py-3 px-2 font-medium text-gray-500 dark:text-gray-400">邮箱</th>
                <th className="text-left py-3 px-2 font-medium text-gray-500 dark:text-gray-400">角色</th>
                <th className="text-left py-3 px-2 font-medium text-gray-500 dark:text-gray-400">部门</th>
                <th className="text-left py-3 px-2 font-medium text-gray-500 dark:text-gray-400">状态</th>
                <th className="text-left py-3 px-2 font-medium text-gray-500 dark:text-gray-400">最后登录</th>
                <th className="text-right py-3 px-2 font-medium text-gray-500 dark:text-gray-400">操作</th>
              </tr>
            </thead>
            <tbody>
              {paginatedMembers.map(member => (
                <tr key={member.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                  <td className="py-2.5 px-2">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={member.name} />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">{member.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{member.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-2.5 px-2 text-gray-600 dark:text-gray-400">{member.email}</td>
                  <td className="py-2.5 px-2">
                    <div className="flex flex-wrap gap-1">
                      {getRoleNames(member.roleIds).map((name, i) => (
                        <span key={i} className="text-xs px-2 py-0.5 rounded bg-primary-500/10 text-primary-600 dark:text-primary-400">
                          {name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-2.5 px-2 text-gray-600 dark:text-gray-400">{member.department}</td>
                  <td className="py-2.5 px-2">
                    <span className={`badge ${statusMap[member.status]?.className}`}>
                      {statusMap[member.status]?.label}
                    </span>
                  </td>
                  <td className="py-2.5 px-2 text-gray-600 dark:text-gray-400 text-xs">{member.lastLoginAt ? new Date(member.lastLoginAt).toLocaleDateString('zh-CN') : '从未'}</td>
                  <td className="py-2.5 px-2 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => toggleMemberStatus(member.id)}
                        className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                        title={member.status === 'active' ? '禁用' : '启用'}
                      >
                        <Power size={14} className={member.status === 'active' ? 'text-yellow-500' : 'text-green-500'} />
                      </button>
                      <button
                        onClick={() => handleOpenModal(member)}
                        className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                        title="编辑"
                      >
                        <Edit size={14} className="text-gray-600 dark:text-gray-400" />
                      </button>
                      <button
                        onClick={() => handleDelete(member)}
                        className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                        title="移除"
                      >
                        <Trash2 size={14} className="text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedMembers.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500 dark:text-gray-400">
                    <Users size={32} className="mx-auto mb-2 opacity-30" />
                    暂无匹配的成员
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              显示 {((currentPage - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, filteredMembers.length)} / 共 {filteredMembers.length} 名
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                    page === currentPage
                      ? 'bg-primary-500 text-white'
                      : 'border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      <Modal
        title={editingMember ? '编辑成员' : '邀请成员'}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        width="max-w-lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              {roles.map(role => {
                const selected = formRoleIds.includes(role.id)
                return (
                  <button
                    key={role.id}
                    onClick={() => {
                      if (selected) {
                        setFormRoleIds(formRoleIds.filter(id => id !== role.id))
                      } else {
                        setFormRoleIds([...formRoleIds, role.id])
                      }
                    }}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      selected
                        ? 'bg-primary-500/20 text-primary-600 dark:text-primary-400 border border-primary-500/30'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    {selected && (
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-700 dark:text-blue-400">
                邀请后成员将收到激活邮件，初始状态为「待激活」
              </p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}
