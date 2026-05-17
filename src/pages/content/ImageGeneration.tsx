import ImageCreationWorkspace from '@/components/ImageCreationWorkspace'

export default function ImageGeneration() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <ImageCreationWorkspace contextMode="global" />
    </div>
  )
}
