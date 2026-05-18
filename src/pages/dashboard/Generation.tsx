import { useState, useEffect } from 'react'
import { useAppStore } from '@/store/appStore'
import { useGenerationStore } from '@/store/generationStore'
import { Image, Video, Layers, PieChart, Zap, ZapOff } from 'lucide-react'
import { PageIntro, PageSection, PageShell } from '@/components/PageShell'

function MiniStatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <span className={`text-3xl font-bold ${color}`}>{value}</span>
      <span className="helper-text mt-1">{label}</span>
    </div>
  )
}

function ProgressBar({ value, max, label, colorClass }: { value: number; max: number; label: string; colorClass: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="flex items-center gap-3">
      <span className="panel-value w-16 shrink-0">{label}</span>
      <div className="flex-1 h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="helper-text w-10 text-right">{value}</span>
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

const GEN_STATUS_LABELS: Record<string, string> = {
  done: '已完成',
  generating: '生成中',
  in_queue: '排队中',
  failed: '失败',
  cancelled: '已取消',
  expired: '已过期',
  submitting: '提交中',
  not_found: '未找到',
}

const GEN_STATUS_COLORS: Record<string, string> = {
  done: 'bg-green-500',
  generating: 'bg-blue-500',
  in_queue: 'bg-yellow-500',
  failed: 'bg-red-500',
  cancelled: 'bg-gray-400',
  expired: 'bg-gray-300',
  submitting: 'bg-purple-500',
  not_found: 'bg-gray-400',
}

export default function Generation() {
  const { imageTasks, keyFrames, generationVersions } = useAppStore()
  const { tasks: videoTasks } = useGenerationStore()
  const [lastUpdated, setLastUpdated] = useState(() => {
    const now = new Date()
    return now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  })

  useEffect(() => {
    setLastUpdated(new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
  }, [imageTasks.length, videoTasks.length, keyFrames.length, generationVersions.length])

  const imgStatusCounts: Record<string, number> = {}
  imageTasks.forEach(t => { imgStatusCounts[t.status] = (imgStatusCounts[t.status] || 0) + 1 })

  const vidStatusCounts: Record<string, number> = {}
  videoTasks.forEach(t => { vidStatusCounts[t.status] = (vidStatusCounts[t.status] || 0) + 1 })

  const allModelUsage: Record<string, number> = {}
  keyFrames.forEach(kf => {
    const key = `${kf.modelName} ${kf.modelVersion}`
    allModelUsage[key] = (allModelUsage[key] || 0) + 1
  })
  generationVersions.forEach(v => {
    const key = `${v.modelName} ${v.modelVersion}`
    allModelUsage[key] = (allModelUsage[key] || 0) + 1
  })

  const modelEntries = Object.entries(allModelUsage).sort((a, b) => b[1] - a[1])
  const maxModelCount = modelEntries.length > 0 ? modelEntries[0][1] : 1

  const totalGenerated = keyFrames.filter(kf => kf.status === 'Completed').length + generationVersions.filter(v => v.status === 'Completed').length
  const totalAll = keyFrames.length + generationVersions.length
  const successRate = totalAll > 0 ? Math.round((totalGenerated / totalAll) * 100) : 0

  const totalFailed = keyFrames.filter(kf => kf.status === 'Failed').length + generationVersions.filter(v => v.status === 'Failed').length
  const totalPending = keyFrames.filter(kf => kf.status === 'Pending').length + generationVersions.filter(v => v.status === 'Pending').length

  // 计算 token 消耗统计
  const totalTokensUsed = [
    ...imageTasks.filter(t => t.status === 'done' && t.tokensUsed && t.tokensUsed > 0),
    ...videoTasks.filter(t => t.status === 'done' && t.tokensUsed && t.tokensUsed > 0),
  ].reduce((sum, t) => sum + (t.tokensUsed ?? 0), 0)

  const completedTasksCount = imageTasks.filter(t => t.status === 'done' && t.tokensUsed && t.tokensUsed > 0).length +
    videoTasks.filter(t => t.status === 'done' && t.tokensUsed && t.tokensUsed > 0).length

  const avgTokens = completedTasksCount > 0 ? Math.round(totalTokensUsed / completedTasksCount) : 0

  // 格式化 token 数字为可读格式
  const formatTokens = (n: number): string => {
    if (n >= 1000) {
      return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K`
    }
    return n.toLocaleString()
  }

  const MODEL_COLORS = [
    'bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-yellow-500',
    'bg-pink-500', 'bg-cyan-500', 'bg-red-500', 'bg-indigo-500',
  ]

  return (
    <PageShell>
      <PageIntro eyebrow="仪表盘" title="生成概览" description={`图片与视频生成任务统计，最后更新 ${lastUpdated}`} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <MiniStatCard label="图片任务" value={imageTasks.length} color="text-blue-500" />
        <MiniStatCard label="视频任务" value={videoTasks.length} color="text-purple-500" />
        <MiniStatCard label="成功率" value={successRate} color="text-green-500" />
        <MiniStatCard label="生成失败" value={totalFailed} color="text-red-500" />
        <div className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-1 mb-1">
            <Zap size={16} className="text-yellow-500" />
            <span className="text-3xl font-bold text-yellow-500">{formatTokens(totalTokensUsed)}</span>
          </div>
          <span className="helper-text mt-1">总 Token 消耗</span>
        </div>
        <div className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-1 mb-1">
            <ZapOff size={16} className="text-cyan-500" />
            <span className="text-3xl font-bold text-cyan-500">{formatTokens(avgTokens)}</span>
          </div>
          <span className="helper-text mt-1">平均 Token 消耗</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <PageSection>
          <h2 className="card-title mb-4 flex items-center gap-2">
            <Image size={18} className="text-blue-600 dark:text-blue-400" />
            图片生成任务状态
          </h2>
          <div className="space-y-1">
            {Object.entries(GEN_STATUS_LABELS).map(([status, label]) => {
              const count = imgStatusCounts[status] || 0
              if (count === 0) return null
              return (
                <StatusRow
                  key={status}
                  label={label}
                  value={count}
                  total={imageTasks.length}
                  colorClass={GEN_STATUS_COLORS[status]}
                />
              )
            })}
          </div>
        </PageSection>

        <PageSection>
          <h2 className="card-title mb-4 flex items-center gap-2">
            <Video size={18} className="text-purple-600 dark:text-purple-400" />
            视频生成任务状态
          </h2>
          <div className="space-y-1">
            {Object.entries(GEN_STATUS_LABELS).map(([status, label]) => {
              const count = vidStatusCounts[status] || 0
              if (count === 0) return null
              return (
                <StatusRow
                  key={status}
                  label={label}
                  value={count}
                  total={videoTasks.length}
                  colorClass={GEN_STATUS_COLORS[status]}
                />
              )
            })}
          </div>
        </PageSection>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <PageSection>
          <h2 className="card-title mb-4 flex items-center gap-2">
            <Layers size={18} className="text-gray-700 dark:text-gray-300" />
            模型使用排行
          </h2>
          <div className="space-y-3">
            {modelEntries.slice(0, 8).map(([model, count], idx) => (
              <ProgressBar
                key={model}
                value={count}
                max={maxModelCount}
                label={model}
                colorClass={MODEL_COLORS[idx % MODEL_COLORS.length]}
              />
            ))}
          </div>
        </PageSection>

        <PageSection>
          <h2 className="card-title mb-4 flex items-center gap-2">
            <PieChart size={18} className="text-green-600 dark:text-green-400" />
            生成成功率概览
          </h2>
          <div className="flex items-center justify-center py-6">
            <div className="relative w-32 h-32">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" strokeWidth="3" className="text-gray-200 dark:text-gray-700" />
                <circle
                  cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" strokeWidth="3"
                  strokeDasharray={`${successRate}, 100`}
                  strokeLinecap="round"
                  className={successRate >= 80 ? 'text-green-500' : successRate >= 60 ? 'text-yellow-500' : 'text-red-500'}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{successRate}%</span>
                <span className="helper-text">成功率</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="metric-value text-green-500">{totalGenerated}</p>
              <p className="helper-text">已完成</p>
            </div>
            <div>
              <p className="metric-value text-red-500">{totalFailed}</p>
              <p className="helper-text">失败</p>
            </div>
            <div>
              <p className="metric-value text-yellow-500">{totalPending}</p>
              <p className="helper-text">待处理</p>
            </div>
          </div>
        </PageSection>
      </div>
    </PageShell>
  )
}
