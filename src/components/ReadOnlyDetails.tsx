import type { ReactNode } from 'react'

interface ReadOnlySectionProps {
  title?: string
  children: ReactNode
}

interface ReadOnlyFieldProps {
  label: string
  value?: ReactNode
  span?: 'normal' | 'full'
  emptyText?: string
}

function isEmptyValue(value: ReactNode) {
  if (value === null || value === undefined) return true
  if (typeof value === 'string') return value.trim() === ''
  if (Array.isArray(value)) return value.length === 0
  return false
}

export function ReadOnlySection({ title, children }: ReadOnlySectionProps) {
  return (
    <section className="space-y-4">
      {title && <h3 className="section-title">{title}</h3>}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {children}
      </div>
    </section>
  )
}

export function ReadOnlyField({ label, value, span = 'normal', emptyText = '-' }: ReadOnlyFieldProps) {
  const displayValue = isEmptyValue(value) ? emptyText : value

    return (
    <div className={span === 'full' ? 'sm:col-span-2' : ''}>
      <div className="field-label mb-1">{label}</div>
      <div className="panel-value min-h-[48px] rounded-2xl border border-gray-200 bg-gray-50/80 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] dark:border-gray-800 dark:bg-gray-950">
        {typeof displayValue === 'string'
          ? <div className="whitespace-pre-wrap break-words">{displayValue}</div>
          : displayValue}
      </div>
    </div>
  )
}
