import { Cpu, Gauge, Workflow } from 'lucide-react'
import { useAppStore } from '@/store/appStore'
import { useGenerationStore } from '@/store/generationStore'
import { DashboardFrame, DecisionNote, DistributionRow, EmptyInsight, InsightPanel, Metric } from './DashboardUI'

const statusLabels: Record<string, string> = { done: '已完成', generating: '生成中', in_queue: '排队中', submitting: '提交中', failed: '失败', cancelled: '已取消', expired: '已过期', not_found: '未找到' }
const formatTokens = (value: number) => value >= 1000 ? `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}K` : value.toLocaleString()

export default function Generation() {
  const { imageTasks, keyFrames, generationVersions } = useAppStore()
  const { tasks: videoTasks } = useGenerationStore()
  const queueTasks = [...imageTasks, ...videoTasks]
  const completedQueue = queueTasks.filter(task => task.status === 'done')
  const failedQueue = queueTasks.filter(task => task.status === 'failed')
  const queueSuccessRate = completedQueue.length + failedQueue.length ? Math.round(completedQueue.length / (completedQueue.length + failedQueue.length) * 100) : 0
  const tokenTasks = completedQueue.filter(task => (task.tokensUsed ?? 0) > 0)
  const totalTokens = tokenTasks.reduce((sum, task) => sum + (task.tokensUsed ?? 0), 0)
  const averageTokens = tokenTasks.length ? Math.round(totalTokens / tokenTasks.length) : 0
  const modelUsage = [...keyFrames, ...generationVersions].reduce<Record<string, number>>((result, item) => {
    const model = `${item.modelName} ${item.modelVersion}`
    result[model] = (result[model] || 0) + 1
    return result
  }, {})
  const modelEntries = Object.entries(modelUsage).sort((a, b) => b[1] - a[1])
  const statusCounts = queueTasks.reduce<Record<string, number>>((result, task) => { result[task.status] = (result[task.status] || 0) + 1; return result }, {})
  const processing = queueTasks.filter(task => ['submitting', 'in_queue', 'generating'].includes(task.status)).length

  return (
    <DashboardFrame title="把 AI 生成从黑盒变成可管理产能" description="区分任务队列口径与生成版本口径，观察成功率、失败、模型集中度和 Token 成本。" signal={failedQueue.length ? `${failedQueue.length} 个失败任务需要检查提示词或模型配置` : '当前任务队列未发现失败信号'}>
      <div className="dashboard-metrics-grid">
        <Metric label="队列任务" value={queueTasks.length} detail={`${imageTasks.length} 图片 + ${videoTasks.length} 视频任务`} />
        <Metric label="结算成功率" value={queueSuccessRate} unit="%" detail="仅以已完成与失败任务为分母，排除进行中状态" tone="signal" />
        <Metric label="处理中" value={processing} detail="提交中、排队中与生成中的任务总和" tone={processing ? 'warning' : 'default'} />
        <Metric label="平均 Token" value={formatTokens(averageTokens)} detail={`仅统计 ${tokenTasks.length} 个带 Token 记录的已完成任务`} />
      </div>
      <div className="dashboard-content-grid">
        <InsightPanel className="xl:col-span-7" eyebrow="QUEUE / STATUS" title="生成任务漏斗" description="颗粒度：单个图片或视频生成任务；状态互斥。" icon={Workflow}>
          {queueTasks.length ? <div className="space-y-1">{Object.entries(statusLabels).filter(([status]) => statusCounts[status]).map(([status, label]) => <DistributionRow key={status} label={label} value={statusCounts[status]} total={queueTasks.length} />)}</div> : <EmptyInsight>尚无生成任务，提交首个任务后即可观察队列。</EmptyInsight>}
        </InsightPanel>
        <InsightPanel className="xl:col-span-5" eyebrow="COST / TOKEN" title="成本与质量判断" description="Token 只代表推理消耗，不直接等价于人民币成本。" icon={Gauge}>
          <div className="space-y-3">
            <DecisionNote title={`${formatTokens(totalTokens)} 累计 Token`}>来自已完成且返回 usage 的任务；未记录任务不参与统计。</DecisionNote>
            <DecisionNote title={`${failedQueue.length} 个失败任务`}>失败率应结合模型、模式与错误码继续下钻，不能只看总量。</DecisionNote>
            <DecisionNote title={`${generationVersions.length} 个生成版本`}>版本数量反映创意探索深度，不应与队列任务数混为一谈。</DecisionNote>
          </div>
        </InsightPanel>
        <InsightPanel className="xl:col-span-12" eyebrow="MODEL / ADOPTION" title="模型采用集中度" description="颗粒度：关键帧与生成版本；用于识别模型偏好，不代表调用成本。" icon={Cpu}>
          {modelEntries.length ? <div className="grid gap-x-8 lg:grid-cols-2">{modelEntries.slice(0, 8).map(([model, count]) => <DistributionRow key={model} label={model} value={count} total={keyFrames.length + generationVersions.length} />)}</div> : <EmptyInsight>当前关键帧与生成版本没有模型记录。</EmptyInsight>}
        </InsightPanel>
      </div>
    </DashboardFrame>
  )
}
