import { useMemo, useState } from 'react'
import { Shield, Edit, Trash2, Plus, X, Eye } from 'lucide-react'
import { useAppStore } from '@/store/appStore'
import Modal from '@/components/Modal'
import { PageIntro, PageSection, PageShell } from '@/components/PageShell'
import { ReadOnlyField, ReadOnlySection } from '@/components/ReadOnlyDetails'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { NativeSelect } from '@/components/ui/native-select'
import { Checkbox } from '@/components/ui/checkbox'
import { ActionIconButton } from '@/components/ui/action-icon-button'
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
  const [permissionCategoryFilter, setPermissionCategoryFilter] = useState<'all' | string>('all')
  const [permissionScopeFilter, setPermissionScopeFilter] = useState<'all' | 'full-access' | 'custom'>('all')

  const filteredRoles = useMemo(() => (
    roles.filter((role) => {
      const matchVisibility = visibilityFilter === 'all' || role.visibility === visibilityFilter
      const matchPermissionCategory = permissionCategoryFilter === 'all'
        || role.permissions.includes('*')
        || role.permissions.some((permission) => permission.startsWith(`${permissionCategoryFilter}:`))
      const matchPermissionScope = permissionScopeFilter === 'all'
        || (permissionScopeFilter === 'full-access' && role.permissions.includes('*'))
        || (permissionScopeFilter === 'custom' && !role.permissions.includes('*'))
      const matchSearch = matchesKeyword(searchQuery, [
        role.roleName,
        visibilityMap[role.visibility]?.label,
        role.permissions,
        formatDate(role.createdAt),
      ])
      return matchVisibility && matchPermissionCategory && matchPermissionScope && matchSearch
    })
  ), [roles, searchQuery, visibilityFilter, permissionCategoryFilter, permissionScopeFilter])

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
    <PageShell>
      <PageIntro
        eyebrow="系统管理 / 权限"
        title="角色权限管理"
        description="以最小权限原则配置角色能力与数据可见范围，为团队协作建立清晰边界。"
        actions={<Button className="gap-2" onClick={() => handleOpenModal()}><Plus size={16} />新增角色</Button>}
      />

      <PageSection className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="xl:col-span-1">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索角色名称或权限..."
          />
        </div>
        <div>
          <NativeSelect
            value={visibilityFilter}
            onChange={(e) => setVisibilityFilter(e.target.value as typeof visibilityFilter)}
          >
            <option value="all">全部可见性</option>
            <option value="internal-only">仅内部</option>
            <option value="client-safe">客户可见</option>
            <option value="public">公开</option>
          </NativeSelect>
        </div>
        <div>
          <NativeSelect
            value={permissionCategoryFilter}
            onChange={(e) => setPermissionCategoryFilter(e.target.value)}
          >
            <option value="all">全部权限分类</option>
            {AVAILABLE_PERMISSIONS.map((item) => (
              <option key={item.key} value={item.key}>
                {item.category}
              </option>
            ))}
          </NativeSelect>
        </div>
        <div>
          <NativeSelect
            value={permissionScopeFilter}
            onChange={(e) => setPermissionScopeFilter(e.target.value as typeof permissionScopeFilter)}
          >
            <option value="all">全部权限范围</option>
            <option value="full-access">全部权限</option>
            <option value="custom">自定义权限</option>
          </NativeSelect>
        </div>
      </div>

      <div className="filter-meta">
        <span>共 {filteredRoles.length} 个角色</span>
        <span>权限分类 {AVAILABLE_PERMISSIONS.length} 项</span>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredRoles.map((role) => (
          <div key={role.id} className="page-section-tight">
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="summary-icon">
                  <Shield size={18} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">{role.roleName}</h3>
                  <span className={`badge ${visibilityMap[role.visibility]?.className || 'badge-info'}`}>
                    {visibilityMap[role.visibility]?.label || role.visibility}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <ActionIconButton onClick={() => setViewingRole(role)} title="查看">
                  <Eye size={14} className="text-gray-600 dark:text-gray-400" />
                </ActionIconButton>
                <ActionIconButton onClick={() => handleOpenModal(role)} title="编辑">
                  <Edit size={14} className="text-gray-600 dark:text-gray-400" />
                </ActionIconButton>
                <ActionIconButton tone="danger" onClick={() => handleDelete(role)} title="删除">
                  <Trash2 size={14} />
                </ActionIconButton>
              </div>
            </div>
            <div>
              <p className="body-muted mb-2">权限列表 ({role.permissions.length})</p>
              <div className="flex flex-wrap gap-1.5">
                {role.permissions.map((perm, index) => (
                  <span key={index} className={`rounded-full border px-2.5 py-1 helper-text ${perm === '*' ? 'border-gray-950 bg-gray-950 text-white dark:border-white dark:bg-white dark:text-gray-950' : 'border-gray-200 bg-gray-100 text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300'}`}>
                    {perm === '*' ? '全部权限' : perm}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
        {filteredRoles.length === 0 && (
          <div className="empty-state">暂无匹配角色</div>
        )}
      </div>
      </PageSection>

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
              <NativeSelect
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as typeof visibility)}
              >
                <option value="internal-only">仅内部</option>
                <option value="client-safe">客户可见</option>
                <option value="public">公开</option>
              </NativeSelect>
            </div>
          </div>

          <div className="space-y-3">
            <Label>权限配置</Label>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/50">
              <label className="flex cursor-pointer items-center gap-2">
                <Checkbox
                  checked={selectedPermissions.includes('*')}
                  onCheckedChange={() => togglePermission('*')}
                />
                <span className="panel-value font-medium text-gray-900 dark:text-gray-100">全部权限</span>
                {selectedPermissions.includes('*') && (
                  <span className="helper-text">（已授予所有权限）</span>
                )}
              </label>
            </div>

            {!selectedPermissions.includes('*') && AVAILABLE_PERMISSIONS.map((category) => (
              <div key={category.key} className="space-y-2">
                <p className="panel-value font-medium text-gray-700 dark:text-gray-300">{category.category}</p>
                <div className="flex flex-wrap gap-2">
                  {category.actions.map((action) => {
                    const perm = `${category.key}:${action}`
                    const selected = isPermissionSelected(perm)
                    return (
                      <Button
                        key={perm}
                        type="button"
                        onClick={() => togglePermission(perm)}
                        variant="outline"
                        size="sm"
                        className={`gap-1.5 ${
                          selected
                            ? 'border-gray-950 bg-gray-950 text-white dark:border-white dark:bg-white dark:text-gray-950'
                            : 'border-gray-200 bg-gray-100 text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:border-gray-600'
                        }`}
                      >
                        {selected && (
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                        {action}
                      </Button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {selectedPermissions.length > 0 && !selectedPermissions.includes('*') && (
            <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/50">
              <p className="panel-value mb-2 font-medium text-gray-700 dark:text-gray-300">已选权限 ({selectedPermissions.length})</p>
              <div className="flex flex-wrap gap-1.5">
                {selectedPermissions.map((perm) => (
                  <span key={perm} className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-100 px-2.5 py-1 helper-text text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
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
                    <span key={index} className={`rounded-full border px-2.5 py-1 helper-text ${perm === '*' ? 'border-gray-950 bg-gray-950 text-white dark:border-white dark:bg-white dark:text-gray-950' : 'border-gray-200 bg-gray-100 text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300'}`}>
                      {perm === '*' ? '全部权限' : perm}
                    </span>
                  ))}
                </div>
              }
            />
          </ReadOnlySection>
        )}
      </Modal>
    </PageShell>
  )
}
