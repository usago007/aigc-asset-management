import { useLocation } from 'react-router-dom'
import { Search, Bell } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const breadcrumbs: Record<string, string[]> = {
  '/dashboard': ['仪表盘'],
  '/dashboard/overview': ['仪表盘', '经营总览'],
  '/dashboard/generation': ['仪表盘', '生成概览'],
  '/dashboard/assets': ['仪表盘', '资产概览'],
  '/dashboard/tasks': ['仪表盘', '任务概览'],
  '/content/keyframes': ['内容中心', '关键帧'],
  '/content/shots': ['内容中心', '镜头管理'],
  '/content/assets': ['内容中心', '资产库'],
  '/content/video-generation': ['内容中心', '视频创作'],
  '/content/image-generation': ['内容中心', '图片创作'],
  '/projects/customers': ['项目中心', '客户管理'],
  '/projects/brands': ['项目中心', '品牌管理'],
  '/projects/projects': ['项目中心', '项目列表'],
  '/projects/briefs': ['项目中心', '提案管理'],
  '/projects/tasks': ['项目中心', '任务管理'],
  '/projects/reviews': ['项目中心', '审核管理'],
  '/system/members': ['系统管理', '成员管理'],
  '/system/roles': ['系统管理', '角色权限'],
  '/system/settings': ['系统管理', '系统设置'],
  '/system/ai-config': ['系统管理', 'AI 能力配置'],
  '/system/logs': ['系统管理', '全局日志'],
}

const dynamicRoutes: { prefix: string; crumbs: string[] }[] = [
  { prefix: '/content/image-detail/', crumbs: ['内容中心', '图片详情'] },
  { prefix: '/content/video-detail/', crumbs: ['内容中心', '视频详情'] },
  { prefix: '/content/shots/', crumbs: ['内容中心', '镜头详情'] },
  { prefix: '/content/task/', crumbs: ['内容中心', '任务详情'] },
  { prefix: '/projects/projects/', crumbs: ['项目中心', '项目详情'] },
]

export default function Header() {
  const location = useLocation()
  const path = location.pathname

  const getBreadcrumbs = () => {
    if (breadcrumbs[path]) return breadcrumbs[path]
    for (const route of dynamicRoutes) {
      if (path.startsWith(route.prefix)) return route.crumbs
    }
    return ['页面']
  }

  const crumbs = getBreadcrumbs()

  return (
    <header className="header-shell px-6 py-4 lg:px-10">
      <div className="mx-auto flex w-full max-w-[1480px] items-center justify-between gap-4">
        <nav className="flex items-center gap-2 text-sm">
          {crumbs.map((crumb, index) => (
            <span key={index} className="flex items-center gap-2">
              {index > 0 && <span className="header-divider">/</span>}
              <span className={index === crumbs.length - 1 ? 'header-crumb-active' : 'header-crumb'}>
                {crumb}
              </span>
            </span>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <Input
              placeholder="搜索..."
              className="h-10 w-56 border-gray-200 bg-white pl-9 dark:bg-gray-900"
            />
          </div>
          <Button variant="secondary" size="icon" className="relative h-10 w-10">
            <Bell size={16} className="text-gray-500 dark:text-gray-400" />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-gray-900 dark:bg-white"></span>
          </Button>
        </div>
      </div>
    </header>
  )
}
