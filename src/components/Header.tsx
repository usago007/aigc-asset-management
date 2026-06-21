import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { Bell, Menu, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import NotificationPanel from '@/components/NotificationPanel'
import type { NotificationItem } from '@/types'

const breadcrumbs: Record<string, string[]> = {
  '/dashboard': ['仪表盘'],
  '/dashboard/overview': ['数据中心', '经营态势'],
  '/dashboard/generation': ['数据中心', '生成质量'],
  '/dashboard/assets': ['数据中心', '资产复用'],
  '/dashboard/tasks': ['数据中心', '交付效能'],
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

interface HeaderProps {
  onOpenNavigation: () => void
  notifications: NotificationItem[]
  unreadCount: number
  notificationsEnabled: boolean
  notificationPanelOpen: boolean
  onToggleNotificationPanel: () => void
  onCloseNotificationPanel: () => void
  onMarkNotificationRead: (id: string) => void
  onMarkAllNotificationsRead: () => void
  onNavigateFromNotification: (item: NotificationItem) => void
  onOpenSettings: () => void
}

export default function Header({
  onOpenNavigation,
  notifications,
  unreadCount,
  notificationsEnabled,
  notificationPanelOpen,
  onToggleNotificationPanel,
  onCloseNotificationPanel,
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  onNavigateFromNotification,
  onOpenSettings,
}: HeaderProps) {
  const location = useLocation()
  const path = location.pathname
  const panelRef = useRef<HTMLDivElement | null>(null)

  const getBreadcrumbs = () => {
    if (breadcrumbs[path]) return breadcrumbs[path]
    for (const route of dynamicRoutes) {
      if (path.startsWith(route.prefix)) return route.crumbs
    }
    return ['页面']
  }

  const crumbs = getBreadcrumbs()

  useEffect(() => {
    onCloseNotificationPanel()
  }, [location.pathname, onCloseNotificationPanel])

  useEffect(() => {
    if (!notificationPanelOpen) return undefined

    const handlePointerDown = (event: MouseEvent) => {
      if (!panelRef.current?.contains(event.target as Node)) {
        onCloseNotificationPanel()
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCloseNotificationPanel()
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [notificationPanelOpen, onCloseNotificationPanel])

  return (
    <header className="header-shell px-4 py-3 sm:px-6 lg:px-10 lg:py-4">
      <div className="mx-auto flex w-full max-w-[1480px] items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <Button variant="ghost" size="icon" className="shrink-0 lg:hidden" onClick={onOpenNavigation} aria-label="打开主导航">
            <Menu size={18} />
          </Button>
        <nav className="flex min-w-0 items-center gap-2 overflow-hidden text-sm" aria-label="面包屑">
          {crumbs.map((crumb, index) => (
            <span key={index} className="flex items-center gap-2">
              {index > 0 && <span className="header-divider">/</span>}
              <span className={`truncate ${index === crumbs.length - 1 ? 'header-crumb-active' : 'header-crumb'}`}>
                {crumb}
              </span>
            </span>
          ))}
        </nav>
        </div>

        <div className="relative flex items-center gap-3" ref={panelRef}>
          <div className="hidden items-center gap-2 rounded-xl border border-gray-200/80 bg-white/70 px-3 py-2 text-[11px] font-medium text-gray-500 shadow-sm xl:flex dark:border-gray-800 dark:bg-gray-900/70 dark:text-gray-400">
            <Sparkles size={13} className="text-emerald-500" /> AI workspace <span className="h-1 w-1 rounded-full bg-emerald-400" /> Ready
          </div>
          <Button
            variant="secondary"
            size="icon"
            className="relative h-10 w-10"
            onClick={onToggleNotificationPanel}
            aria-label="打开系统通知"
            aria-expanded={notificationPanelOpen}
          >
            <Bell size={16} className="text-gray-500 dark:text-gray-400" />
            {notificationsEnabled && unreadCount > 0 ? (
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-gray-900 dark:bg-white"></span>
            ) : null}
          </Button>
          {notificationPanelOpen ? (
            <div className="absolute right-0 top-[calc(100%+14px)] z-40">
              <NotificationPanel
                items={notifications}
                unreadCount={unreadCount}
                notificationsEnabled={notificationsEnabled}
                onMarkRead={onMarkNotificationRead}
                onMarkAllRead={onMarkAllNotificationsRead}
                onNavigate={onNavigateFromNotification}
                onOpenSettings={onOpenSettings}
              />
            </div>
          ) : null}
        </div>
      </div>
    </header>
  )
}
