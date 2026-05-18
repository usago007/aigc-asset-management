import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function PageShell({
  children,
  className,
  narrow = false,
}: {
  children: ReactNode
  className?: string
  narrow?: boolean
}) {
  return (
    <div className={cn('page-shell', narrow && 'page-shell-narrow', className)}>
      {children}
    </div>
  )
}

export function PageIntro({
  title,
  description,
  actions,
  eyebrow,
}: {
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
  eyebrow?: ReactNode
}) {
  return (
    <section className="page-intro">
      <div className="space-y-2">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <div>
          <h1 className="page-title">{title}</h1>
          {description ? <p className="page-subtitle">{description}</p> : null}
        </div>
      </div>
      {actions ? <div className="page-intro-actions">{actions}</div> : null}
    </section>
  )
}

export function PageSection({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return <section className={cn('page-section', className)}>{children}</section>
}
