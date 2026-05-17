import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Image, Video, FolderOpen, History,
  Users, Tags, FolderTree, FileText, CheckSquare, ClipboardCheck,
  Shield, Settings, ChevronLeft, ChevronRight, Clapperboard
} from 'lucide-react'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

interface MenuItem {
  path: string
  icon: React.ReactNode
  label: string
  children?: { path: string; label: string }[]
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation()
  const currentPath = location.pathname

  const menuItems: MenuItem[] = [
    {
      path: '/content',
      icon: <Image size={20} />,
      label: '内容创作',
      children: [
        { path: '/content/image-generation', label: '图片创作' },
        { path: '/content/video-generation', label: '视频创作' },
        { path: '/content/assets', label: '资产库' },
        { path: '/content/shots', label: '镜头管理' },
      ]
    },
    {
      path: '/projects',
      icon: <FolderOpen size={20} />,
      label: '项目管理',
      children: [
        { path: '/projects/projects', label: '项目列表' },
        { path: '/projects/customers', label: '客户管理' },
        { path: '/projects/brands', label: '品牌管理' },
        { path: '/projects/briefs', label: '提案管理' },
        { path: '/projects/tasks', label: '任务管理' },
        { path: '/projects/reviews', label: '审核管理' },
      ]
    },
    {
      path: '/dashboard',
      icon: <LayoutDashboard size={20} />,
      label: '数据中心',
      children: [
        { path: '/dashboard/overview', label: '总览' },
        { path: '/dashboard/generation', label: '生成' },
        { path: '/dashboard/assets', label: '资产' },
        { path: '/dashboard/tasks', label: '任务' },
      ]
    },
    {
      path: '/system',
      icon: <Settings size={20} />,
      label: '系统配置',
      children: [
        { path: '/system/members', label: '成员管理' },
        { path: '/system/roles', label: '角色权限' },
        { path: '/system/settings', label: '系统设置' },
        { path: '/system/ai-config', label: 'AI 能力配置' },
        { path: '/system/logs', label: '全局日志' },
      ]
    },
  ]

  const isActive = (path: string) => {
    if (path === '/dashboard') return currentPath.startsWith('/dashboard')
    return currentPath.startsWith(path)
  }

  const isChildActive = (childPath: string) => currentPath === childPath

  return (
    <div className={`bg-primary-900 border-r border-gray-800 transition-all duration-300 flex flex-col ${collapsed ? 'w-20' : 'w-64'}`}>
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        {!collapsed && (
          <h1 className="text-xl font-display font-bold text-accent-500">AIGC管理</h1>
        )}
        <button
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto">
        {menuItems.map((item) => (
          <div key={item.path}>
            <Link
              to={item.children ? item.children[0].path : item.path}
              className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-all duration-200 ${
                isActive(item.path)
                  ? 'bg-accent-500/20 text-accent-500'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
              }`}
            >
              {item.icon}
              {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
            </Link>

            {item.children && isActive(item.path) && !collapsed && (
              <div className="ml-8 mt-1 space-y-1">
                {item.children.map((child) => (
                  <Link
                    key={child.path}
                    to={child.path}
                    className={`block px-3 py-2 rounded-lg transition-all duration-200 text-sm ${
                      isChildActive(child.path)
                        ? 'bg-gray-800 text-accent-500'
                        : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-800">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-accent-500/20 flex items-center justify-center text-accent-500">
              <Users size={16} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-300">管理员</p>
              <p className="text-xs text-gray-500">项目经理</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
