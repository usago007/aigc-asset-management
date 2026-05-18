import { useState, useRef, useCallback, type ReactNode } from 'react'
import { ImagePlus, Mic, Send, X } from 'lucide-react'

interface JimengInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  disabled?: boolean
  placeholder?: string
  maxChars?: number
  leftActions?: ReactNode
  bottomActions?: ReactNode
  imageUpload?: {
    images: { url: string; base64: string }[]
    maxImages: number
    onUpload: (files: FileList | null) => void
    onRemove: (index: number) => void
  }
  imageUploadLabel?: string
  videoUpload?: {
    video: { url: string; base64: string } | null
    onUpload: (file: File | null) => void
    onRemove: () => void
  }
  videoUploadLabel?: string
  mediaHint?: ReactNode
  showVoice?: boolean
}

export default function JimengInput({
  value,
  onChange,
  onSubmit,
  disabled = false,
  placeholder = '输入想法、剧本或上传参考，支持 "/" 使用技能',
  maxChars = 800,
  leftActions,
  bottomActions,
  imageUpload,
  imageUploadLabel = '添加图片',
  videoUpload,
  videoUploadLabel = '添加素材',
  mediaHint,
  showVoice = true,
}: JimengInputProps) {
  const [isFocused, setIsFocused] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        onSubmit()
      }
    },
    [onSubmit],
  )

  const hasValue = value.trim().length > 0
  const hasImages = imageUpload && imageUpload.images.length > 0
  const hasVideo = videoUpload && videoUpload.video !== null
  const actionShellClassName =
    'group inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-medium text-gray-600 transition-colors hover:border-gray-300 hover:bg-white hover:text-gray-900 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-50'

  return (
    <div className="relative">
      <div
        className={`rounded-[24px] border bg-white shadow-[0_16px_44px_rgba(15,23,42,0.06)] transition-colors dark:bg-gray-900 ${
          isFocused
            ? 'border-gray-900 ring-2 ring-gray-900/5 dark:border-white dark:ring-white/10'
            : 'border-gray-200 hover:border-gray-300 dark:border-gray-800 dark:hover:border-gray-700'
        }`}
      >
        {/* Image preview strip */}
        {hasImages && (
          <div className="flex gap-2 p-4 pb-0">
            {imageUpload!.images.map((img, idx) => (
              <div key={idx} className="relative group h-16 w-16 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
                <img src={img.url} alt="" className="w-full h-full object-cover" />
                <button
                  className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-gray-900 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-500 dark:bg-gray-700"
                  onClick={() => imageUpload!.onRemove(idx)}
                >
                  <X size={12} className="text-white" />
                </button>
              </div>
            ))}
            {imageUpload!.images.length < imageUpload!.maxImages && (
              <label className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 transition-colors hover:border-gray-500 dark:border-gray-700 dark:bg-gray-800">
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  className="hidden"
                  onChange={(e) => imageUpload!.onUpload(e.target.files)}
                  multiple={imageUpload!.maxImages > 1}
                />
                  <ImagePlus size={18} className="text-gray-400 dark:text-gray-500" />
              </label>
            )}
          </div>
        )}

        {/* Single media preview */}
        {hasVideo && (
          <div className="relative group mx-4 mt-3 h-16 w-24 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
            <img src={videoUpload!.video!.url} alt="" className="w-full h-full object-cover" />
            <button
              className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-gray-900 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-500 dark:bg-gray-700"
              onClick={videoUpload!.onRemove}
            >
              <X size={12} className="text-white" />
            </button>
          </div>
        )}

        {/* Textarea area */}
        <div className="relative">
          <textarea
            ref={textareaRef}
            className="w-full resize-none bg-transparent px-5 pt-5 pb-24 text-sm leading-7 text-gray-950 outline-none placeholder:text-gray-400 dark:text-gray-50"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={disabled}
            rows={3}
            maxLength={maxChars}
          />

          {/* Bottom toolbar */}
          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-4">
            <div className="min-w-0 space-y-2">
              {mediaHint ? <div className="helper-text">{mediaHint}</div> : null}
              <div className="flex flex-wrap items-center gap-2">
              {leftActions || (
                <>
                  {imageUpload && (
                    <label className={`${actionShellClassName} cursor-pointer`} title={imageUploadLabel}>
                      <input
                        type="file"
                        accept="image/jpeg,image/png"
                        className="hidden"
                        onChange={(e) => imageUpload.onUpload(e.target.files)}
                        multiple={imageUpload.maxImages > 1}
                      />
                      <ImagePlus size={16} className="text-gray-500 transition-colors group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-gray-100" />
                      <span>{imageUploadLabel}</span>
                    </label>
                  )}
                  {videoUpload && (
                    <label className={`${actionShellClassName} cursor-pointer`} title={videoUploadLabel}>
                      <input
                        type="file"
                        accept="image/jpeg,image/png"
                        className="hidden"
                        onChange={(e) => videoUpload.onUpload(e.target.files?.[0] || null)}
                      />
                      <ImagePlus size={16} className="text-gray-500 transition-colors group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-gray-100" />
                      <span>{videoUploadLabel}</span>
                    </label>
                  )}
                </>
              )}
              {bottomActions}
              </div>
            </div>

            <div className="flex items-center gap-1">
              <span className={`mr-2 text-xs font-medium ${value.length > maxChars * 0.9 ? 'text-red-500 dark:text-red-400' : 'text-gray-400 dark:text-gray-500'}`}>
                {value.length}/{maxChars}
              </span>
              {showVoice && (
                <button
                  className="group rounded-xl p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                  title="语音输入"
                  disabled={disabled}
                >
                  <Mic size={18} className="text-gray-500 transition-colors group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-gray-100" />
                </button>
              )}
              <button
                className={`rounded-xl p-2 font-medium transition-colors ${
                  hasValue && !disabled
                    ? 'bg-gray-950 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-950 dark:hover:bg-gray-200'
                    : 'bg-gray-200 text-gray-400 dark:bg-gray-800 dark:text-gray-500'
                }`}
                onClick={onSubmit}
                disabled={!hasValue || disabled}
                title="提交生成"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
