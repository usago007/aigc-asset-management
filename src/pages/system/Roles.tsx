import { useMemo, useState } from 'react'
import { Shield, Edit, Trash2, Plus, X, Eye } from 'lucide-react'
import { useAppStore } from '@/store/appStore'
import Modal from '@/components/Modal'
import { ReadOnlyField, ReadOnlySection } from '@/components/ReadOnlyDetails'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { showToast } from '@/utils/toast'
import { matchesKeyword } from '@/utils/search'
import { formatDate } from '@/utils/date'

const visibilityMap: Record<string, { label: string; className: string }> = {
  'internal-only': { label: '仅内部', className: 'badge-info' },
  'client-safe': { label: '客户可见', className: 'badge-warning' },
  public: { label: '公开', className: 'badge-success' },
}

const AVAILABLE_PERMISSIONS = [
  { category: '项目', key: 'project', actions: ['read', 'write', 'delete'] },
  { category: '任务', key: 'task', actions: ['read', 'write', 'delete'] },
  { category: '提案', key: 'brief', actions: ['read', 'write', 'delete'] },
  { category: '资产', key: 'asset', actions: ['read', 'write', 'delete', 'review'] },
  { category: '镜头', key: 'shot', actions: ['read', 'write', 'delete'] },
  { category: '首图/尾图', key: 'keyframe', actions: ['read', 'write', 'delete'] },
  { category: '审核', key: 'review', actions: ['read', 'write', 'delete'] },
  { category: '内容', key: 'content', actions: ['read', 'write'] },
  { category: '模型', key: 'model', actions: ['read', 'select'] },
]

