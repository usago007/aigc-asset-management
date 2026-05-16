import { useLocation } from 'react-router-dom'
import { Search, Bell } from 'lucide-react'

const breadcrumbs: Record<string, string[]> = {
  '/dashboard': ['仪表盘'],
  '/content/keyframes': ['内容创作', '首图/尾图'],
  '/content/shots': ['内容创作', '镜头管理'],
  '/content/assets': ['内容创作', '资产管理'],
  '/projects/customers': ['项目管理', '客户管理'],
  '/projects/brands': ['项目管理', '品牌管理'],
  '/projects/projects': ['项目管理', '项目列表'],
  '/projects/briefs': ['项目管理', '简报管理'],
  '/projects/tasks': ['项目管理', '任务管理'],
  '/projects/reviews': ['项目管理', '审核管理'],
  '/system/roles': ['系统配置', '角色权限'],
  '/system/settings': ['系统配置', '系统设置'],
}

export default function Header() {
  const location = useLocation()
  const path = location.pathname
  const crumbs = breadcrumbs[path] || ['页面']

  return (
    <header className="bg-primary-900/80 backdrop-blur border-b border-gray-800 px-6 py-4">
      <div className="flex items-center justify-between">
        <nav className="flex items-center gap-2 text-sm">
          {crumbs.map((crumb, index) => (
            <span key={index} className="flex items-center gap-2">
              {index > 0 && <span className="text-gray-600">/</span>}
              <span className={index === crumbs.length - 1 ? 'text-gray-200 font-medium' : 'text-gray-500'}>
                {crumb}
              </span>
            </span>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="搜索..."
              className="pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-accent-500/50 w-64"
            />
          </div>
          <button className="relative p-2 rounded-lg hover:bg-gray-800 transition-colors">
            <Bell size={18} className="text-gray-400" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-accent-500 rounded-full"></span>
          </button>
        </div>
      </div>
    </header>
  )
}
