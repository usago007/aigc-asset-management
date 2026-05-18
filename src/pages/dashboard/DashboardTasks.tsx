import { useState, useEffect } from 'react'
import { useAppStore } from '@/store/appStore'
import { BarChart3, Layers, AlertCircle, UserCheck } from 'lucide-react'
import { PageIntro, PageSection, PageShell } from '@/components/PageShell'

function MiniStatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <span className={`text-3xl font-bold ${color}`}>{value}</span>
      <span className="helper-text mt-1">{label}</span>
    </div>
  )
}

function StatusRow({ label, value, total, colorClass }: { label: string; value: number; total: number; colorClass: string }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${colorClass}`} />
        <span className="panel-value">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div className={`h-full ${colorClass} rounded-full`} style={{ width: `${pct}%` }} />
        </div>
        <span className="helper-text w-16 text-right">{value} ({pct}%)</span>
      </div>
    </div>
  )
}

const TASK_STATUS_LABELS: Record<string, string> = {
  Pending: '待处理',
  InProgress: '进行中',
  Completed: '已完成',
}

const TASK_STATUS_COLORS: Record<string, string> = {
  Pending: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  InProgress: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
}

export default function DashboardTasks() {
  const { tasks } = useAppStore()
  const [lastUpdated, setLastUpdated] = useState(() => {
    const now = new Date()
    return now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  })

  useEffect(() => {
    setLastUpdated(new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
  }, [tasks.length])

  const statusCounts: Record<string, number> = { Pending: 0, InProgress: 0, Completed: 0 }
  tasks.forEach(t => { statusCounts[t.status] = (statusCounts[t.status] || 0) + 1 })

  const typeCounts: Record<string, number> = {}
  tasks.forEach(t => { typeCounts[t.type] = (typeCounts[t.type] || 0) + 1 })

  const now = new Date().getTime()
  const overdueTasks = tasks.filter(t => {
    const deadline = new Date(t.deadline).getTime()
    return deadline < now && t.status !== 'Completed'
  }).sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())

  const workload: Record<string, { total: number; pending: number; inProgress: number }> = {}
  tasks.forEach(t => {
    if (!workload[t.assignedTo]) {
      workload[t.assignedTo] = { total: 0, pending: 0, inProgress: 0 }
    }
    workload[t.assignedTo].total += 1
    if (t.status === 'Pending') workload[t.assignedTo].pending += 1
    if (t.status === 'InProgress') workload[t.assignedTo].inProgress += 1
  })

  const workloadEntries = Object.entries(workload)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.total - a.total)

  const TYPE_COLORS: Record<string, string> = {
    '生成': 'bg-blue-500',
    '审核': 'bg-purple-500',
    '交付': 'bg-green-500',
  }

  return (
    <PageShell>
      <PageIntro eyebrow="仪表盘" title="任务概览" description={`任务管理与人员工作负载，最后更新 ${lastUpdated}`} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MiniStatCard label="总任务" value={tasks.length} color="text-gray-900 dark:text-white" />
        <MiniStatCard label="待处理" value={statusCounts.Pending} color="text-gray-500" />
        <MiniStatCard label="进行中" value={statusCounts.InProgress} color="text-blue-500" />
        <MiniStatCard label="已完成" value={statusCounts.Completed} color="text-green-500" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <PageSection>
          <h2 className="card-title mb-4 flex items-center gap-2">
            <BarChart3 size={18} className="text-blue-600 dark:text-blue-400" />
            任务状态分布
          </h2>
          <div className="space-y-1">
            {Object.entries(TASK_STATUS_LABELS).map(([status, label]) => (
              <StatusRow
                key={status}
                label={label}
                value={statusCounts[status] || 0}
                total={tasks.length}
                colorClass={status === 'Completed' ? 'bg-green-500' : status === 'InProgress' ? 'bg-blue-500' : 'bg-gray-400'}
              />
            ))}
          </div>
        </PageSection>

        <PageSection>
          <h2 className="card-title mb-4 flex items-center gap-2">
            <Layers size={18} className="text-purple-600 dark:text-purple-400" />
            任务类型分布
          </h2>
          <div className="space-y-3">
            {Object.entries(typeCounts).map(([type, count]) => (
              <div key={type}>
                <div className="mb-1 flex justify-between">
                  <span className="panel-value">{type}</span>
                  <span className="helper-text">{count}</span>
                </div>
                <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${TYPE_COLORS[type] || 'bg-gray-400'}`}
                    style={{ width: `${tasks.length > 0 ? (count / tasks.length) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </PageSection>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <PageSection>
          <h2 className="card-title mb-4 flex items-center gap-2">
            <AlertCircle size={18} className="text-red-500" />
            逾期任务 ({overdueTasks.length})
          </h2>
          {overdueTasks.length === 0 ? (
            <p className="body-muted py-4 text-center">暂无逾期任务</p>
          ) : (
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {overdueTasks.map(task => (
                <div key={task.id} className="flex items-center justify-between py-2 px-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-900/30">
                  <div>
                    <p className="panel-value font-medium text-gray-800 dark:text-gray-300">{task.taskName}</p>
                    <p className="helper-text">{task.assignedTo}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-red-500 dark:text-red-400">截止: {new Date(task.deadline).toLocaleDateString('zh-CN')}</span>
                    <span className={`block badge ${TASK_STATUS_COLORS[task.status] || 'badge'}`}>
                      {TASK_STATUS_LABELS[task.status] || task.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </PageSection>

        <PageSection>
          <h2 className="card-title mb-4 flex items-center gap-2">
            <UserCheck size={18} className="text-green-600 dark:text-green-400" />
            人员工作负载
          </h2>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {workloadEntries.map(person => (
              <div key={person.name} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800">
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">{person.name.charAt(0)}</span>
                  </div>
                    <span className="panel-value">{person.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="helper-text">总计 <span className="panel-value font-semibold">{person.total}</span></span>
                  <span className="helper-text">待处理 <span className="panel-value font-semibold text-yellow-500">{person.pending}</span></span>
                  <span className="helper-text">进行中 <span className="panel-value font-semibold text-blue-500">{person.inProgress}</span></span>
                </div>
              </div>
            ))}
          </div>
        </PageSection>
      </div>
    </PageShell>
  )
}
