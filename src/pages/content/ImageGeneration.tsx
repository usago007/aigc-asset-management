import ImageCreationWorkspace from '@/components/ImageCreationWorkspace'
import { PageIntro, PageSection, PageShell } from '@/components/PageShell'

export default function ImageGeneration() {
  return (
    <PageShell className="page-shell-workbench">
      <PageIntro
        eyebrow="内容中心 / AI 创作"
        title="图片创作"
        description="从提示词、参考图和模型参数出发生成可追溯的视觉资产，并将结果直接沉淀到项目与镜头。"
      />

      <PageSection className="workspace-stage p-0">
        <div className="workspace-stage-header px-6 pt-6">
          <div>
            <h2 className="workspace-stage-title">图片生成工作台</h2>
          </div>
        </div>
        <div className="px-6 pt-5 pb-6">
          <ImageCreationWorkspace contextMode="global" />
        </div>
      </PageSection>
    </PageShell>
  )
}
