import { useAppStore } from '@/store/appStore'
import { useGenerationStore } from '@/store/generationStore'
import { BarChart3, Clock, AlertTriangle, TrendingUp, FolderTree, FileText, ClipboardCheck, Users, Tags, Video, Image as ImageIcon, Loader2 } from 'lucide-react'

function getRelativeTime(dateStr: string): string {
  const now = new Date().getTime()
  const date = new Date(dateStr).getTime()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffMins < 1) return '刚刚'
  if (diffMins < 60) return `${diffMins}分钟前`
  if (diffHours < 24) return `${diffHours}小时前`
  return `${diffDays}天前`
}

const STAGE_LABELS: Record<string, string> = {
  Planning: '规划中',
  InProduction: '制作中',
  Review: '审核中',
  Completed: '已完成',
}

function StatCard({ label, value, icon: Icon, color, bg }: { label: string; value: number; icon: React.ElementType; color: string; bg: string }) {
  return (
    <div className="card">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg ${bg}`}>
          <Icon size={24} className={color} />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
          <p className="text-sm text-gray-600 dark:text-gray-500">{label}</p>
        </div>
      </div>
    </div>
  )
}

function ProgressBar({ value, max, label, colorClass }: { value: number; max: number; label: string; colorClass: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-700 dark:text-gray-300 w-16 shrink-0">{label}</span>
      <div className="flex-1 h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-sm text-gray-500 dark:text-gray-400 w-10 text-right">{value}</span>
    </div>
  )
}

export default function Overview() {
  const { customers, brands, projects, shots, assets, reviews, imageTasks, tasks } = useAppStore()
  const { tasks: videoTasks } = useGenerationStore()

  const pendingReviews = reviews.filter(r => r.status === 'Pending').length
  const generatingCount = [...imageTasks, ...videoTasks].filter(t => t.status === 'generating' || t.status === 'in_queue' || t.status === 'submitting').length

  const stats = [
    { label: '客户', value: customers.length, icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: '品牌', value: brands.length, icon: Tags, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { label: '项目', value: projects.length, icon: FolderTree, color: 'text-green-400', bg: 'bg-green-400/10' },
    { label: '镜头', value: shots.length, icon: Video, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
    { label: '资产', value: assets.length, icon: ImageIcon, color: 'text-pink-400', bg: 'bg-pink-400/10' },
    { label: '待审核', value: pendingReviews, icon: ClipboardCheck, color: 'text-accent-500', bg: 'bg-accent-500/10' },
    { label: '生成中', value: generatingCount, icon: Loader2, color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
  ]

  const stageCounts: Record<string, number> = { Planning: 0, InProduction: 0, Review: 0, Completed: 0 }
  projects.forEach(p => { stageCounts[p.stage] = (stageCounts[p.stage] || 0) + 1 })
  const totalProjects = projects.length

  const highRiskProjects = projects.filter(p => p.riskLevel === 'High')

  type ActivityItem = { time: string; label: string; icon: React.ElementType; color: string }
  const activities: ActivityItem[] = [
    ...projects.map(p => ({ time: p.createdAt, label: `项目创建: ${p.projectName}`, icon: FolderTree, color: 'text-green-400' })),
    ...tasks.map(t => ({ time: t.createdAt, label: `任务创建: ${t.taskName}`, icon: FileText, color: 'text-blue-400' })),
    ...reviews.map(r => ({ time: r.createdAt, label: `审核: ${r.reviewer} - ${r.status === 'Approved' ? '通过' : r.status === 'Rejected' ? '拒绝' : '待审核'}`, icon: ClipboardCheck, color: 'text-yellow-400' })),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-gray-100">总览</h1>
        <p className="text-gray-500 mt-1">AIGC数字资产管理系统概览</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return <StatCard key={stat.label} {...stat} />
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <BarChart3 size={18} className="text-accent-500" />
            项目阶段分布
          </h2>
          <div className="space-y-3">
            {Object.entries(STAGE_LABELS).map(([stage, label]) => (
              <ProgressBar
                key={stage}
                value={stageCounts[stage] || 0}
                max={totalProjects}
                label={label}
                colorClass={stage === 'Completed' ? 'bg-green-500' : stage === 'InProduction' ? 'bg-yellow-500' : stage === 'Review' ? 'bg-purple-500' : 'bg-blue-500'}
              />
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <AlertTriangle size={18} className="text-red-500" />
            风险预警
          </h2>
          {highRiskProjects.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">暂无高风险项目</p>
          ) : (
            <div className="space-y-3">
              {highRiskProjects.map(project => (
                <div key={project.id} className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-800 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-300">{project.projectName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{project.projectOwner}</p>
                  </div>
                  <span className="badge badge-error">高风险</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <Clock size={18} className="text-blue-400" />
            近期活动
          </h2>
          <div className="space-y-3">
            {activities.map((activity, idx) => {
              const Icon = activity.icon
              return (
                <div key={idx} className="flex items-start gap-3">
                  <div className={`p-1.5 rounded-full bg-gray-100 dark:bg-gray-800 mt-0.5`}>
                    <Icon size={14} className={activity.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 dark:text-gray-300 truncate">{activity.label}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{getRelativeTime(activity.time)}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-green-400" />
            项目进度
          </h2>
          <div className="space-y-3">
            {projects.slice(0, 5).map(project => (
              <div key={project.id}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-800 dark:text-gray-300">{project.projectName}</span>
                  <span className="text-gray-600 dark:text-gray-500">{project.progress}%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent-500 rounded-full transition-all duration-300"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