export default function Roles() {
  const { roles, addRole, updateRole, deleteRole } = useAppStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [viewingRole, setViewingRole] = useState<typeof roles[0] | null>(null)
  const [editingRole, setEditingRole] = useState<typeof roles[0] | null>(null)
  const [roleName, setRoleName] = useState('')
  const [visibility, setVisibility] = useState<'internal-only' | 'client-safe' | 'public'>('internal-only')
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [visibilityFilter, setVisibilityFilter] = useState<'all' | 'internal-only' | 'client-safe' | 'public'>('all')

  const filteredRoles = useMemo(() => (
    roles.filter((role) => {
      const matchVisibility = visibilityFilter === 'all' || role.visibility === visibilityFilter
      const matchSearch = matchesKeyword(searchQuery, [
        role.roleName,
        visibilityMap[role.visibility]?.label,
        role.permissions,
        formatDate(role.createdAt),
      ])
      return matchVisibility && matchSearch
    })
  ), [roles, searchQuery, visibilityFilter])

  const handleOpenModal = (role?: typeof roles[0]) => {
    if (role) {
      setEditingRole(role)
      setRoleName(role.roleName)
      setVisibility(role.visibility)
      setSelectedPermissions([...role.permissions])
    } else {
      setEditingRole(null)
      setRoleName('')
      setVisibility('internal-only')
      setSelectedPermissions([])
    }
    setIsModalOpen(true)
  }

  const handleSave = () => {
    if (!roleName.trim()) {
      showToast('error', '请输入角色名称')
      return
    }
    if (selectedPermissions.length === 0) {
      showToast('error', '请至少选择一个权限')
      return
    }

    if (editingRole) {
      updateRole(editingRole.id, {
        roleName: roleName.trim(),
        permissions: selectedPermissions,
        visibility,
      })
    } else {
      addRole({
        roleName: roleName.trim(),
        permissions: selectedPermissions,
        visibility,
      })
    }

    setIsModalOpen(false)
  }

  const handleDelete = (role: typeof roles[0]) => {
    if (confirm(`确定要删除角色 "${role.roleName}" 吗？此操作不可撤销。`)) {
      deleteRole(role.id)
    }
  }

  const togglePermission = (perm: string) => {
    if (perm === '*') {
      setSelectedPermissions((current) => current.includes('*') ? [] : ['*'])
      return
    }

    const nextPerms = selectedPermissions.includes('*') ? [] : [...selectedPermissions]

    if (nextPerms.includes(perm)) {
      setSelectedPermissions(nextPerms.filter((item) => item !== perm))
    } else {
      setSelectedPermissions([...nextPerms, perm])
    }
  }

  const isPermissionSelected = (perm: string) => selectedPermissions.includes('*') || selectedPermissions.includes(perm)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-gray-100">角色权限管理</h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">管理系统角色和权限配置</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => handleOpenModal()}>
          <Plus size={16} />
          新增角色
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="搜索角色名称或权限..." className="max-w-sm" />
        <select className="input-field max-w-[180px]" value={visibilityFilter} onChange={(e) => setVisibilityFilter(e.target.value as typeof visibilityFilter)}>
          <option value="all">全部可见性</option>
          <option value="internal-only">仅内部</option>
          <option value="client-safe">客户可见</option>
          <option value="public">公开</option>
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredRoles.map((role) => (
          <div key={role.id} className="card">
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-accent-500/10 p-2">
                  <Shield size={20} className="text-accent-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">{role.roleName}</h3>
                  <span className={`badge ${visibilityMap[role.visibility]?.className || 'badge-info'}`}>
                    {visibilityMap[role.visibility]?.label || role.visibility}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button className="rounded p-1.5 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700" onClick={() => setViewingRole(role)} title="查看">
                  <Eye size={14} className="text-gray-600 dark:text-gray-400" />
                </button>
                <button className="rounded p-1.5 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700" onClick={() => handleOpenModal(role)} title="编辑">
                  <Edit size={14} className="text-gray-600 dark:text-gray-400" />
                </button>
                <button className="rounded p-1.5 transition-colors hover:bg-red-100 dark:hover:bg-red-900/30" onClick={() => handleDelete(role)} title="删除">
                  <Trash2 size={14} className="text-red-500" />
                </button>
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">权限列表 ({role.permissions.length})</p>
              <div className="flex flex-wrap gap-1.5">
                {role.permissions.map((perm, index) => (
                  <span key={index} className={`rounded px-2 py-1 text-xs ${perm === '*' ? 'bg-accent-500/20 text-accent-600 dark:text-accent-400' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'}`}>
                    {perm === '*' ? '全部权限' : perm}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
        {filteredRoles.length === 0 && (
          <div className="card text-center text-sm text-gray-500 dark:text-gray-400">暂无匹配角色</div>
        )}
      </div>

      <Modal
        title={editingRole ? '编辑角色' : '新增角色'}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        width="max-w-2xl"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>角色名称</Label>
              <Input
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                placeholder="例如：内容审核员"
              />
            </div>
            <div className="space-y-2">
              <Label>可见性</Label>
              <select
                className="input-field"
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as typeof visibility)}
              >
                <option value="internal-only">仅内部</option>
                <option value="client-safe">客户可见</option>
                <option value="public">公开</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <Label>权限配置</Label>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/50">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedPermissions.includes('*')}
                  onChange={() => togglePermission('*')}
                  className="h-4 w-4 rounded border-gray-300 text-accent-500 focus:ring-accent-500"
                />
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">全部权限</span>
                {selectedPermissions.includes('*') && (
                  <span className="text-xs text-accent-500">（已授予所有权限）</span>
                )}
              </label>
            </div>

            {!selectedPermissions.includes('*') && AVAILABLE_PERMISSIONS.map((category) => (
              <div key={category.key} className="space-y-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{category.category}</p>
                <div className="flex flex-wrap gap-2">
                  {category.actions.map((action) => {
                    const perm = `${category.key}:${action}`
                    const selected = isPermissionSelected(perm)
                    return (
                      <button
                        key={perm}
                        onClick={() => togglePermission(perm)}
                        className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-all ${
                          selected
                            ? 'border-accent-500/30 bg-accent-500/20 text-accent-600 dark:text-accent-400'
                            : 'border-gray-200 bg-gray-100 text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:border-gray-600'
                        }`}
                      >
                        {selected && (
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                        {action}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {selectedPermissions.length > 0 && !selectedPermissions.includes('*') && (
            <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/50">
              <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">已选权限 ({selectedPermissions.length})</p>
              <div className="flex flex-wrap gap-1.5">
                {selectedPermissions.map((perm) => (
                  <span key={perm} className="inline-flex items-center gap-1 rounded bg-accent-500/10 px-2 py-1 text-xs text-accent-600 dark:text-accent-400">
                    {perm}
                    <button onClick={() => togglePermission(perm)} className="hover:text-red-500">
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </Modal>

      <Modal title="查看角色" isOpen={Boolean(viewingRole)} onClose={() => setViewingRole(null)} width="max-w-2xl">
        {viewingRole && (
          <ReadOnlySection>
            <ReadOnlyField label="角色名称" value={viewingRole.roleName} />
            <ReadOnlyField label="可见性" value={<span className={`badge ${visibilityMap[viewingRole.visibility]?.className || 'badge-info'}`}>{visibilityMap[viewingRole.visibility]?.label || viewingRole.visibility}</span>} />
            <ReadOnlyField label="创建时间" value={formatDate(viewingRole.createdAt)} />
            <ReadOnlyField
              label="权限列表"
              span="full"
              value={
                <div className="flex flex-wrap gap-1.5">
                  {viewingRole.permissions.map((perm, index) => (
                    <span key={index} className={`rounded px-2 py-1 text-xs ${perm === '*' ? 'bg-accent-500/20 text-accent-600 dark:text-accent-400' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'}`}>
                      {perm === '*' ? '全部权限' : perm}
                    </span>
                  ))}
                </div>
              }
            />
          </ReadOnlySection>
        )}
      </Modal>
    </div>
  )
}
