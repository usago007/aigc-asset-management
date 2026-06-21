import { Boxes, FileStack, Network } from 'lucide-react'
import { useAppStore } from '@/store/appStore'
import { DashboardFrame, DecisionNote, DistributionRow, EmptyInsight, InsightPanel, Metric } from './DashboardUI'

const typeLabels: Record<string, string> = { Image: '图片', Video: '视频', Script: '脚本' }
const sourceLabels: Record<string, string> = { 'image-task': '图片生成', 'video-task': '视频生成', script: '脚本创作' }

export default function DashboardAssets() {
  const { assets, projects, shots } = useAppStore()
  const typeCounts = assets.reduce<Record<string, number>>((result, asset) => { result[asset.type] = (result[asset.type] || 0) + 1; return result }, {})
  const sourceCounts = assets.reduce<Record<string, number>>((result, asset) => { result[asset.sourceType] = (result[asset.sourceType] || 0) + 1; return result }, {})
  const linkedAssets = assets.filter(asset => asset.projectId || asset.shotId)
  const lineageAssets = assets.filter(asset => asset.parentAssetIds.length > 0)
  const orphanAssets = assets.filter(asset => !asset.projectId && !asset.shotId)
  const linkRate = assets.length ? Math.round(linkedAssets.length / assets.length * 100) : 0
  const lineageRate = assets.length ? Math.round(lineageAssets.length / assets.length * 100) : 0
  const latest = [...assets].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 6)

  return (
    <DashboardFrame title="资产价值不在数量，而在可追溯与可复用" description="从媒体类型、生产来源、业务关联和血缘关系四个维度衡量资产沉淀质量。" signal={orphanAssets.length ? `${orphanAssets.length} 个资产尚未关联项目或镜头` : '全部资产均已进入可追溯的业务上下文'}>
      <div className="dashboard-metrics-grid">
        <Metric label="资产总量" value={assets.length} detail="当前工作区图片、视频与脚本的去重实体数" />
        <Metric label="业务关联率" value={linkRate} unit="%" detail={`关联项目或镜头的资产：${linkedAssets.length} / ${assets.length}`} tone="signal" />
        <Metric label="血缘覆盖率" value={lineageRate} unit="%" detail="存在 parentAssetIds 的资产，可追溯衍生关系" />
        <Metric label="孤立资产" value={orphanAssets.length} detail="未绑定 projectId 且未绑定 shotId" tone={orphanAssets.length ? 'warning' : 'default'} />
      </div>
      <div className="dashboard-content-grid">
        <InsightPanel className="xl:col-span-6" eyebrow="LIBRARY / FORMAT" title="资产形态构成" description="颗粒度：单个资产实体；用于判断媒体库内容结构。" icon={Boxes}>
          {Object.entries(typeLabels).map(([type, label]) => <DistributionRow key={type} label={label} value={typeCounts[type] || 0} total={assets.length} note={`${type} 类型`} />)}
        </InsightPanel>
        <InsightPanel className="xl:col-span-6" eyebrow="LINEAGE / SOURCE" title="生产来源构成" description="来源描述资产如何产生，不代表文件格式。" icon={Network}>
          {Object.entries(sourceLabels).map(([source, label]) => <DistributionRow key={source} label={label} value={sourceCounts[source] || 0} total={assets.length} note={source} />)}
        </InsightPanel>
        <InsightPanel className="xl:col-span-8" eyebrow="RECENT / ASSET" title="最近沉淀的资产" description="按 createdAt 降序；用于快速确认最新产出是否进入资产库。" icon={FileStack}>
          {latest.length ? <div className="dashboard-data-list">{latest.map(asset => (
            <div className="dashboard-data-row" key={asset.id}><strong>{asset.assetName}</strong><span>{typeLabels[asset.type]} · {asset.modelName}</span><span>{asset.projectId ? '项目已关联' : asset.shotId ? '镜头已关联' : '待关联'}</span></div>
          ))}</div> : <EmptyInsight>资产库为空。完成生成并保存结果后，这里会形成沉淀记录。</EmptyInsight>}
        </InsightPanel>
        <InsightPanel className="xl:col-span-4" eyebrow="ACTION / GOVERNANCE" title="资产治理建议" description="把统计转换成可执行的治理优先级。">
          <div className="space-y-3">
            <DecisionNote title={`先处理 ${orphanAssets.length} 个孤立资产`} to="/content/assets">补齐项目或镜头关系，避免资产脱离业务语境。</DecisionNote>
            <DecisionNote title={`${lineageAssets.length} 个资产具备衍生血缘`}>血缘可用于版本回溯、素材复用与版权解释。</DecisionNote>
            <DecisionNote title={`覆盖 ${projects.length} 项目 / ${shots.length} 镜头`}>关联率比资产总量更能反映资产库成熟度。</DecisionNote>
          </div>
        </InsightPanel>
      </div>
    </DashboardFrame>
  )
}
