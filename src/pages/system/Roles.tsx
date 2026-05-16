import { useAppStore } from '@/store/appStore'
import { Shield, Edit } from 'lucide-react'
import { useState } from 'react'
import Modal from '@/components/Modal'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { showToast } from '@/utils/toast'

const visibilityMap: Record<string, { label: string; className: string }> = {
  'internal-only': { label: '仅内部', className: 'badge-info' },
  'client-safe': { label: '客户可见', className: 'badge-warning' },
  'public': { label: '公开', className: 'badge-success' },
}

export default function Roles() {
  const { roles } = useAppStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<string | null>(null)
  const [formData, setFormData] = useState({ roleName: '', description: '' })

  const handleOpenModal = (role?: typeof roles[0]) => {
    if (role) {
      setEditingRole(role.id)
      setFormData({ roleName: role.roleName, description: '' })
    } else {
      setEditingRole(null)
      setFormData({ roleName: '', description: '' })
    }
    setIsModalOpen(true)
  }

  const handleSave = () => {
    if (!formData.roleName) {
      showToast('error', '请输入角色名称')
      return
    }
    showToast('success', editingRole ? '角色更新成功' : '角色创建成功')
    setIsModalOpen(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-gray-100">角色权限管理</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">管理系统角色和权限配置</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roles.map(role => (
          <div key={role.id} className="card">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent-500/10">
                  <Shield size={20} className="text-accent-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">{role.roleName}</h3>
                  <span className={`badge ${visibilityMap[role.visibility]?.className || 'badge-info'}`}>
                    {visibilityMap[role.visibility]?.label || role.visibility}
                  </span>
                </div>
              </div>
              <button
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                onClick={() => handleOpenModal(role)}
              >
                <Edit size={14} className="text-gray-600 dark:text-gray-400" />
              </button>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">权限列表</p>
              <div className="flex flex-wrap gap-2">
                {role.permissions.map((perm, i) => (
                  <span key={i} className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-gray-700 dark:text-gray-300">
                    {perm}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal
        title={editingRole ? '编辑角色' : '角色详情'}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
      >
        <div className="space-y-5">
          <div className="space-y-2">
            <Label>角色名称</Label>
            <Input value={formData.roleName} onChange={(e) => setFormData({ ...formData, roleName: e.target.value })} placeholder="输入角色名称" />
          </div>
          <div className="space-y-2">
            <Label>描述</Label>
            <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="输入角色描述" />
          </div>
          <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">当前权限（编辑功能待完善）</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">提示：完整权限编辑功能将在后续版本支持</p>
          </div>
        </div>
      </Modal>
    </div>
  )
}
