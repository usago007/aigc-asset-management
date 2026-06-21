import { Activity, Boxes, GitBranch, Radio } from 'lucide-react'

export default function CreationTelemetry({
  medium,
  mode,
  activeCount,
  resultCount,
  contextLabel,
}: {
  medium: '图片' | '视频'
  mode: string
  activeCount: number
  resultCount: number
  contextLabel: string
}) {
  return (
    <section className="creation-telemetry" aria-label="创作运行态势">
      <div className="creation-telemetry-primary">
        <span className={activeCount ? 'creation-signal-dot creation-signal-dot-active' : 'creation-signal-dot'} />
        <Radio size={14} strokeWidth={1.8} />
        <strong>{mode}</strong>
        <span className="creation-telemetry-divider" />
        <span>{medium}生成</span>
      </div>
      <div className="creation-telemetry-meta">
        <span><Activity size={13} />{activeCount ? `${activeCount} 个任务处理中` : '队列空闲'}</span>
        <span><Boxes size={13} />{resultCount} 条历史结果</span>
        <span><GitBranch size={13} />{contextLabel}</span>
      </div>
    </section>
  )
}
