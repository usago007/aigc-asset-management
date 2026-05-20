import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type MediaResultRow = {
  label: string
  value: ReactNode
  multiline?: boolean
}

type MediaResultCardProps = {
  title: string
  subtitle: string
  badge?: ReactNode
  media: ReactNode
  rows?: MediaResultRow[]
  footer?: ReactNode
  reserveFooter?: boolean
  className?: string
  mediaClassName?: string
}

export default function MediaResultCard({
  title,
  subtitle,
  badge,
  media,
  rows = [],
  footer,
  reserveFooter = false,
  className,
  mediaClassName,
}: MediaResultCardProps) {
  return (
    <div className={cn('card flex h-full flex-col gap-4 p-4', className)}>
      <div className="flex min-h-[52px] items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="field-label">{title}</p>
          <h3 className="card-title line-clamp-2 text-[22px] leading-[1.25]">{subtitle}</h3>
        </div>
        {badge ? <div className="shrink-0">{badge}</div> : null}
      </div>

      <div className={cn('overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-800', mediaClassName)}>
        {media}
      </div>

      <dl className="space-y-2.5">
        {rows.map((row) => (
          <div
            key={`${title}-${row.label}`}
            className={cn(
              'border-t border-gray-100 pt-2.5 first:border-t-0 first:pt-0 dark:border-gray-800/80',
              row.multiline ? 'space-y-1.5' : 'grid grid-cols-[72px_minmax(0,1fr)] items-start gap-3',
            )}
          >
            <dt className="field-label leading-5">{row.label}</dt>
            <dd
              className={cn(
                'min-w-0 text-sm leading-6 text-gray-700 dark:text-gray-300',
                row.multiline ? 'line-clamp-2' : 'text-right font-medium text-gray-900 dark:text-gray-100',
              )}
            >
              {row.value}
            </dd>
          </div>
        ))}
      </dl>

      {footer || reserveFooter ? (
        <div
          className={cn(
            'mt-auto min-h-9 pt-3',
            footer ? 'flex items-end border-t border-gray-200 dark:border-gray-800' : undefined,
          )}
        >
          {footer}
        </div>
      ) : null}
    </div>
  )
}
