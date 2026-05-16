import { useState, useEffect } from 'react'
import { useAppStore } from '@/store/appStore'
import { Video, PieChart, CheckCircle, Activity, FileText, Image } from 'lucide-react'

function MiniStatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <span className={`text-3xl font-bold ${color}`}>{value}</span>
      <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">{label}</span>
    </div>
  )
}

function StatusRow({ label, value, total, colorClass }: { label: string; value: number; total: number; colorClass: string }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${colorClass}`} />
        <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div className={`h-full ${colorClass} rounded-full`} style={{ width: `${pct}%` }} />
        </div>
        <span className="text-sm text-gray-500 dark:text-gray-400 w-16 text-right">{value} ({pct}%)</span>
      </div>
    </div>
  )
}

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

export default function DashboardAssets() {
  const { assets } = useAppStore()
  const [lastUpdated, setLastUpdated] = useState(() => {
    const now = new Date()
    return now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  })

  useEffect(() => {
    setLastUpdated(new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
  }, [assets.length])

  const typeCounts: Record<string, number> = { Image: 0, Video: 0, Script: 0 }
  assets.forEach(a => { typeCounts[a.type] = (typeCounts[a.type] || 0) + 1 })
  const totalAssets = assets.length

  const statusCounts: Record<string, number> = { Draft: 0, Final: 0, Approved: 0 }
  assets.forEach(a => { statusCounts[a.status] = (statusCounts[a.status] || 0) + 1 })

  const sortedAssets = [...assets].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5)

  const TYPE_ICONS: Record<string, React.ElementType> = {
    Image: Image,
    Video: Video,
    Script: FileText,
  }

  const TYPE_COLORS: Record<string, string> = {
    Image: 'text-blue-400',
    Video: 'text-purple-400',
    Script: 'text-green-400',
  }

  const STATUS_LABELS_ASSET: Record<string, string> = {
    Draft: '草稿',
    Final: '最终版',
    Approved: '已审核',
  }

  const STATUS_COLORS_ASSET: Record<string, string> = {
    Draft: 'badge-warning',
    Final: 'badge',
    Approved: 'badge-success',
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-baseline gap-4">
          <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-gray-100">资产</h1>
          <span className="text-xs text-gray-500 dark:text-gray-400">最后更新: {lastUpdated}</span>
        </div>
        <p className="text-gray-500 mt-1">资产类型与状态分布</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MiniStatCard label="总资产" value={totalAssets} color="text-accent-500" />
        <MiniStatCard label="图片" value={typeCounts.Image} color="text-blue-500" />
        <MiniStatCard label="视频" value={typeCounts.Video} color="text-purple-500" />
        <MiniStatCard label="脚本" value={typeCounts.Script} color="text-green-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <PieChart size={18} className="text-blue-400" />
            资产类型分布
          </h2>
          <div className="space-y-3">
            {Object.entries(typeCounts).map(([type, count]) => (
              <div key={type}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-800 dark:text-gray-300">{type}</span>
                  <span className="text-gray-600 dark:text-gray-500">{count} ({totalAssets > 0 ? Math.round((count / totalAssets) * 100) : 0}%)</span>
                </div>
                <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${type === 'Image' ? 'bg-blue-500' : type === 'Video' ? 'bg-purple-500' : 'bg-green-500'}`}
                    style={{ width: `${totalAssets > 0 ? (count / totalAssets) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <CheckCircle size={18} className="text-green-400" />
            资产状态分布
          </h2>
          <div className="space-y-1">
            {Object.entries(STATUS_LABELS_ASSET).map(([status, label]) => (
              <StatusRow
                key={status}
                label={label}
                value={statusCounts[status] || 0}
                total={totalAssets}
                colorClass={status === 'Approved' ? 'bg-green-500' : status === 'Final' ? 'bg-blue-500' : 'bg-gray-400'}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <Activity size={18} className="text-accent-500" />
          最新资产
        </h2>
        <div className="space-y-3">
          {sortedAssets.map(asset => {
            const Icon = TYPE_ICONS[asset.type] || FileText
            return (
              <div key={asset.id} className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-800 last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-gray-100 dark:bg-gray-800`}>
                    <Icon size={16} className={TYPE_COLORS[asset.type] || 'text-gray-400'} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-300">{asset.assetName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{getRelativeTime(asset.createdAt)}</p>
                  </div>
                </div>
                <span className={`badge ${STATUS_COLORS_ASSET[asset.status] || 'badge'}`}>
                  {STATUS_LABELS_ASSET[asset.status] || asset.status}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
