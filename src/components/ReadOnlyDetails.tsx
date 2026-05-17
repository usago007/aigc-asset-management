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
    <section className="space-y-3">
      {title && <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</h3>}
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
      <div className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</div>
      <div className="mt-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-200">
        {typeof displayValue === 'string'
          ? <div className="whitespace-pre-wrap break-words">{displayValue}</div>
          : displayValue}
      </div>
    </div>
  )
}
