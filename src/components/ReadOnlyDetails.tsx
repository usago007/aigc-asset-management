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
      {title && <h3 className="card-title">{title}</h3>}
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
      <div className="eyebrow">{label}</div>
      <div className="surface-muted mt-1 px-3 py-2 body-text">
        {typeof displayValue === 'string'
          ? <div className="whitespace-pre-wrap break-words">{displayValue}</div>
          : displayValue}
      </div>
    </div>
  )
}
