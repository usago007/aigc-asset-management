import { useMemo, type ReactNode } from 'react'

const CHINESE_MONTHS = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']

function formatChineseDate(dateStr: string): string {
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return '未知日期'
  return `${CHINESE_MONTHS[date.getMonth()]}${date.getDate()}日`
}

interface TimelineItem {
  id: string
  imageUrl: string
  videoUrl?: string
  prompt: string
  createdAt: string
  thumbnail?: string
  badge?: string
  badgeClassName?: string
  onOpen?: () => void
  onDownload?: () => void
  onDelete?: () => void
  action?: ReactNode
}

interface TimelineGroup {
  date: string
  items: TimelineItem[]
}

interface TimelineGridProps {
  items: TimelineItem[]
  onItemOpen?: (item: TimelineItem) => void
  onItemDownload?: (item: TimelineItem) => void
  onItemDelete?: (item: TimelineItem) => void
  emptyMessage?: string
  columns?: number
}

export default function TimelineGrid({
  items,
  onItemOpen,
  onItemDownload,
  onItemDelete,
  emptyMessage = '暂无作品',
  columns = 4,
}: TimelineGridProps) {
  const groupedItems = useMemo(() => {
    const groups: Map<string, TimelineItem[]> = new Map()

    items.forEach((item) => {
      const dateKey = formatChineseDate(item.createdAt) || '未知日期'
      if (!groups.has(dateKey)) {
        groups.set(dateKey, [])
      }
      groups.get(dateKey)!.push(item)
    })

    return Array.from(groups.entries()).map(([date, groupItems]) => ({
      date,
      items: groupItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    }))
  }, [items])

  if (groupedItems.length === 0) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400">{emptyMessage}</p>
        </div>
      </div>
    )
  }

  const columnClass = useMemo(() => {
    switch (columns) {
      case 2:
        return 'grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2'
      case 3:
        return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3'
      case 4:
      default:
        return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4'
    }
  }, [columns])

  return (
    <div className="space-y-8">
      {groupedItems.map((group) => (
        <div key={group.date}>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            {group.date}
          </h3>
          <div className={`grid gap-3 ${columnClass}`}>
            {group.items.map((item) => (
              <TimelineCard
                key={item.id}
                item={item}
                onOpen={onItemOpen}
                onDownload={onItemDownload}
                onDelete={onItemDelete}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function TimelineCard({
  item,
  onOpen,
  onDownload,
  onDelete,
}: {
  item: TimelineItem
  onOpen?: (item: TimelineItem) => void
  onDownload?: (item: TimelineItem) => void
  onDelete?: (item: TimelineItem) => void
}) {
  return (
    <div
      className="group relative rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 aspect-square cursor-pointer hover:ring-2 hover:ring-accent-500 transition-all hover:shadow-lg hover:shadow-accent-500/20"
      onClick={() => onOpen?.(item)}
    >
      <img
        src={item.imageUrl}
        alt={item.prompt}
        className="w-full h-full object-cover"
        loading="lazy"
      />

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
        {/* Badge */}
        {item.badge && (
          <div className="absolute top-2 left-2">
            <span className={`badge text-[10px] px-1.5 py-0.5 ${item.badgeClassName || 'badge-info'}`}>
              {item.badge}
            </span>
          </div>
        )}

        {/* Prompt preview */}
        <p className="text-xs text-white/90 line-clamp-2 mb-2">{item.prompt}</p>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {onOpen && (
            <button
              className="flex-1 py-1 bg-accent-500/30 hover:bg-accent-500/50 rounded text-xs text-white backdrop-blur-sm transition-colors border border-accent-500/20"
              onClick={(e) => { e.stopPropagation(); onOpen(item) }}
            >
              打开
            </button>
          )}
          {onDownload && (
            <button
              className="py-1 px-2 bg-accent-500/30 hover:bg-accent-500/50 rounded text-xs text-white backdrop-blur-sm transition-colors border border-accent-500/20"
              onClick={(e) => { e.stopPropagation(); onDownload(item) }}
            >
              下载
            </button>
          )}
          {onDelete && (
            <button
              className="py-1 px-2 bg-error/30 hover:bg-error/50 rounded text-xs text-white backdrop-blur-sm transition-colors border border-error/20"
              onClick={(e) => { e.stopPropagation(); onDelete(item) }}
            >
              删除
            </button>
          )}
          {item.action}
        </div>
      </div>
    </div>
  )
}
