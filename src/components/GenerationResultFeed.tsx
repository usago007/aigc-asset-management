import { Image as ImageIcon, MoreHorizontal, Pencil, Play, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

function formatChineseDate(dateStr: string): string {
  const date = new Date(dateStr)
  if (Number.isNaN(date.getTime())) return '未知日期'
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

export interface ResultFeedMediaItem {
  id: string
  type: 'image' | 'video'
  src?: string
  alt: string
  aspectRatio?: string
  labels?: string[]
  footerTag?: string
  onOpen?: () => void
}

export interface ResultFeedAction {
  label: string
  icon?: 'edit' | 'retry' | 'more'
  onClick: () => void
  variant?: 'outline' | 'secondary' | 'ghost'
}

export interface ResultFeedGroup {
  id: string
  createdAt: string
  description: string
  meta: string[]
  headerMedia?: Array<{
    id: string
    src: string
    alt: string
  }>
  media: ResultFeedMediaItem[]
  actions: ResultFeedAction[]
}

interface GenerationResultFeedProps {
  title: string
  count: number
  groups: ResultFeedGroup[]
  emptyMessage?: string
  variant?: 'default' | 'image-gallery' | 'video-stream'
}

const actionIconMap = {
  edit: Pencil,
  retry: RefreshCw,
  more: MoreHorizontal,
} as const

export default function GenerationResultFeed({
  title,
  count,
  groups,
  emptyMessage = '暂无生成结果',
  variant = 'default',
}: GenerationResultFeedProps) {
  const sortedGroups = [...groups].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  if (sortedGroups.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="panel-title text-gray-700 dark:text-gray-300">{title} ({count})</h3>
        <div className="empty-state">{emptyMessage}</div>
      </div>
    )
  }

  let lastDate = ''

  return (
    <div className="space-y-5">
      <h3 className="panel-title text-gray-700 dark:text-gray-300">{title} ({count})</h3>
      {sortedGroups.map((group) => {
        const dateLabel = formatChineseDate(group.createdAt)
        const showDate = dateLabel !== lastDate
        lastDate = dateLabel

        return (
          <div key={group.id} className="space-y-3">
            {showDate && <h4 className="text-3xl font-semibold tracking-[-0.05em] text-gray-950 dark:text-gray-50">{dateLabel}</h4>}
            <div className={cn(
              'space-y-4 rounded-[28px] border border-gray-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)] dark:border-gray-800 dark:bg-gray-900',
              (variant === 'image-gallery' || variant === 'video-stream') && 'space-y-3 border-0 bg-transparent p-0 shadow-none',
            )}>
              <div className={cn(
                'flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between',
                (variant === 'image-gallery' || variant === 'video-stream') && 'rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-[0_10px_28px_rgba(15,23,42,0.04)] dark:border-gray-800 dark:bg-gray-900',
              )}>
                <div className={cn(
                  'flex min-w-0 flex-1 gap-3',
                  variant === 'video-stream' ? 'items-start' : 'items-start',
                )}>
                  {variant === 'video-stream' && group.headerMedia?.length ? (
                    <div className="flex flex-shrink-0 items-center gap-1.5 pt-0.5">
                      {group.headerMedia.map((preview) => (
                        <div
                          key={preview.id}
                          className="h-10 w-10 overflow-hidden rounded-xl border border-gray-200 bg-gray-100 shadow-[0_4px_10px_rgba(15,23,42,0.06)] dark:border-gray-700 dark:bg-gray-900"
                        >
                          <img src={preview.src} alt={preview.alt} className="h-full w-full object-cover" loading="lazy" />
                        </div>
                      ))}
                    </div>
                  ) : null}
                  <p className={cn(
                    'body-text max-w-5xl leading-7 text-gray-700 dark:text-gray-300',
                    (variant === 'image-gallery' || variant === 'video-stream') && 'max-w-none flex-1 leading-8',
                  )}>
                    {group.description}
                  </p>
                </div>
                {group.meta.length > 0 && (
                  <div className={cn(
                    'flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-400 dark:text-gray-500 lg:justify-end',
                    (variant === 'image-gallery' || variant === 'video-stream') && 'gap-x-2 text-xs lg:justify-start',
                  )}>
                    {group.meta.map((item) => (
                      <span key={item} className="whitespace-nowrap">{item}</span>
                    ))}
                  </div>
                )}
              </div>

              <div
                className={cn(
                  'grid gap-1.5',
                  variant === 'video-stream'
                    ? 'max-w-[520px] grid-cols-1'
                    : group.media.length <= 1
                    ? 'max-w-[420px] grid-cols-1'
                    : group.media.length === 2
                      ? 'grid-cols-2'
                      : group.media.length === 3
                        ? 'grid-cols-3'
                        : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
                  variant === 'image-gallery' && 'gap-0.5 max-w-none justify-start',
                  variant === 'video-stream' && 'max-w-[520px] justify-start',
                )}
                style={
                  variant === 'image-gallery'
                    ? { gridTemplateColumns: `repeat(${Math.min(Math.max(group.media.length, 1), 4)}, minmax(0, 240px))` }
                    : undefined
                }
              >
                {group.media.map((item) => (
                  <MediaCard key={item.id} item={item} variant={variant} />
                ))}
              </div>

              <div className={cn(
                'flex flex-wrap items-center gap-2',
                (variant === 'image-gallery' || variant === 'video-stream') && 'pt-1',
              )}>
                {group.actions.map((action) => {
                  const Icon = action.icon ? actionIconMap[action.icon] : null
                  return (
                    <Button
                      key={action.label}
                      variant={action.variant ?? 'outline'}
                      size="sm"
                      className="gap-1.5"
                      onClick={action.onClick}
                    >
                      {Icon ? <Icon size={14} /> : null}
                      {action.label}
                    </Button>
                  )
                })}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function MediaCard({
  item,
  variant = 'default',
}: {
  item: ResultFeedMediaItem
  variant?: 'default' | 'image-gallery' | 'video-stream'
}) {
  const aspect = item.aspectRatio?.replace(':', '/')
  const isVideo = item.type === 'video'

  return (
    <button
      type="button"
      className={cn(
        'group relative overflow-hidden rounded-[22px] bg-gray-100 text-left transition-transform hover:-translate-y-0.5 dark:bg-gray-950',
        variant === 'image-gallery' && 'rounded-[18px] aspect-square',
        variant === 'video-stream' && 'rounded-[20px] border border-gray-200 bg-white p-2 shadow-[0_12px_28px_rgba(15,23,42,0.05)] dark:border-gray-800 dark:bg-gray-900',
      )}
      onClick={item.onOpen}
      style={{
        aspectRatio:
          variant === 'image-gallery'
            ? '1 / 1'
            : variant === 'video-stream'
              ? aspect || '16 / 9'
              : aspect || (isVideo ? '16 / 9' : '1 / 1'),
      }}
    >
      {item.src ? (
        isVideo ? (
          <video
            src={item.src}
            className={cn(
              'h-full w-full object-cover',
              variant === 'video-stream' && 'rounded-[16px]',
            )}
            muted
          />
        ) : (
          <img src={item.src} alt={item.alt} className="h-full w-full object-cover" loading="lazy" />
        )
      ) : (
        <div className={cn(
          'flex h-full w-full items-center justify-center bg-gray-100 text-gray-400 dark:bg-gray-900 dark:text-gray-600',
          variant === 'video-stream' && 'rounded-[16px]',
        )}>
          {isVideo ? <Play size={30} /> : <ImageIcon size={30} />}
        </div>
      )}

      {item.labels?.length ? (
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {item.labels.map((label) => (
            <span
              key={label}
              className="inline-flex items-center rounded-full bg-black/70 px-2 py-1 text-[10px] font-medium text-white backdrop-blur-sm dark:bg-white/80 dark:text-gray-950"
            >
              {label}
            </span>
          ))}
        </div>
      ) : null}

      {item.footerTag ? (
        <div className="absolute bottom-3 right-3 rounded-full bg-black/75 px-2 py-1 text-[10px] font-medium text-white backdrop-blur-sm dark:bg-white/80 dark:text-gray-950">
          {item.footerTag}
        </div>
      ) : null}
    </button>
  )
}
