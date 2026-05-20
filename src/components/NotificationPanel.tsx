import type { NotificationItem } from '@/types'
import { Button } from '@/components/ui/button'

const levelStyles = {
  info: 'bg-sky-50 text-sky-700 ring-1 ring-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:ring-sky-900',
  success: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:ring-emerald-900',
  warning: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:ring-amber-900',
  error: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:ring-rose-900',
} as const

const levelLabels = {
  info: '常规',
  success: '完成',
  warning: '待处理',
  error: '风险',
} as const

interface NotificationPanelProps {
  items: NotificationItem[]
  unreadCount: number
  notificationsEnabled: boolean
  onMarkRead: (id: string) => void
  onMarkAllRead: () => void
  onNavigate: (item: NotificationItem) => void
  onOpenSettings: () => void
}

export default function NotificationPanel({
  items,
  unreadCount,
  notificationsEnabled,
  onMarkRead,
  onMarkAllRead,
  onNavigate,
  onOpenSettings,
}: NotificationPanelProps) {
  return (
    <div className="notification-panel">
      <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-5 py-4 dark:border-gray-800">
        <div>
          <p className="panel-title">系统通知</p>
          <p className="body-muted mt-1">
            {notificationsEnabled ? `当前有 ${unreadCount} 条未读提醒` : '通知提醒已关闭，仍可查看历史通知'}
          </p>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={onMarkAllRead} disabled={unreadCount === 0}>
          全部已读
        </Button>
      </div>

      {!notificationsEnabled ? (
        <div className="border-b border-gray-200 bg-amber-50/80 px-5 py-3 dark:border-gray-800 dark:bg-amber-950/30">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="panel-title text-amber-800 dark:text-amber-200">通知已关闭</p>
              <p className="helper-text mt-1 text-amber-700 dark:text-amber-300">
                你仍可查看通知记录，但右上角不会再显示未读提醒红点。
              </p>
            </div>
            <Button type="button" variant="secondary" size="sm" onClick={onOpenSettings}>
              前往系统设置
            </Button>
          </div>
        </div>
      ) : null}

      <div className="max-h-[420px] overflow-y-auto px-3 py-3">
        {items.length === 0 ? (
          <div className="empty-state py-10">当前没有系统通知</div>
        ) : (
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.id}
                className={`rounded-2xl border p-4 transition-colors ${
                  item.read
                    ? 'border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950'
                    : 'border-gray-300 bg-gray-50/90 dark:border-gray-700 dark:bg-gray-900'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${levelStyles[item.level]}`}>
                    {levelLabels[item.level]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <button
                          type="button"
                          className="text-left"
                          onClick={() => onNavigate(item)}
                        >
                          <p className="panel-title transition-colors hover:text-gray-600 dark:hover:text-gray-300">
                            {item.title}
                          </p>
                        </button>
                        <p className="body-muted mt-1">{item.summary}</p>
                      </div>
                      {!item.read ? <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-gray-900 dark:bg-white" /> : null}
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <p className="meta-text">
                        {new Date(item.createdAt).toLocaleString('zh-CN')} · 前往 {item.targetLabel}
                      </p>
                      <div className="flex items-center gap-2">
                        {!item.read ? (
                          <Button type="button" variant="ghost" size="sm" onClick={() => onMarkRead(item.id)}>
                            标记已读
                          </Button>
                        ) : null}
                        <Button type="button" variant="secondary" size="sm" onClick={() => onNavigate(item)}>
                          查看
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
