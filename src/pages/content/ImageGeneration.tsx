import ImageCreationWorkspace from '@/components/ImageCreationWorkspace'
import { PageIntro, PageSection, PageShell } from '@/components/PageShell'

export default function ImageGeneration() {
  return (
    <PageShell className="page-shell-workbench">
      <PageIntro
        title="图片创作"
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
