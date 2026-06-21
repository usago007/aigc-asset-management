import { AlertCircle, Gauge, UsersRound } from 'lucide-react'
import { useAppStore } from '@/store/appStore'
import { DashboardFrame, DecisionNote, DistributionRow, EmptyInsight, InsightPanel, Metric } from './DashboardUI'

const statusLabels: Record<string, string> = { Pending: '待处理', InProgress: '进行中', Completed: '已完成' }

export default function DashboardTasks() {
  const { tasks } = useAppStore()
  const now = Date.now()
  const statusCounts = tasks.reduce<Record<string, number>>((result, task) => { result[task.status] = (result[task.status] || 0) + 1; return result }, {})
  const overdue = tasks.filter(task => task.status !== 'Completed' && new Date(task.deadline).getTime() < now).sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
  const completed = statusCounts.Completed || 0
  const completionRate = tasks.length ? Math.round(completed / tasks.length * 100) : 0
  const workload = Object.values(tasks.reduce<Record<string, { name: string; total: number; open: number; overdue: number }>>((result, task) => {
    const person = result[task.assignedTo] || { name: task.assignedTo, total: 0, open: 0, overdue: 0 }
    person.total += 1
    if (task.status !== 'Completed') person.open += 1
    if (task.status !== 'Completed' && new Date(task.deadline).getTime() < now) person.overdue += 1
    result[task.assignedTo] = person
    return result
  }, {})).sort((a, b) => b.open - a.open)
  const overloaded = workload.filter(person => person.open >= 3 || person.overdue > 0)
  const averageOpen = workload.length ? (workload.reduce((sum, person) => sum + person.open, 0) / workload.length).toFixed(1) : '0.0'
  const typeCounts = tasks.reduce<Record<string, number>>((result, task) => { result[task.type] = (result[task.type] || 0) + 1; return result }, {})

  return (
    <DashboardFrame title="让交付节奏变得可预测" description="从任务状态、截止日期、人员负载和任务类型四个维度定位真正的交付阻塞。" signal={overdue.length ? `${overdue.length} 个未完成任务已越过截止日期` : '当前没有逾期任务，交付节奏处于可控区间'}>
      <div className="dashboard-metrics-grid">
        <Metric label="任务总量" value={tasks.length} detail="当前工作区全部生成、审核与交付任务" />
        <Metric label="完成率" value={completionRate} unit="%" detail={`已完成 ${completed} / 全部 ${tasks.length}`} tone="signal" />
        <Metric label="逾期任务" value={overdue.length} detail="deadline 早于当前时间且状态未完成" tone={overdue.length ? 'danger' : 'default'} />
        <Metric label="人均开放任务" value={averageOpen} detail={`开放任务 / ${workload.length} 名已分配人员`} />
      </div>
      <div className="dashboard-content-grid">
        <InsightPanel className="xl:col-span-7" eyebrow="FLOW / DELIVERY" title="任务状态与工作类型" description="状态看流转，类型看工作构成；两者是不同分析维度。" icon={Gauge}>
          <div className="grid gap-x-8 md:grid-cols-2">
            <div>{Object.entries(statusLabels).map(([status, label]) => <DistributionRow key={status} label={label} value={statusCounts[status] || 0} total={tasks.length} />)}</div>
            <div>{['生成', '审核', '交付'].map(type => <DistributionRow key={type} label={type} value={typeCounts[type] || 0} total={tasks.length} />)}</div>
          </div>
        </InsightPanel>
        <InsightPanel className="xl:col-span-5" eyebrow="LOAD / PEOPLE" title="人员开放负载" description="颗粒度：负责人；开放任务包含待处理与进行中。" icon={UsersRound}>
          {workload.length ? <div className="dashboard-data-list">{workload.slice(0, 7).map(person => (
            <div className="dashboard-data-row" key={person.name}><strong>{person.name}</strong><span>总计 {person.total}</span><span className={person.overdue ? 'text-red-500' : ''}>开放 {person.open} · 逾期 {person.overdue}</span></div>
          ))}</div> : <EmptyInsight>尚无已分配任务。</EmptyInsight>}
        </InsightPanel>
        <InsightPanel className="xl:col-span-8" eyebrow="RISK / DEADLINE" title="逾期任务明细" description="按最早截止日期排序；应优先处理最早逾期项。" icon={AlertCircle}>
          {overdue.length ? <div className="dashboard-data-list">{overdue.slice(0, 8).map(task => (
            <div className="dashboard-data-row" key={task.id}><strong>{task.taskName}</strong><span>{task.assignedTo} · {task.type}</span><span>{new Date(task.deadline).toLocaleDateString('zh-CN')}</span></div>
          ))}</div> : <EmptyInsight>没有逾期任务。</EmptyInsight>}
        </InsightPanel>
        <InsightPanel className="xl:col-span-4" eyebrow="ACTION / CAPACITY" title="调度建议" description="基于当前快照给出可执行判断，不预测未来工期。">
          <div className="space-y-3">
            <DecisionNote title={`${overloaded.length} 人需要关注`} to="/projects/tasks">判定条件：开放任务不少于 3 个，或存在逾期。</DecisionNote>
            <DecisionNote title={`${statusCounts.Pending || 0} 个任务尚未开始`}>待处理任务是下一轮资源分配的直接输入。</DecisionNote>
            <DecisionNote title={`${statusCounts.InProgress || 0} 个任务正在执行`}>结合逾期明细判断是否需要调整负责人或截止日期。</DecisionNote>
          </div>
        </InsightPanel>
      </div>
    </DashboardFrame>
  )
}
