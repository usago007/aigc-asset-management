import VideoCreationWorkspace from '@/components/VideoCreationWorkspace'
import { PageIntro, PageSection, PageShell } from '@/components/PageShell'

export default function VideoGeneration() {
  return (
    <PageShell className="page-shell-workbench">
      <PageIntro
        title="视频创作"
      />

      <PageSection className="workspace-stage p-0">
        <div className="workspace-stage-header px-6 pt-6">
          <div>
            <h2 className="workspace-stage-title">视频生成工作台</h2>
          </div>
        </div>
        <div className="px-6 pt-5 pb-6">
          <VideoCreationWorkspace contextMode="global" />
        </div>
      </PageSection>
    </PageShell>
  )
}
