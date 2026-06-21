import type { ElementType, ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { Activity, ArrowUpRight, CircleDot, HelpCircle, Radio } from 'lucide-react'
import { cn } from '@/lib/utils'

const dashboardTabs = [
  { to: '/dashboard/overview', label: '经营态势', hint: '项目与风险' },
  { to: '/dashboard/generation', label: '生成质量', hint: '模型与成本' },
  { to: '/dashboard/assets', label: '资产复用', hint: '沉淀与关联' },
  { to: '/dashboard/tasks', label: '交付效能', hint: '任务与负载' },
]

export function DashboardFrame({
  title,
  description,
  signal,
  children,
}: {
  title: string
  description: string
  signal: string
  children: ReactNode
}) {
  return (
    <main className="dashboard-lab">
      <header className="dashboard-lab-hero">
        <div className="dashboard-lab-grid" aria-hidden="true" />
        <div className="dashboard-hero-copy">
          <div className="dashboard-live-label"><Radio size={13} /> 实时工作区快照</div>
          <h1 className="dashboard-lab-title">{title}</h1>
          <p className="dashboard-lab-description">{description}</p>
        </div>
        <div className="dashboard-signal-card">
          <div className="dashboard-signal-label"><Activity size={14} /> 当前经营信号</div>
          <p>{signal}</p>
          <span><CircleDot size={12} /> 基于当前工作区数据</span>
        </div>
      </header>

      <nav className="dashboard-tabs" aria-label="数据中心分析视图">
        {dashboardTabs.map((tab, index) => (
          <NavLink key={tab.to} to={tab.to} className={({ isActive }) => cn('dashboard-tab', isActive && 'dashboard-tab-active')}>
            <span className="dashboard-tab-index">0{index + 1}</span>
            <span><strong>{tab.label}</strong><small>{tab.hint}</small></span>
          </NavLink>
        ))}
      </nav>
      {children}
    </main>
  )
}

export function Metric({
  label,
  value,
  unit,
  detail,
  tone = 'default',
}: {
  label: string
  value: string | number
  unit?: string
  detail: string
  tone?: 'default' | 'signal' | 'warning' | 'danger'
}) {
  return (
    <article className={cn('dashboard-metric', `dashboard-metric-${tone}`)}>
      <div className="flex items-center justify-between gap-3">
        <p className="dashboard-metric-label">{label}</p>
        <HelpCircle size={14} className="text-gray-300 dark:text-gray-600" aria-hidden="true" />
      </div>
      <p className="dashboard-metric-value">{value}<span>{unit}</span></p>
      <p className="dashboard-metric-detail">{detail}</p>
    </article>
  )
}

export function InsightPanel({
  eyebrow,
  title,
  description,
  icon: Icon,
  children,
  className,
}: {
  eyebrow: string
  title: string
  description?: string
  icon?: ElementType
  children: ReactNode
  className?: string
}) {
  return (
    <section className={cn('dashboard-panel', className)}>
      <header className="dashboard-panel-header">
        <div>
          <p className="dashboard-panel-eyebrow">{eyebrow}</p>
          <h2>{title}</h2>
          {description ? <p>{description}</p> : null}
        </div>
        {Icon ? <div className="dashboard-panel-icon"><Icon size={18} strokeWidth={1.8} /></div> : null}
      </header>
      {children}
    </section>
  )
}

export function DistributionRow({ label, value, total, note }: { label: string; value: number; total: number; note?: string }) {
  const percent = total ? Math.round((value / total) * 100) : 0
  return (
    <div className="dashboard-distribution-row">
      <div className="flex items-end justify-between gap-4">
        <div><p>{label}</p>{note ? <span>{note}</span> : null}</div>
        <strong>{value}<small> / {percent}%</small></strong>
      </div>
      <div className="dashboard-track"><div style={{ transform: `scaleX(${percent / 100})` }} /></div>
    </div>
  )
}

export function DecisionNote({ title, children, to }: { title: string; children: ReactNode; to?: string }) {
  const content = (
    <div className="dashboard-decision-note">
      <span className="dashboard-pulse" />
      <div><strong>{title}</strong><p>{children}</p></div>
      {to ? <ArrowUpRight size={17} className="ml-auto shrink-0" /> : null}
    </div>
  )
  return to ? <NavLink to={to}>{content}</NavLink> : content
}

export function EmptyInsight({ children }: { children: ReactNode }) {
  return <div className="dashboard-empty">{children}</div>
}
