import { Clapperboard, PanelLeft, Sparkles } from 'lucide-react'
import VideoCreationWorkspace from '@/components/VideoCreationWorkspace'
import { PageIntro, PageSection, PageShell } from '@/components/PageShell'

export default function VideoGeneration() {
  return (
    <PageShell className="page-shell-workbench">
      <PageIntro
        eyebrow="内容中心"
        title="视频创作"
        description="围绕文生视频与首尾帧视频生成，统一管理上下文、参数和结果流转。"
      />

      <div className="summary-grid xl:grid-cols-3">
        <div className="summary-card">
          <div className="flex items-start gap-4">
            <div className="summary-icon">
              <Sparkles size={20} />
            </div>
            <div className="space-y-1">
              <p className="panel-title">主创意输入</p>
              <p className="body-muted">先输入视频文案，再根据模式决定是否补首帧或尾帧，让流程更像正式工作台。</p>
            </div>
          </div>
        </div>
        <div className="summary-card">
          <div className="flex items-start gap-4">
            <div className="summary-icon">
              <PanelLeft size={20} />
            </div>
            <div className="space-y-1">
              <p className="panel-title">参数与模式分区</p>
              <p className="body-muted">文生视频、首帧图生、首尾帧图生保留原能力，但布局更清晰，避免内容堆在中间。</p>
            </div>
          </div>
        </div>
        <div className="summary-card">
          <div className="flex items-start gap-4">
            <div className="summary-icon">
              <Clapperboard size={20} />
            </div>
            <div className="space-y-1">
              <p className="panel-title">任务与结果区</p>
              <p className="body-muted">生成中的任务、已完成结果和镜头设定动作继续沿用，但会在更宽的主工作区里展示。</p>
            </div>
          </div>
        </div>
      </div>

      <PageSection className="workspace-stage p-0">
        <div className="workspace-stage-header px-6 pt-6">
          <div className="space-y-2">
            <h2 className="workspace-stage-title">视频生成工作台</h2>
            <p className="body-muted max-w-3xl">
              这里继续使用现有的任务队列与结果卡能力，但页面本身改成更完整的大工作区，避免输入区、参数区和结果区过度集中。
            </p>
          </div>
          <div className="workspace-stage-meta">
            <span className="workspace-tag">提示词输入</span>
            <span className="workspace-tag">首帧/尾帧上传</span>
            <span className="workspace-tag">模式切换</span>
            <span className="workspace-tag">任务结果</span>
          </div>
        </div>
        <div className="grid gap-6 px-6 pb-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <VideoCreationWorkspace contextMode="global" />
          </div>
          <aside className="workspace-aside">
            <div className="workspace-note">
              <p className="field-label">模式说明</p>
              <p className="panel-title mt-2">不同模式不同输入</p>
              <p className="body-muted mt-2">
                文生视频无需上传图片；首帧图生要求首帧；首尾帧图生需要两端画面。页面现在会给出更明确的空间和提示。
              </p>
            </div>
            <div className="workspace-note">
              <p className="field-label">任务追踪</p>
              <p className="body-muted mt-2">
                活跃任务区保留生成状态、失败提示和取消动作；完成后可直接查看详情或设为镜头最终视频。
              </p>
            </div>
            <div className="workspace-note">
              <p className="field-label">当前目标</p>
              <p className="body-muted mt-2">
                这一轮只重做页面壳和空间秩序，不改任何视频生成参数契约，也不改变既有结果流转。
              </p>
            </div>
          </aside>
        </div>
      </PageSection>
    </PageShell>
  )
}
