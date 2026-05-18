import { Link, useLocation } from 'react-router-dom'
import { LayoutGrid, ImagePlus, Folder, Settings, ChevronLeft, ChevronRight, UserRound } from 'lucide-react'

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
      icon: <ImagePlus size={19} strokeWidth={1.8} />,
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
      icon: <Folder size={19} strokeWidth={1.8} />,
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
      icon: <LayoutGrid size={19} strokeWidth={1.8} />,
      label: '数据中心',
      children: [
        { path: '/dashboard/overview', label: '经营总览' },
        { path: '/dashboard/generation', label: '生成概览' },
        { path: '/dashboard/assets', label: '资产概览' },
        { path: '/dashboard/tasks', label: '任务概览' },
      ]
    },
    {
      path: '/system',
      icon: <Settings size={19} strokeWidth={1.8} />,
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

  const accountPanel = (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200">
        <UserRound size={16} strokeWidth={1.8} />
      </div>
      <div>
        <p className="body-text font-medium text-gray-900 dark:text-gray-100">admin</p>
        <p className="meta-text">管理员账号</p>
      </div>
    </div>
  )

  return (
    <div className={`nav-shell transition-all duration-300 flex flex-col ${collapsed ? 'w-[88px]' : 'w-64'}`}>
      <div className={`nav-header flex items-start justify-between ${collapsed ? 'p-3' : 'p-4'}`}>
        {!collapsed && (
          <div className="pr-3">
            <h1 className="text-2xl font-semibold tracking-[-0.04em] text-gray-950 dark:text-gray-50">数字资产管理平台</h1>
            <p className="meta-text mt-1">FatMug</p>
          </div>
        )}
        <button
          onClick={onToggle}
          className={`rounded-full border border-transparent p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-900 dark:hover:text-gray-100 ${collapsed ? 'mx-auto mt-1' : ''}`}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className={`flex-1 overflow-y-auto ${collapsed ? 'px-2 py-6' : 'py-4'}`}>
        {menuItems.map((item) => (
          <div key={item.path}>
            <Link
              to={item.children ? item.children[0].path : item.path}
              className={`group flex items-center ${collapsed ? 'justify-center px-3 py-3.5 mx-1.5' : 'gap-3 px-4 py-3 mx-2'} rounded-2xl transition-colors ${
                isActive(item.path)
                  ? 'nav-item nav-item-active'
                  : 'nav-item'
              }`}
              title={collapsed ? item.label : undefined}
            >
              {item.icon}
              {!collapsed && <span>{item.label}</span>}
            </Link>

            {item.children && isActive(item.path) && !collapsed && (
              <div className="ml-8 mt-2 space-y-1">
                {item.children.map((child) => (
                  <Link
                    key={child.path}
                    to={child.path}
                    className={`block px-3 py-2 rounded-lg transition-colors text-sm ${
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
        {collapsed ? (
          <div className="relative flex justify-center group">
            <button
              type="button"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-950 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-gray-50"
              title="admin"
            >
              <UserRound size={17} strokeWidth={1.8} />
            </button>
            <div className="pointer-events-none absolute bottom-0 left-[calc(100%+12px)] z-30 w-max min-w-[140px] rounded-2xl border border-gray-200 bg-white px-4 py-3 opacity-0 shadow-[0_18px_44px_rgba(15,23,42,0.08)] transition-all duration-200 group-hover:pointer-events-auto group-hover:-translate-y-1 group-hover:opacity-100 dark:border-gray-800 dark:bg-gray-900">
              <p className="body-text font-medium text-gray-900 dark:text-gray-100">admin</p>
              <p className="meta-text">管理员账号</p>
            </div>
          </div>
        ) : (
          accountPanel
        )}
      </div>
    </div>
  )
}
