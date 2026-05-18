import { Image as ImageIcon, SlidersHorizontal, Sparkles } from 'lucide-react'
import ImageCreationWorkspace from '@/components/ImageCreationWorkspace'
import { PageIntro, PageSection, PageShell } from '@/components/PageShell'

export default function ImageGeneration() {
  return (
    <PageShell className="page-shell-workbench">
      <PageIntro
        eyebrow="内容中心"
        title="图片创作"
        description="用统一的创作工作台管理提示词、参考图、参数配置与生成结果。"
      />

      <div className="summary-grid xl:grid-cols-3">
        <div className="summary-card">
          <div className="flex items-start gap-4">
            <div className="summary-icon">
              <Sparkles size={20} />
            </div>
            <div className="space-y-1">
              <p className="panel-title">主输入工作区</p>
              <p className="body-muted">围绕提示词、参考图和生成动作展开，先写需求再进入参数控制。</p>
            </div>
          </div>
        </div>
        <div className="summary-card">
          <div className="flex items-start gap-4">
            <div className="summary-icon">
              <SlidersHorizontal size={20} />
            </div>
            <div className="space-y-1">
              <p className="panel-title">模式与参数</p>
              <p className="body-muted">图片 4.0、图生图与 3.x 系列统一归到同一个参数面板里管理。</p>
            </div>
          </div>
        </div>
        <div className="summary-card">
          <div className="flex items-start gap-4">
            <div className="summary-icon">
              <ImageIcon size={20} />
            </div>
            <div className="space-y-1">
              <p className="panel-title">结果流与复用</p>
              <p className="body-muted">生成完成后直接查看详情、下载结果，或在镜头工作台里设为首图与尾图。</p>
            </div>
          </div>
        </div>
      </div>

      <PageSection className="workspace-stage p-0">
        <div className="workspace-stage-header px-6 pt-6">
          <div className="space-y-2">
            <h2 className="workspace-stage-title">图片生成工作台</h2>
            <p className="body-muted max-w-3xl">
              用更宽的工作区承接输入、参数和结果流。当前页面继续沿用既有生成逻辑，只重做页面编排与空间分配。
            </p>
          </div>
          <div className="workspace-stage-meta">
            <span className="workspace-tag">提示词输入</span>
            <span className="workspace-tag">参考图入口</span>
            <span className="workspace-tag">参数展开</span>
            <span className="workspace-tag">结果回流</span>
          </div>
        </div>
        <div className="grid gap-6 px-6 pb-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <ImageCreationWorkspace contextMode="global" />
          </div>
          <aside className="workspace-aside">
            <div className="workspace-note">
              <p className="field-label">工作区说明</p>
              <p className="panel-title mt-2">先写需求，再补参数</p>
              <p className="body-muted mt-2">
                主输入区优先承接创作意图，生成模式、分辨率和高级参数统一放在下方，避免页面一开始就被复杂配置打断。
              </p>
            </div>
            <div className="workspace-note">
              <p className="field-label">参考图规则</p>
              <p className="body-muted mt-2">
                支持参考图的模式会直接提供上传入口；不支持的模式会明确说明，不再无声隐藏。
              </p>
            </div>
            <div className="workspace-note">
              <p className="field-label">结果衔接</p>
              <p className="body-muted mt-2">
                结果区保留详情、下载和镜头设定动作，后续可直接进入镜头详情或图片详情继续验收。
              </p>
            </div>
          </aside>
        </div>
      </PageSection>
    </PageShell>
  )
}
