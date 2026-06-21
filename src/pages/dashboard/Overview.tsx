import { AlertTriangle, ArrowUpRight, GitBranch, ScanLine } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useAppStore } from '@/store/appStore'
import { useGenerationStore } from '@/store/generationStore'
import { DashboardFrame, DecisionNote, DistributionRow, EmptyInsight, InsightPanel, Metric } from './DashboardUI'

const stageLabels: Record<string, string> = { Planning: '规划中', InProduction: '制作中', Review: '审核中', Completed: '已完成' }

export default function Overview() {
  const { projects, tasks, reviews, assets, shots, imageTasks } = useAppStore()
  const { tasks: videoTasks } = useGenerationStore()
  const activeProjects = projects.filter(project => project.stage !== 'Completed').length
  const highRisk = projects.filter(project => project.riskLevel === 'High')
  const pendingReviews = reviews.filter(review => review.status === 'Pending').length
  const activeGeneration = [...imageTasks, ...videoTasks].filter(task => ['submitting', 'in_queue', 'generating'].includes(task.status)).length
  const averageProgress = projects.length ? Math.round(projects.reduce((sum, project) => sum + project.progress, 0) / projects.length) : 0
  const linkedAssets = assets.filter(asset => asset.projectId || asset.shotId).length
  const assetLinkRate = assets.length ? Math.round((linkedAssets / assets.length) * 100) : 0
  const stageCounts = Object.keys(stageLabels).reduce<Record<string, number>>((result, stage) => {
    result[stage] = projects.filter(project => project.stage === stage).length
    return result
  }, {})
  const bottleneck = pendingReviews > activeGeneration ? '审核队列是当前主要阻塞点' : activeGeneration ? '生成队列是当前主要阻塞点' : '当前生产链路无显著积压'

  return (
    <DashboardFrame
      title="看见创意生产的真实脉搏"
      description="从项目、生成、资产到交付建立同一条业务观测链。所有指标基于当前工作区完整快照，不虚构时间趋势。"
      signal={bottleneck}
    >
      <div className="dashboard-metrics-grid">
        <Metric label="活跃项目" value={activeProjects} detail={`分母 ${projects.length} 个项目；排除已完成项目`} tone="signal" />
        <Metric label="平均项目进度" value={averageProgress} unit="%" detail="项目 progress 字段的算术平均值" />
        <Metric label="待审核节点" value={pendingReviews} detail={`基于 ${reviews.length} 条审核记录的 Pending 状态`} tone={pendingReviews ? 'warning' : 'default'} />
        <Metric label="高风险项目" value={highRisk.length} detail="风险等级为 High 的项目，需要优先介入" tone={highRisk.length ? 'danger' : 'default'} />
      </div>

      <div className="dashboard-content-grid">
        <InsightPanel className="xl:col-span-7" eyebrow="FLOW / PROJECT" title="项目在生产链中的位置" description="颗粒度：单个项目；用于判断资源集中在哪个阶段。" icon={GitBranch}>
          <div className="space-y-1">
            {Object.entries(stageLabels).map(([stage, label]) => <DistributionRow key={stage} label={label} value={stageCounts[stage]} total={projects.length} note={`${stageCounts[stage]} 个项目`} />)}
          </div>
        </InsightPanel>

        <InsightPanel className="xl:col-span-5" eyebrow="SIGNAL / ATTENTION" title="需要现在处理的信号" description="仅展示可触发行动的异常，不把普通统计伪装成洞察。" icon={ScanLine}>
          <div className="space-y-3">
            <DecisionNote title={`${pendingReviews} 个审核节点等待处理`} to="/projects/reviews">审核积压会直接延迟资产定版与交付。</DecisionNote>
            <DecisionNote title={`${activeGeneration} 个生成任务正在流转`} to="/dashboard/generation">覆盖提交、排队和生成中三个队列状态。</DecisionNote>
            <DecisionNote title={`${assetLinkRate}% 资产已建立业务关联`} to="/dashboard/assets">关联到项目或镜头的资产才具备可追溯和复用价值。</DecisionNote>
          </div>
        </InsightPanel>

        <InsightPanel className="xl:col-span-12" eyebrow="RISK / PROJECT" title="项目风险雷达" description="颗粒度：高风险项目；优先查看负责人、当前阶段和实际进度。" icon={AlertTriangle}>
          {highRisk.length ? <div className="dashboard-risk-grid">{highRisk.map(project => (
            <article className="dashboard-risk-card" key={project.id}>
              <div className="dashboard-risk-card-top">
                <span className="dashboard-risk-badge">高风险</span>
                <span className="dashboard-risk-stage">{stageLabels[project.stage]}</span>
              </div>
              <h3>{project.projectName}</h3>
              <div className="dashboard-risk-meta">
                <span className="dashboard-owner-mark">{project.projectOwner.slice(0, 1)}</span>
                <span><small>负责人</small>{project.projectOwner}</span>
                <strong>{project.progress}%</strong>
              </div>
              <div className="dashboard-risk-progress"><span style={{ transform: `scaleX(${project.progress / 100})` }} /></div>
            </article>
          ))}</div> : <EmptyInsight>当前没有高风险项目。仍建议持续观察审核积压与生成失败。</EmptyInsight>}
          <footer className="dashboard-coverage-row">
            <p>数据覆盖 <strong>{projects.length}</strong> 项目 · <strong>{shots.length}</strong> 镜头 · <strong>{assets.length}</strong> 资产 · <strong>{tasks.length}</strong> 任务</p>
            <NavLink to="/projects/projects">查看全部项目 <ArrowUpRight size={14} /></NavLink>
          </footer>
        </InsightPanel>
      </div>
    </DashboardFrame>
  )
}
