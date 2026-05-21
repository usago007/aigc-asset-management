import { useState, useEffect } from 'react'
import { useAppStore } from '@/store/appStore'
import { Video, PieChart, Activity, FileText, Image } from 'lucide-react'
import { PageIntro, PageSection, PageShell } from '@/components/PageShell'

function MiniStatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="dashboard-stat-card">
      <span className="dashboard-stat-value">{value}</span>
      <span className="helper-text mt-1">{label}</span>
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

  const sortedAssets = [...assets].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5)

  const TYPE_ICONS: Record<string, React.ElementType> = {
    Image: Image,
    Video: Video,
    Script: FileText,
  }

  const TYPE_COLORS: Record<string, string> = {
    Image: 'dashboard-category-icon-blue',
    Video: 'dashboard-category-icon-purple',
    Script: 'dashboard-category-icon-green',
  }

  return (
    <PageShell>
      <PageIntro title="资产概览" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MiniStatCard label="总资产" value={totalAssets} />
        <MiniStatCard label="图片" value={typeCounts.Image} />
        <MiniStatCard label="视频" value={typeCounts.Video} />
        <MiniStatCard label="脚本" value={typeCounts.Script} />
      </div>

      <PageSection>
        <h2 className="card-title mb-4 flex items-center gap-2">
          <PieChart size={18} className="dashboard-category-icon-blue" />
          资产类型分布
        </h2>
        <div className="space-y-3">
          {Object.entries(typeCounts).map(([type, count]) => (
            <div key={type}>
              <div className="mb-1 flex justify-between">
                <span className="panel-value">{type}</span>
                <span className="helper-text">{count} ({totalAssets > 0 ? Math.round((count / totalAssets) * 100) : 0}%)</span>
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
      </PageSection>

      <PageSection>
        <h2 className="card-title mb-4 flex items-center gap-2">
          <Activity size={18} className="text-gray-700 dark:text-gray-300" />
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
                    <p className="panel-value font-medium text-gray-800 dark:text-gray-300">{asset.assetName}</p>
                    <p className="helper-text">{getRelativeTime(asset.createdAt)}</p>
                  </div>
                </div>
                <span className="helper-text">{asset.type}</span>
              </div>
            )
          })}
        </div>
      </PageSection>
    </PageShell>
  )
}
