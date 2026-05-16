import { useAppStore } from '@/store/appStore'
import { Shield, Eye, Edit } from 'lucide-react'

const visibilityMap: Record<string, { label: string; className: string }> = {
  'internal-only': { label: '仅内部', className: 'badge-info' },
  'client-safe': { label: '客户可见', className: 'badge-warning' },
  'public': { label: '公开', className: 'badge-success' },
}

export default function Roles() {
  const { roles } = useAppStore()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-gray-100">角色权限管理</h1>
        <p className="text-gray-500 mt-1">管理系统角色和权限配置</p>
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
                  <h3 className="font-semibold text-gray-100">{role.roleName}</h3>
                  <span className={`badge ${visibilityMap[role.visibility]?.className || 'badge-info'}`}>
                    {visibilityMap[role.visibility]?.label || role.visibility}
                  </span>
                </div>
              </div>
              <button className="p-1 hover:bg-gray-700 rounded transition-colors">
                <Edit size={14} className="text-gray-400" />
              </button>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-2">权限列表</p>
              <div className="flex flex-wrap gap-2">
                {role.permissions.map((perm, i) => (
                  <span key={i} className="text-xs px-2 py-1 bg-gray-800 rounded text-gray-300">
                    {perm}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
