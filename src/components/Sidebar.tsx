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
      label: '内容中心',
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
      label: '项目中心',
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
      label: '系统管理',
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
    <div className={`nav-shell transition-all duration-300 flex flex-col ${collapsed ? 'w-20' : 'w-64'}`}>
      <div className="nav-header flex items-center justify-between p-4">
        {!collapsed && (
          <div>
            <h1 className="font-display text-xl font-bold text-primary-200">AIGC数字资产管理平台</h1>
            <p className="meta-text mt-1 text-primary-300/70">数字资产管理与协同平台</p>
          </div>
        )}
        <button
          onClick={onToggle}
          className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-primary-900 hover:text-gray-100"
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
                  ? 'nav-item nav-item-active'
                  : 'nav-item'
              }`}
            >
              {item.icon}
              {!collapsed && <span>{item.label}</span>}
            </Link>

            {item.children && isActive(item.path) && !collapsed && (
              <div className="ml-8 mt-1 space-y-1">
                {item.children.map((child) => (
                  <Link
                    key={child.path}
                    to={child.path}
                    className={`block px-3 py-2 rounded-lg transition-all duration-200 text-sm ${
                      isChildActive(child.path)
                        ? 'nav-subitem nav-subitem-active'
                        : 'nav-subitem'
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

      <div className="nav-header p-4">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-500/15 text-primary-200">
              <Users size={16} />
            </div>
            <div>
              <p className="body-text text-gray-200">admin</p>
              <p className="meta-text text-primary-300/70">管理员账号</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
